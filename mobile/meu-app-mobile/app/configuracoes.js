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
import { SessionContext } from '../context/SessionContext';
import { useAppPreferences } from '../context/PreferencesContext';
import { apiFetch, getAssetUrl } from '../lib/api';
import AnimatedScreen from '../components/layout/AnimatedScreen';

const settingsItems = [
  { id: 'preferencias', title: 'Preferências', subtitle: 'Notificações e opções da conta', icon: 'sliders' },
  { id: 'tema', title: 'Tema', subtitle: 'Claro, escuro ou seguir o sistema', icon: 'moon' },
  { id: 'acessibilidade', title: 'Acessibilidade', subtitle: 'Texto, contraste e animações', icon: 'eye' },
  { id: 'ajuda', title: 'Ajuda', subtitle: 'Perguntas e suporte', icon: 'help-circle' },
  { id: 'sobre', title: 'Sobre', subtitle: 'Informações do ConectaFácil', icon: 'info' },
];

export default function ConfiguracoesScreen() {
  const router = useRouter();
  const { sessionData, setSessionData } = useContext(SessionContext);
  const { colors, syncError } = useAppPreferences();
  const styles = makeStyles(colors);
  const [savingNotifications, setSavingNotifications] = useState(false);

  const user = sessionData?.user;
  const name = sessionData?.profile?.full_name || user?.full_name || 'Sua conta';
  const avatar = getAssetUrl(sessionData?.profile?.avatar_url || user?.avatar_url);
  const notificationsEnabled = Boolean(
    sessionData?.settings?.active_notification ?? user?.active_notification,
  );

  const updateNotifications = async (activeNotification) => {
    if (savingNotifications || !user) return;
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
      Alert.alert(
        'Não foi possível atualizar',
        error instanceof TypeError ? 'Não foi possível conectar ao servidor.' : error.message,
      );
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
            accessibilityLabel="Voltar"
          >
            <Feather name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Configurações</Text>
            <Text style={styles.subtitle}>Sua conta, do seu jeito</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.accountCard}
            onPress={() => router.push('/perfil')}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <View style={styles.avatar}>
              {avatar
                ? <Image source={{ uri: avatar }} style={styles.avatarImage} />
                : <Feather name="user" size={23} color={colors.tint} />}
            </View>
            <View style={styles.accountCopy}>
              <Text style={styles.accountName} numberOfLines={1}>{name}</Text>
              <Text style={styles.accountEmail} numberOfLines={1}>
                {sessionData?.profile?.email || user?.email || ''}
              </Text>
              <Text style={styles.accountAction}>Editar dados do perfil</Text>
            </View>
            <Feather name="chevron-right" size={21} color={colors.muted} />
          </TouchableOpacity>

          {user?.user_type === 'CANDIDATE' && (
            <TouchableOpacity
              style={styles.savedCard}
              onPress={() => router.push('/salvos')}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              <View style={styles.iconBox}><Feather name="bookmark" size={19} color={colors.tint} /></View>
              <View style={styles.itemCopy}>
                <Text style={styles.itemTitle}>Vagas salvas</Text>
                <Text style={styles.itemSubtitle}>Veja e gerencie suas oportunidades favoritas</Text>
              </View>
              <Feather name="chevron-right" size={21} color={colors.muted} />
            </TouchableOpacity>
          )}

          <View style={styles.notificationCard}>
            <View style={styles.iconBox}><Feather name="bell" size={19} color={colors.tint} /></View>
            <View style={styles.itemCopy}>
              <Text style={styles.itemTitle}>Notificações de oportunidades</Text>
              <Text style={styles.itemSubtitle}>
                {savingNotifications ? 'Salvando na sua conta...' : 'Preferência sincronizada com o servidor'}
              </Text>
            </View>
            {savingNotifications
              ? <ActivityIndicator color={colors.tint} />
              : (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={updateNotifications}
                  disabled={!user}
                  accessibilityLabel="Notificações de oportunidades"
                  trackColor={{ false: colors.line, true: colors.tint }}
                  thumbColor={colors.surface}
                />
              )}
          </View>

          <Text style={styles.sectionTitle}>Personalização e suporte</Text>
          {settingsItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              onPress={() => router.push(`/configuracoes/${item.id}`)}
              activeOpacity={0.75}
              accessibilityRole="button"
            >
              <View style={styles.iconBox}><Feather name={item.icon} size={19} color={colors.tint} /></View>
              <View style={styles.itemCopy}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              </View>
              <Feather name="chevron-right" size={21} color={colors.muted} />
            </TouchableOpacity>
          ))}
          {syncError ? <Text style={styles.syncError}>{syncError}</Text> : null}
        </ScrollView>
      </SafeAreaView>
    </AnimatedScreen>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: { backgroundColor: colors.background, flex: 1 },
    header: {
      alignItems: 'center',
      borderBottomColor: colors.line,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      gap: 14,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    backButton: { padding: 7 },
    title: { color: colors.text, fontSize: 22, fontWeight: '800' },
    subtitle: { color: colors.muted, fontSize: 12, marginTop: 3 },
    content: { gap: 12, padding: 18, paddingBottom: 36 },
    accountCard: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.line,
      borderRadius: 18,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 13,
      marginBottom: 4,
      padding: 16,
    },
    avatar: {
      alignItems: 'center',
      backgroundColor: colors.primaryWash,
      borderRadius: 28,
      height: 56,
      justifyContent: 'center',
      overflow: 'hidden',
      width: 56,
    },
    avatarImage: { height: '100%', width: '100%' },
    accountCopy: { flex: 1 },
    accountName: { color: colors.text, fontSize: 16, fontWeight: '800' },
    accountEmail: { color: colors.muted, fontSize: 12, marginTop: 3 },
    accountAction: { color: colors.tint, fontSize: 12, fontWeight: '700', marginTop: 7 },
    savedCard: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.line,
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 12,
      padding: 15,
    },
    notificationCard: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.line,
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 12,
      padding: 15,
    },
    iconBox: {
      alignItems: 'center',
      backgroundColor: colors.primaryWash,
      borderRadius: 13,
      height: 42,
      justifyContent: 'center',
      width: 42,
    },
    itemCopy: { flex: 1 },
    itemTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
    itemSubtitle: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 4 },
    sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginBottom: 1, marginTop: 12 },
    menuCard: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.line,
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 12,
      padding: 14,
    },
    syncError: { color: '#D24B4B', fontSize: 12, lineHeight: 18, padding: 4 },
  });
}
