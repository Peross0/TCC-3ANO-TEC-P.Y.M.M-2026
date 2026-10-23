import React, { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SessionContext } from '../../context/SessionContext';
import { useAppPreferences } from '../../context/PreferencesContext';
import { apiFetch, getAssetUrl } from '../../lib/api';
import AnimatedScreen from '../../components/layout/AnimatedScreen';

const accountType = {
  CANDIDATE: 'Candidato(a)',
  RECRUITER: 'Recrutador(a)',
  ADMIN: 'Administrador(a)',
};

export default function AccountScreen() {
  const router = useRouter();
  const { sessionData, setSessionData } = useContext(SessionContext);
  const { colors, preferences } = useAppPreferences();
  const styles = makeStyles(colors, preferences.large_text);
  const [savingNotifications, setSavingNotifications] = useState(false);

  const user = sessionData?.user;
  const profile = sessionData?.profile;
  const name = profile?.full_name || user?.full_name || 'Seu perfil';
  const email = profile?.email || user?.email || 'Entre para acessar sua conta';
  const avatar = getAssetUrl(profile?.avatar_url || user?.avatar_url);
  const isCandidate = user?.user_type === 'CANDIDATE';
  const notificationsEnabled = Boolean(
    sessionData?.settings?.active_notification ?? user?.active_notification,
  );

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
        <StatusBar
          barStyle={colors.background === '#101822' || colors.background === '#000000' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heading}>
            <View style={styles.headingIcon}><Feather name="user" size={19} color={colors.tint} /></View>
            <Text style={styles.eyebrow}>SUA ÁREA PESSOAL</Text>
            <Text style={styles.title}>Conta e perfil</Text>
            <Text style={styles.subtitle}>Seus dados e preferências em um só lugar.</Text>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.identity}>
              <View style={styles.avatar}>
                {avatar
                  ? <Image source={{ uri: avatar }} style={styles.avatarImage} />
                  : <Feather name="user" size={29} color={colors.tint} />}
              </View>
              <View style={styles.identityCopy}>
                <Text style={styles.name} numberOfLines={1}>{name}</Text>
                <Text style={styles.email} numberOfLines={1}>{email}</Text>
                {user?.user_type ? (
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{accountType[user.user_type] || 'Conta ConectaFácil'}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {user ? (
              <>
                <View style={styles.divider} />
                {profile?.phone || user?.phone ? (
                  <DetailRow styles={styles} colors={colors} icon="phone" value={profile?.phone || user?.phone} />
                ) : null}
                {isCandidate && profile?.course ? (
                  <DetailRow styles={styles} colors={colors} icon="book-open" value={profile.course} />
                ) : null}
                <ActionButton
                  styles={styles}
                  colors={colors}
                  icon="edit-2"
                  title="Editar perfil"
                  onPress={() => router.push('/perfil')}
                />
              </>
            ) : (
              <ActionButton
                styles={styles}
                colors={colors}
                icon="log-in"
                title="Entrar na conta"
                onPress={() => router.replace('/')}
              />
            )}
          </View>

          {user ? (
            <>
              {isCandidate && (
                <ActionButton
                  styles={styles}
                  colors={colors}
                  icon="bookmark"
                  title="Vagas salvas"
                  subtitle="Acesse suas oportunidades favoritas"
                  secondary
                  onPress={() => router.push('/salvos')}
                />
              )}

              <Text style={styles.sectionTitle}>Preferências</Text>
              <View style={styles.settingCard}>
                <View style={styles.settingIcon}><Feather name="bell" size={19} color={colors.tint} /></View>
                <View style={styles.settingCopy}>
                  <Text style={styles.settingTitle}>Notificações de oportunidades</Text>
                  <Text style={styles.settingSubtitle}>
                    {savingNotifications ? 'Salvando na sua conta...' : 'Sincronizado com o servidor'}
                  </Text>
                </View>
                {savingNotifications
                  ? <ActivityIndicator color={colors.tint} />
                  : (
                    <Switch
                      value={notificationsEnabled}
                      onValueChange={updateNotifications}
                      accessibilityLabel="Notificações de oportunidades"
                      trackColor={{ false: colors.line, true: colors.tint }}
                      thumbColor={colors.surface}
                    />
                  )}
              </View>
            </>
          ) : null}

          <ActionButton
            styles={styles}
            colors={colors}
            icon="settings"
            title="Configurações"
            subtitle="Tema, acessibilidade, ajuda e mais"
            secondary
            onPress={() => router.push('/configuracoes')}
          />
        </ScrollView>
      </SafeAreaView>
    </AnimatedScreen>
  );
}

