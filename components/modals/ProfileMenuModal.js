import { Feather } from '@expo/vector-icons';
import { Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppPreferences } from '../../context/PreferencesContext';

export default function ProfileMenuModal({ visible, onClose, onGoToProfile, onGoToApplications, onLogout }) {
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
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fechar menu" />
        <View style={styles.profileDropdown}>
          <TouchableOpacity style={styles.dropdownOption} onPress={onGoToProfile}>
            <Feather name="edit-2" size={16} color={colors.inkSoft} />
            <Text style={styles.dropdownText}>Ver perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dropdownOption} onPress={onGoToApplications}>
            <Feather name="file-text" size={16} color={colors.inkSoft} />
            <Text style={styles.dropdownText}>Minhas candidaturas</Text>
          </TouchableOpacity>

          <View style={styles.dropdownDivider} />

          <TouchableOpacity style={styles.dropdownOption} onPress={onLogout}>
            <Feather name="log-out" size={16} color={colors.inkSoft} />
            <Text style={styles.dropdownText}>Sair</Text>
          </TouchableOpacity>
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
    ...Platform.select({
      web: { boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.1)' },
      default: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
    }),
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
}