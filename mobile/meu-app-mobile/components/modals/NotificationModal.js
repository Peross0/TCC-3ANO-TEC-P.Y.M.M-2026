import React from 'react';
import { View, Text, Modal, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import { useAppPreferences } from '../../context/PreferencesContext';

export default function NotificationModal({
  visible,
  onClose,
  notifications = [],
  onPressNotification,
  onMarkAllRead,
}) {
  const { colors } = useAppPreferences();
  const styles = makeStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fechar notificações" />
        <View style={styles.notificationDropdown}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>
              {notifications.length ? `Notificações (${notifications.length})` : 'Notificações'}
            </Text>
            {notifications.length > 0 && (
              <Pressable onPress={onMarkAllRead} accessibilityRole="button">
                <Text style={styles.markRead}>Marcar como lidas</Text>
              </Pressable>
            )}
          </View>
          {notifications.length ? (
            <ScrollView style={styles.notificationList} keyboardShouldPersistTaps="handled">
              {notifications.map((notification) => (
                <Pressable
                  key={notification.id}
                  style={styles.notificationCard}
                  onPress={() => onPressNotification?.(notification)}
                  accessibilityRole="button"
                >
                  <View style={styles.notificationBadge}>
                    <Text style={styles.badgeText}>M</Text>
                  </View>
                  <View style={styles.notificationCopy}>
                    <Text style={styles.notifCompany} numberOfLines={1}>{notification.title}</Text>
                    <Text style={styles.notifSub} numberOfLines={1}>{notification.jobTitle}</Text>
                    <Text style={styles.notificationMessage} numberOfLines={2}>{notification.body}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>Você não tem novas mensagens.</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backdrop: { ...StyleSheet.absoluteFillObject },
  notificationDropdown: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 10,
    width: 300,
    maxWidth: '90%',
    maxHeight: '70%',
    elevation: 5,
    ...Platform.select({
      web: { boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.15)' },
      default: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 5 },
    }),
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  notificationHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8 },
  markRead: { color: colors.primaryDark, fontSize: 10, fontWeight: '700' },
  notificationList: { flexGrow: 0 },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryWash,
    padding: 9,
    borderRadius: 8,
    gap: 9,
    marginBottom: 7,
  },
  notificationBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: colors.buttonText, fontSize: 10, fontWeight: 'bold' },
  notificationCopy: { flex: 1 },
  notifCompany: { fontSize: 12, fontWeight: 'bold', color: colors.text },
  notifSub: { fontSize: 10, color: colors.primaryDark, marginTop: 2 },
  notificationMessage: { fontSize: 11, color: colors.muted, marginTop: 4 },
  emptyText: { color: colors.muted, fontSize: 12, paddingVertical: 8 },
  });
}