function DetailRow({ styles, colors, icon, value }) {
  return (
    <View style={styles.detailRow}>
      <Feather name={icon} size={17} color={colors.muted} />
      <Text style={styles.detailText}>{value}</Text>
    </View>
  );
}

function ActionButton({ styles, colors, icon, title, subtitle, onPress, secondary = false }) {
  return (
    <TouchableOpacity
      style={secondary ? styles.secondaryButton : styles.primaryButton}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
    >
      <View style={styles.settingIcon}><Feather name={icon} size={19} color={colors.tint} /></View>
      <View style={styles.settingCopy}>
        <Text style={styles.actionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
      </View>
      <Feather name="chevron-right" size={21} color={colors.muted} />
    </TouchableOpacity>
  );
}

function makeStyles(colors, largeText) {
  const scale = largeText ? 1.18 : 1;
  return StyleSheet.create({
    container: { backgroundColor: colors.background, flex: 1 },
    content: { gap: 14, padding: 20, paddingBottom: 36 },
    heading: { paddingBottom: 6 },
    headingIcon: {
      alignItems: 'center',
      backgroundColor: colors.primaryWash,
      borderRadius: 18,
      height: 38,
      justifyContent: 'center',
      marginBottom: 12,
      width: 38,
    },
    eyebrow: { color: colors.tint, fontSize: 10 * scale, fontWeight: '800', letterSpacing: 1.4 },
    title: { color: colors.text, fontSize: 27 * scale, fontWeight: '900', marginTop: 5 },
    subtitle: { color: colors.muted, fontSize: 13 * scale, marginTop: 5 },
    profileCard: {
      backgroundColor: colors.surface,
      borderColor: colors.line,
      borderRadius: 20,
      borderWidth: 1,
      padding: 17,
    },
    identity: { alignItems: 'center', flexDirection: 'row', gap: 14 },
    avatar: {
      alignItems: 'center',
      backgroundColor: colors.primaryWash,
      borderRadius: 32,
      height: 64,
      justifyContent: 'center',
      overflow: 'hidden',
      width: 64,
    },
    avatarImage: { height: '100%', width: '100%' },
    identityCopy: { flex: 1 },
    name: { color: colors.text, fontSize: 17 * scale, fontWeight: '800' },
    email: { color: colors.muted, fontSize: 12 * scale, marginTop: 3 },
    roleBadge: { alignSelf: 'flex-start', backgroundColor: colors.primaryWash, borderRadius: 20, marginTop: 8, paddingHorizontal: 9, paddingVertical: 4 },
    roleText: { color: colors.text, fontSize: 10 * scale, fontWeight: '700' },
    divider: { backgroundColor: colors.line, height: StyleSheet.hairlineWidth, marginVertical: 15 },
    detailRow: { alignItems: 'center', flexDirection: 'row', gap: 10, marginBottom: 12 },
    detailText: { color: colors.text, flex: 1, fontSize: 13 * scale },
    primaryButton: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.line,
      borderRadius: 15,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 12,
      minHeight: 60,
      padding: 13,
    },
    secondaryButton: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.line,
      borderRadius: 15,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 12,
      minHeight: 64,
      padding: 13,
    },
    actionTitle: { color: colors.text, flex: 1, fontSize: 14 * scale, fontWeight: '700' },
    settingIcon: { alignItems: 'center', backgroundColor: colors.primaryWash, borderRadius: 13, height: 40, justifyContent: 'center', width: 40 },
    settingCopy: { flex: 1 },
    settingSubtitle: { color: colors.muted, fontSize: 11 * scale, lineHeight: 16 * scale, marginTop: 4 },
    sectionTitle: { color: colors.text, fontSize: 17 * scale, fontWeight: '800', marginTop: 7 },
    settingCard: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.line,
      borderRadius: 15,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 12,
      minHeight: 78,
      padding: 14,
    },
    settingTitle: { color: colors.text, fontSize: 13 * scale, fontWeight: '700' },
  });
}
