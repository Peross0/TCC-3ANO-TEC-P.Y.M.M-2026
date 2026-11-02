import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, theme } from '../../lib/theme';

const navigationItems = [
  { path: '/home', label: 'Início', icon: 'home' },
  { path: '/candidaturas', label: 'Candidaturas', icon: 'file-text' },
  { path: '/vagas', label: 'Vagas', icon: 'briefcase' },
  { path: '/mensagens', label: 'Mensagens', icon: 'message-circle' },
  { path: '/perfil', label: 'Meu perfil', icon: 'user' },
];

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'R';
}

function NavItem({ item, active, onPress }) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      style={[
        styles.navItem,
        active && styles.navItemActive,
        hovered && styles.navItemHovered,
        focused && styles.navItemFocused,
      ]}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: active }}
      aria-current={active ? 'page' : undefined}
      title={item.label}
    >
      <Feather
        name={item.icon}
        size={18}
        color={active ? colors.primary : colors.textSecondary}
        style={styles.navIcon}
      />
      <Text style={[styles.navText, active && styles.navTextActive]}>{item.label}</Text>
    </Pressable>
  );
}

export default function RecruiterNavigation({
  pathname,
  user,
  onNavigate,
  onSignOut,
  onClose,
  drawer = false,
}) {
  return (
    <View style={[styles.sidebar, drawer && styles.drawer]}>
      <View style={styles.sidebarHeader}>
        <Pressable
          style={styles.brand}
          onPress={() => onNavigate('/home')}
          accessibilityRole="button"
          accessibilityLabel="Conecta Fácil, início"
        >
          <View style={styles.brandMark}><Feather name="link-2" size={16} color={colors.onPrimary} /></View>
          <Text style={styles.brandText}>Conecta Fácil</Text>
        </Pressable>
        {drawer ? (
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Fechar menu"
            title="Fechar menu"
          >
            <Feather name="x" size={20} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.navigation}>
        {navigationItems.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            active={pathname === item.path}
            onPress={() => onNavigate(item.path)}
          />
        ))}
      </View>

      <View style={styles.sidebarFooter}>
        <View style={styles.userCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{getInitials(user?.full_name)}</Text></View>
          <View style={styles.userCopy}>
            <Text style={styles.userName} numberOfLines={1}>{user?.full_name || 'Recrutador'}</Text>
            <Text style={styles.userEmail} numberOfLines={1}>{user?.email || 'Conta empresarial'}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <Pressable
          style={({ pressed, hovered }) => [
            styles.signOut,
            hovered && styles.signOutHovered,
            pressed && styles.pressed,
          ]}
          onPress={onSignOut}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
          title="Sair da conta"
        >
          <Feather name="log-out" size={18} color={colors.danger} />
          <Text style={styles.signOutText}>Sair</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 256,
    flexShrink: 0,
    height: '100%',
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[6],
    paddingBottom: theme.spacing[4],
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  drawer: {
    height: '100%',
    maxWidth: '86%',
    borderRightWidth: 0,
    borderTopRightRadius: theme.radii.large,
    borderBottomRightRadius: theme.radii.large,
    ...theme.shadows.card,
  },
  sidebarHeader: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[6],
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  brandMark: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: theme.radii.small,
  },
  brandText: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.medium,
  },
  navigation: { gap: theme.spacing[1] },
  navItem: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: theme.spacing[4],
    paddingRight: theme.spacing[3],
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    borderRadius: theme.radii.small,
    ...Platform.select({
      web: { transitionDuration: '150ms' },
      default: {},
    }),
  },
  navItemActive: {
    backgroundColor: colors.surfaceElevated,
    borderLeftColor: colors.primary,
  },
  navItemHovered: { backgroundColor: colors.surfaceElevated },
  navItemFocused: {
    borderWidth: 1,
    borderColor: colors.primary,
    ...Platform.select({
      web: {
        outlineColor: colors.primary,
        outlineWidth: 2,
        outlineStyle: 'solid',
        outlineOffset: 2,
      },
      default: {},
    }),
  },
  navIcon: { marginRight: theme.spacing[3] },
  navText: {
    color: colors.textSecondary,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  navTextActive: { color: colors.primary, fontWeight: '700' },
  sidebarFooter: { marginTop: 'auto' },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[2],
    gap: theme.spacing[2],
    minWidth: 0,
  },
  avatar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.medium,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarText: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  userCopy: { flex: 1, minWidth: 0 },
  userName: { color: colors.textPrimary, fontSize: 12, fontWeight: '700' },
  userEmail: { color: colors.textMuted, fontSize: 10, marginTop: 3 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: theme.spacing[2] },
  signOut: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    paddingHorizontal: 13,
    borderRadius: theme.radii.small,
  },
  signOutHovered: { backgroundColor: colors.dangerSurface },
  signOutText: { color: colors.danger, fontSize: theme.typography.body, fontWeight: '600' },
  pressed: { opacity: 0.78 },
});
