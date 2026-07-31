import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function Header({
  showNotification,
  onToggleNotification,
  onGoToSettings,
  isSettingsActive,
  onToggleProfileMenu,
}) {
  return (
    <View style={styles.header}>
      <View style={styles.searchBar}>
        <Feather name="search" size={20} color="#8E8E93" />
        <TextInput
          placeholder="Pesquisa"
          placeholderTextColor="#8E8E93"
          style={styles.searchInput}
        />
      </View>

      {/* Notificação */}
      <TouchableOpacity
        style={styles.headerIconBtn}
        onPress={onToggleNotification}
      >
        <Feather
          name="bell"
          size={24}
          color={showNotification ? '#3BB7FF' : '#555'}
        />
      </TouchableOpacity>

      {/* Configurações (Cinza por padrão, azul ao clicar) */}
      <TouchableOpacity
        style={styles.headerIconBtn}
        onPress={onGoToSettings}
        activeOpacity={0.7}
      >
        <Ionicons
          name="settings-sharp"
          size={24}
          color={isSettingsActive ? '#3BB7FF' : '#555'}
        />
      </TouchableOpacity>

      {/* Perfil */}
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={onToggleProfileMenu}
      >
        <Feather name="user" size={24} color="#333" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FAFAFA',
    gap: 12,
    zIndex: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333333',
  },
  headerIconBtn: {
    padding: 4,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8BB4F7',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});