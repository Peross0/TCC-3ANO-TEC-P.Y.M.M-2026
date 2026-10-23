import React, { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AnimatedScreen from '../../components/layout/AnimatedScreen';
import { useAppPreferences } from '../../context/PreferencesContext';
import { SessionContext } from '../../context/SessionContext';
import { apiFetch } from '../../lib/api';

const SECTIONS = {
  preferencias: { title: 'Preferências', subtitle: 'Opções sincronizadas com sua conta', icon: 'sliders' },
  tema: { title: 'Tema', subtitle: 'Escolha a aparência do aplicativo', icon: 'moon' },
  acessibilidade: { title: 'Acessibilidade', subtitle: 'Adapte a experiência às suas necessidades', icon: 'eye' },
  ajuda: { title: 'Ajuda', subtitle: 'Respostas para as dúvidas mais comuns', icon: 'help-circle' },
  sobre: { title: 'Sobre', subtitle: 'Conheça o ConectaFácil', icon: 'info' },
};

const FAQ_ITEMS = [
  {
    question: 'Como salvar uma vaga?',
    answer: 'Toque no ícone de marcador em um cartão de vaga. Ela ficará disponível em Configurações > Vagas salvas.',
  },
  {
    question: 'Como atualizar meus dados?',
    answer: 'Abra a página Conta e perfil e toque em Editar perfil. As alterações compatíveis são enviadas para sua conta.',
  },
  {
    question: 'Minhas preferências acompanham minha conta?',
    answer: 'Sim. Tema e opções de acessibilidade são sincronizados com o backend quando você está conectado.',
  },
  {
    question: 'Não consigo carregar minhas informações. O que faço?',
    answer: 'Verifique sua conexão e tente novamente. Se o problema continuar, entre em contato com o suporte da sua instituição.',
  },
];

export default function ConfigurationSectionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const sectionId = Array.isArray(params.section) ? params.section[0] : params.section;
  const section = SECTIONS[sectionId];
  const { sessionData, setSessionData } = useContext(SessionContext);
  const {
    colors,
    preferences,
    loading,
    saving,
    syncError,
    refreshPreferences,
    updatePreferences,
  } = useAppPreferences();
  const styles = makeStyles(colors, preferences.large_text);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const user = sessionData?.user;
  const notificationsEnabled = Boolean(
    sessionData?.settings?.active_notification ?? user?.active_notification,
  );

  if (!section) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.error}>Esta opção de configuração não existe.</Text>
      </SafeAreaView>
    );
  }

  const savePreference = async (change) => {
    try {
      await updatePreferences(change);
    } catch (error) {
      Alert.alert('Não foi possível salvar', error.message || 'Tente novamente.');
    }
  };

  const updateNotifications = async (activeNotification) => {
    if (!user || savingNotifications) return;
    setSavingNotifications(true);
    const path = user.user_type === 'CANDIDATE'
      ? '/candidates/notifications'
      : user.user_type === 'RECRUITER'
        ? '/recruiters/profile'
        : `/admin/users/${user.id}`;

    try {
      await apiFetch(path, {
        method: user.user_type === 'CANDIDATE' ? 'PATCH' : 'PUT',
        body: JSON.stringify({ active_notification: activeNotification }),
      });
      setSessionData((current) => ({
        ...current,
        user: { ...current.user, active_notification: activeNotification },
        profile: { ...current.profile, active_notification: activeNotification },
        settings: { ...current.settings, active_notification: activeNotification },
      }));
    } catch (error) {
      Alert.alert('Não foi possível atualizar', error.message || 'Tente novamente.');
    } finally {
      setSavingNotifications(false);
    }
  };

  return (
    <AnimatedScreen>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={colors.text === '#F3F7FC' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Voltar para configurações"
          >
            <Feather name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerIcon}><Feather name={section.icon} size={19} color={colors.tint} /></View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{section.title}</Text>
            <Text style={styles.subtitle}>{section.subtitle}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {sectionId === 'tema' && (
            <>
              {['system', 'light', 'dark'].map((theme) => {
                const labels = { system: 'Seguir o sistema', light: 'Claro', dark: 'Escuro' };
                const descriptions = {
                  system: 'Usa a aparência configurada no seu aparelho.',
                  light: 'Fundo claro e leitura confortável durante o dia.',
                  dark: 'Fundo escuro para ambientes com pouca luz.',
                };
                const selected = preferences.theme === theme;
                return (
                  <TouchableOpacity
                    key={theme}
                    style={[styles.choiceCard, selected && styles.selectedCard]}
                    onPress={() => savePreference({ theme })}
                    disabled={saving}
                    accessibilityRole="radio"
                    accessibilityState={{ selected, disabled: saving }}
                  >
                    <View style={styles.choiceCopy}>
                      <Text style={styles.choiceTitle}>{labels[theme]}</Text>
                      <Text style={styles.rowSubtitle}>{descriptions[theme]}</Text>
                    </View>
                    {selected
                      ? <Feather name="check-circle" size={21} color={colors.tint} />
                      : <View style={styles.radio} />}
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          {sectionId === 'acessibilidade' && (
            <>
              <PreferenceSwitch
                colors={colors}
                title="Texto maior"
                description="Aumenta o tamanho das letras nas telas de conta e configurações."
                value={preferences.large_text}
                disabled={saving}
                onChange={(large_text) => savePreference({ large_text })}
              />
              <PreferenceSwitch
                colors={colors}
                title="Alto contraste"
                description="Reforça o contraste de cores nas telas do aplicativo."
                value={preferences.high_contrast}
                disabled={saving}
                onChange={(high_contrast) => savePreference({ high_contrast })}
              />
              <PreferenceSwitch
                colors={colors}
                title="Reduzir animações"
                description="Desativa movimentos decorativos para uma navegação mais simples."
                value={preferences.reduce_motion}
                disabled={saving}
                onChange={(reduce_motion) => savePreference({ reduce_motion })}
              />
            </>
          )}

          {sectionId === 'preferencias' && (
            <>
              <PreferenceSwitch
                colors={colors}
                title="Notificações de oportunidades"
                description="Receba avisos de novas vagas relevantes."
                value={notificationsEnabled}
                disabled={savingNotifications || !user}
                onChange={updateNotifications}
                busy={savingNotifications}
              />
              <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/configuracoes/tema')}>
                <Feather name="moon" size={19} color={colors.tint} />
                <Text style={styles.linkText}>Aparência e tema</Text>
                <Feather name="chevron-right" size={20} color={colors.muted} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/configuracoes/acessibilidade')}>
                <Feather name="eye" size={19} color={colors.tint} />
                <Text style={styles.linkText}>Acessibilidade</Text>
                <Feather name="chevron-right" size={20} color={colors.muted} />
              </TouchableOpacity>
            </>
          )}

          {sectionId === 'ajuda' && (
            <>
              <View style={styles.introCard}>
                <Text style={styles.introTitle}>Como podemos ajudar?</Text>
                <Text style={styles.rowSubtitle}>Toque em uma pergunta para ver a resposta.</Text>
              </View>
              {FAQ_ITEMS.map((item, index) => {
                const expanded = expandedFaq === index;
                return (
                  <TouchableOpacity
                    key={item.question}
                    style={styles.faqCard}
                    onPress={() => setExpandedFaq(expanded ? null : index)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityState={{ expanded }}
                  >
                    <View style={styles.faqHeading}>
                      <Text style={styles.choiceTitle}>{item.question}</Text>
                      <Feather name={expanded ? 'minus' : 'plus'} size={19} color={colors.tint} />
                    </View>
                    {expanded ? <Text style={styles.answer}>{item.answer}</Text> : null}
                  </TouchableOpacity>
                );
              })}
              <Text style={styles.footnote}>Para suporte individual, procure o canal de atendimento da sua instituição.</Text>
            </>
          )}

          {sectionId === 'sobre' && (
            <>
              <View style={styles.aboutHero}>
                <View style={styles.brandMark}><Feather name="link" size={30} color={colors.surface} /></View>
                <Text style={styles.aboutName}>ConectaFácil</Text>
                <Text style={styles.rowSubtitle}>Conectando talentos a novas oportunidades.</Text>
              </View>
              <View style={styles.infoCard}>
                <InfoRow colors={colors} label="Versão" value={Constants.expoConfig?.version || '1.0.0'} />
                <View style={styles.separator} />
                <InfoRow colors={colors} label="Plataforma" value="Aplicativo móvel" />
                <View style={styles.separator} />
                <InfoRow colors={colors} label="Dados da conta" value="Gerenciados com segurança" />
              </View>
              <Text style={styles.footnote}>Este aplicativo aproxima candidatos, empresas e oportunidades de estágio e primeiro emprego.</Text>
            </>
          )}

          {loading || saving ? <ActivityIndicator style={styles.loader} color={colors.tint} /> : null}
          {syncError ? (
            <View style={styles.syncErrorCard}>
              <Text style={styles.error}>{syncError}</Text>
              <TouchableOpacity onPress={refreshPreferences} accessibilityRole="button">
                <Text style={styles.retry}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </AnimatedScreen>
  );
}

function PreferenceSwitch({ colors, title, description, value, disabled, onChange, busy = false }) {
  const { preferences } = useAppPreferences();
  const styles = makeStyles(colors, preferences.large_text);
  return (
    <View style={styles.switchCard}>
      <View style={styles.switchCopy}>
        <Text style={styles.choiceTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{description}</Text>
      </View>
      {busy
        ? <ActivityIndicator color={colors.tint} />
        : (
          <Switch
            value={Boolean(value)}
            onValueChange={onChange}
            disabled={disabled}
            accessibilityLabel={title}
            trackColor={{ false: colors.line, true: colors.tint }}
            thumbColor={colors.surface}
          />
        )}
    </View>
  );
}

function InfoRow({ colors, label, value }) {
  const { preferences } = useAppPreferences();
  const styles = makeStyles(colors, preferences.large_text);
  return (
    <View style={styles.infoRow}>
      <Text style={styles.rowSubtitle}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function makeStyles(colors, largeText) {
  const textScale = largeText ? 1.15 : 1;
  return StyleSheet.create({
    container: { backgroundColor: colors.background, flex: 1 },
    header: {
      alignItems: 'center',
      borderBottomColor: colors.line,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 18,
      paddingVertical: 14,
    },
    backButton: { padding: 7 },
    headerIcon: {
      alignItems: 'center',
      backgroundColor: colors.primaryWash,
      borderRadius: 13,
      height: 42,
      justifyContent: 'center',
      width: 42,
    },
    headerCopy: { flex: 1 },
    title: { color: colors.text, fontSize: 19 * textScale, fontWeight: '800' },
    subtitle: { color: colors.muted, fontSize: 12, marginTop: 3 },
    content: { gap: 12, padding: 18, paddingBottom: 36 },
    choiceCard: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.line,
      borderRadius: 15,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 14,
      padding: 16,
    },
    selectedCard: { borderColor: colors.tint, borderWidth: 2 },
    choiceCopy: { flex: 1 },
    choiceTitle: { color: colors.text, fontSize: 15 * textScale, fontWeight: '700' },
    rowSubtitle: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
    radio: { borderColor: colors.line, borderRadius: 10, borderWidth: 2, height: 20, width: 20 },
    switchCard: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.line,
      borderRadius: 15,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 12,
      padding: 16,
    },
    switchCopy: { flex: 1 },
    linkCard: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.line,
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 12,
      padding: 16,
    },
    linkText: { color: colors.text, flex: 1, fontSize: 14, fontWeight: '700' },
    introCard: { backgroundColor: colors.primaryWash, borderRadius: 16, padding: 18 },
    introTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
    faqCard: {
      backgroundColor: colors.surface,
      borderColor: colors.line,
      borderRadius: 14,
      borderWidth: 1,
      padding: 16,
    },
    faqHeading: { alignItems: 'center', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
    answer: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 12 },
    footnote: { color: colors.muted, fontSize: 12, lineHeight: 18, paddingHorizontal: 3, paddingVertical: 6 },
    aboutHero: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: 18, padding: 26 },
    brandMark: {
      alignItems: 'center',
      backgroundColor: colors.tint,
      borderRadius: 27,
      height: 54,
      justifyContent: 'center',
      width: 54,
    },
    aboutName: { color: colors.text, fontSize: 22, fontWeight: '900', marginTop: 12 },
    infoCard: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 15, borderWidth: 1, paddingHorizontal: 16 },
    infoRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 52 },
    infoValue: { color: colors.text, fontSize: 13, fontWeight: '700' },
    separator: { backgroundColor: colors.line, height: StyleSheet.hairlineWidth },
    loader: { marginTop: 8 },
    syncErrorCard: { backgroundColor: colors.surface, borderRadius: 12, gap: 8, padding: 14 },
    error: { color: '#C63D3D', fontSize: 13, lineHeight: 19 },
    retry: { color: colors.tint, fontSize: 13, fontWeight: '800' },
  });
}
