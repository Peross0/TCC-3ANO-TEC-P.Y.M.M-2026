import React from 'react';
import { View, Text, Modal, TouchableWithoutFeedback, StyleSheet } from 'react-native';

export default function NotificationModal({ visible, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
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
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  notificationDropdown: {
    position: 'absolute',
    top: 60,
    right: 80,
    backgroundColor: '#EBEBEB',
    borderRadius: 12,
    padding: 10,
    width: 180,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  notificationTitle: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
    color: '#333',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D9D9D9',
    padding: 6,
    borderRadius: 8,
    gap: 8,
  },
  notificationBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E4620',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  notifCompany: { fontSize: 11, fontWeight: 'bold', color: '#222' },
  notifSub: { fontSize: 9, color: '#666' },
});