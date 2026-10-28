import { Feather, Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useAppPreferences } from '../../context/PreferencesContext';

export default function Header({
  showNotification,
  onToggleNotification,
  onGoToSettings,
  isSettingsActive,
  onToggleProfileMenu,
  onOpenMessages,
  avatarUri,
  searchText,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
}) {
  const [failedAvatarUri, setFailedAvatarUri] = useState(null);
  const { colors } = useAppPreferences();
  const styles = makeStyles(colors);
  const showAvatar = avatarUri && failedAvatarUri !== avatarUri;

  return (
    <View style={styles.header}>
      <View style={styles.searchBar}>
        <Feather name="search" size={20} color={colors.muted} />
        <TextInput
          placeholder="Pesquisa"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          value={searchText}
          onChangeText={onSearchChange}
          onSubmitEditing={onSearchSubmit}
          returnKeyType="search"
          accessibilityLabel="Pesquisar vagas por cargo, empresa, competência ou localização"
        />
        {searchText ? (
          <TouchableOpacity onPress={onClearSearch} accessibilityRole="button" accessibilityLabel="Limpar pesquisa">
            <Feather name="x-circle" size={18} color={colors.muted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.headerIconBtn}
        onPress={onOpenMessages}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Abrir mensagens"
      >
        <Feather name="message-square" size={23} color={colors.inkSoft} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.headerIconBtn}
        onPress={onToggleNotification}
        accessibilityRole="button"
        accessibilityLabel="Ver atualizações de candidaturas"
      >
        <Feather
          name="bell"
          size={24}
          color={showNotification ? colors.tint : colors.inkSoft}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.headerIconBtn}
        onPress={onGoToSettings}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Abrir configurações"
      >
        <Ionicons
          name="settings-sharp"
          size={24}
          color={isSettingsActive ? colors.tint : colors.inkSoft}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={onToggleProfileMenu}
        accessibilityRole="button"
        accessibilityLabel="Abrir menu do perfil"
      >
        {showAvatar
          ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} onError={() => setFailedAvatarUri(avatarUri)} />
          : <Feather name="user" size={24} color={colors.inkSoft} />}
      </TouchableOpacity>
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: colors.background,
    gap: 12,
    zIndex: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    ...Platform.select({
      web: { boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)' },
      default: {
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
    }),
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  headerIconBtn: {
    padding: 4,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.lime,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  });
}