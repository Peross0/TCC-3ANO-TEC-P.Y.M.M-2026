import React, { useState } from 'react';
import { Image, Platform, View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAppPreferences } from '../../context/PreferencesContext';

export default function Header({
  showNotification,
  onToggleNotification,
  onGoToSettings,
  isSettingsActive,
  onToggleProfileMenu,
  onOpenMessages,
  avatarUri,
}) {
  const [failedAvatarUri, setFailedAvatarUri] = useState(null);
  const { colors, preferences } = useAppPreferences();
  const styles = makeStyles(colors, preferences.large_text);
  const showAvatar = avatarUri && failedAvatarUri !== avatarUri;
  const iconColor = colors.inkSoft || colors.text;

  return (
    <View style={styles.header}>
      <View style={styles.searchBar}>
        <Feather name="search" size={20} color={colors.muted} />
        <TextInput
          placeholder="Pesquisa"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
      </View>

      <TouchableOpacity
        style={styles.headerIconBtn}
        onPress={onOpenMessages}
        activeOpacity={0.7}
      >
        <Feather name="message-square" size={23} color={iconColor} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.headerIconBtn}
        onPress={onToggleNotification}
      >
        <Feather
          name="bell"
          size={24}
          color={showNotification ? colors.tint : iconColor}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.headerIconBtn}
        onPress={onGoToSettings}
        activeOpacity={0.7}
      >
        <Ionicons
          name="settings-sharp"
          size={24}
          color={isSettingsActive ? colors.tint : iconColor}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={onToggleProfileMenu}
      >
        {showAvatar
          ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} onError={() => setFailedAvatarUri(avatarUri)} />
          : <Feather name="user" size={24} color={iconColor} />}
      </TouchableOpacity>
    </View>
  );
}

function makeStyles(colors, largeText) {
  const scale = largeText ? 1.1 : 1;
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
    fontSize: 16 * scale,
    color: colors.text,
  },
  headerIconBtn: {
    padding: 4,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryWash,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  });
}