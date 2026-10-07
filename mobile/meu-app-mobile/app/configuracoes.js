import React, { useContext, useState } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/theme';
import { SessionContext } from '../context/SessionContext';
import { apiFetch } from '../lib/api';

const colors = Colors.light;

export default function ConfiguracoesScreen() {
  const router = useRouter();
  const { sessionData, setSessionData } = useContext(SessionContext);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const notificationsEnabled = Boolean(sessionData?.settings?.active_notification);

  const updateNotifications = async (activeNotification) => {
    if (savingNotifications) return;
    setSavingNotifications(true);
    try {
      const user = sessionData?.user;
      const path = user?.user_type === 'CANDIDATE'
        ? '/candidates/notifications'
        : user?.user_type === 'RECRUITER'
          ? '/recruiters/profile'
          : `/admin/users/${user?.id}`;
      await apiFetch(path, {
        method: user?.user_type === 'CANDIDATE' ? 'PATCH' : 'PUT',
        body: JSON.stringify({ active_notification: activeNotification }),
      });
      setSessionData((current) => ({
        ...current,
        user: { ...current.user, active_notification: activeNotification },
        settings: { ...current.settings, active_notification: activeNotification },
      }));
    } catch (error) {
      Alert.alert('Não foi possível atualizar', error instanceof TypeError
        ? 'Não foi possível conectar ao servidor.'
        : error.message);
    } finally {
      setSavingNotifications(false);
    }
  };

  const menuItems = [
    { title: 'Salvos', icon: <Feather name="bookmark" size={22} color={colors.tint} /> },
    { title: 'Preferencias', icon: <Ionicons name="options-outline" size={22} color={colors.tint} /> },
    { title: 'Tema', icon: <MaterialCommunityIcons name="format-paint" size={22} color={colors.tint} /> },
    { title: 'Acessibilidade', icon: <Ionicons name="body-outline" size={22} color={colors.tint} /> },
    { title: 'Ajuda', icon: <Feather name="help-circle" size={22} color={colors.tint} /> },
    { title: 'Sobre', icon: <Feather name="info" size={22} color={colors.tint} /> },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Botão de Voltar Simples */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.accountCard}>
          <View style={styles.accountIcon}>
            <Feather name="user" size={19} color={colors.primaryDark} />
          </View>
          <View style={styles.accountDetails}>
            <Text style={styles.accountName}>{sessionData?.profile?.full_name || sessionData?.user?.full_name}</Text>
            <Text style={styles.accountEmail}>{sessionData?.profile?.email || sessionData?.user?.email}</Text>
          </View>
        </View>

        <View style={styles.notificationCard}>
          <View style={styles.notificationCopy}>
            <Text style={styles.notificationTitle}>Notificações de oportunidades</Text>
            <Text style={styles.notificationSubtitle}>Preferência salva na sua conta</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={updateNotifications}
            disabled={savingNotifications}
            trackColor={{ false: colors.line, true: '#9CDCF9' }}
            thumbColor={notificationsEnabled ? colors.tint : '#FFFFFF'}
          />
        </View>

        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuCard} activeOpacity={0.7}>
            <View style={styles.menuLeft}>
              {item.icon}
              <Text style={styles.menuText}>{item.title}</Text>
            </View>
            <Feather name="chevron-right" size={24} color={colors.muted} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backBtn: { paddingRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  content: { paddingHorizontal: 24, paddingTop: 20 },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 12,
  },
  accountIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primaryWash, alignItems: 'center', justifyContent: 'center' },
  accountDetails: { flex: 1 },
  accountName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  accountEmail: { color: colors.muted, fontSize: 12, marginTop: 3 },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 16,
  },
  notificationCopy: { flex: 1, paddingRight: 12 },
  notificationTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  notificationSubtitle: { color: colors.muted, fontSize: 12, marginTop: 4 },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  menuText: { fontSize: 18, fontWeight: '500', color: colors.text },
});