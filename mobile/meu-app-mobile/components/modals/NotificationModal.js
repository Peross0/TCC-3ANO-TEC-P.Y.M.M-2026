import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet, Platform } from 'react-native';
import { Colors } from '../constants/theme';

const colors = Colors.light;

export default function NotificationModal({ visible, onClose }) {
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
          <Text style={styles.notificationTitle}>1 Notificação</Text>
          <View style={styles.notificationCard}>
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>P</Text>
            </View>
            <View>
              <Text style={styles.notifCompany}>Pinheirão</Text>
              <Text style={styles.notifSub}>Supermercado</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backdrop: { ...StyleSheet.absoluteFillObject },
  notificationDropdown: {
    position: 'absolute',
    top: 60,
    right: 80,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 10,
    width: 180,
    elevation: 5,
    ...Platform.select({
      web: { boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.15)' },
      default: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 5 },
    }),
  },
  notificationTitle: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
    color: colors.text,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryWash,
    padding: 6,
    borderRadius: 8,
    gap: 8,
  },
  notificationBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.lime,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: colors.text, fontSize: 10, fontWeight: 'bold' },
  notifCompany: { fontSize: 11, fontWeight: 'bold', color: colors.text },
  notifSub: { fontSize: 9, color: colors.muted },
});