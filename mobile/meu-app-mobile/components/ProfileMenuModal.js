import React from 'react';
import { View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

const colors = Colors.light;

export default function ProfileMenuModal({ visible, onClose, onGoToProfile, onLogout }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.profileDropdown}>
            <TouchableOpacity style={styles.dropdownOption} onPress={onGoToProfile}>
              <Feather name="edit-2" size={16} color={colors.inkSoft} />
              <Text style={styles.dropdownText}>Ver perfil</Text>
            </TouchableOpacity>

            <View style={styles.dropdownDivider} />

            <TouchableOpacity style={styles.dropdownOption} onPress={onLogout}>
              <Feather name="log-out" size={16} color={colors.inkSoft} />
              <Text style={styles.dropdownText}>Sair</Text>
            </TouchableOpacity>
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
  profileDropdown: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 6,
    width: 140,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
  },
  dropdownText: { fontSize: 14, color: colors.text, fontWeight: '500' },
  dropdownDivider: { height: 1, backgroundColor: colors.line, marginVertical: 2 },
});