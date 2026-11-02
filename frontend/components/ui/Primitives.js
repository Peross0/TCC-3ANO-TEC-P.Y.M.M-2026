import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, theme } from '../../lib/theme';

export function Card({ children, style, ...props }) {
  return <View style={[styles.card, style]} {...props}>{children}</View>;
}

export function Badge({ children, accessibilityLabel, style, ...props }) {
  return (
    <View
      style={[styles.badge, style]}
      accessible
      accessibilityLabel={accessibilityLabel}
      {...props}
    >
      <Text style={styles.badgeText}>{children}</Text>
    </View>
  );
}

export function IconButton({ icon, label, onPress, iconColor = colors.textPrimary, style, ...props }) {
  return (
    <Pressable
      style={({ pressed, hovered }) => [
        styles.iconButton,
        style,
        hovered && styles.hovered,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      title={label}
      {...props}
    >
      <Feather name={icon} size={17} color={iconColor} />
    </Pressable>
  );
}

export function SectionHeader({ title, action }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  );
}

export function StatCard({ label, value, helper, neutral = false, style }) {
  return (
    <View style={[styles.statCard, style]}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statValueRow}>
        {neutral ? <Feather name="info" size={16} color={colors.textMuted} /> : null}
        <Text style={[styles.statValue, neutral && styles.neutralValue]}>{value}</Text>
      </View>
      <Text style={styles.statHelper} numberOfLines={2}>{helper || ' '}</Text>
    </View>
  );
}

export function Skeleton({ style }) {
  return <View style={[styles.skeleton, style]} accessibilityElementsHidden />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: theme.radii.large,
  },
  badge: {
    minWidth: 28,
    minHeight: 28,
    paddingHorizontal: theme.spacing[2],
    borderRadius: theme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    color: colors.textSecondary,
    fontSize: theme.typography.caption,
    fontWeight: '700',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.medium,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({ web: { transitionDuration: '150ms' }, default: {} }),
  },
  hovered: { backgroundColor: colors.surfaceElevated, borderColor: colors.primary },
  pressed: { opacity: 0.78 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[3],
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
  },
  statCard: {
    minHeight: 142,
    padding: theme.spacing[4],
    justifyContent: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderRadius: theme.radii.large,
  },
  statLabel: {
    minHeight: 38,
    color: colors.textSecondary,
    fontSize: theme.typography.body,
    fontWeight: '600',
    lineHeight: 19,
  },
  statValueRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
  },
  neutralValue: {
    color: colors.textMuted,
    fontSize: 17,
    fontWeight: '600',
  },
  skeleton: {
    height: 12,
    borderRadius: theme.radii.pill,
    backgroundColor: colors.surfaceElevated,
  },
  statHelper: {
    minHeight: 34,
    color: colors.textMuted,
    fontSize: theme.typography.caption,
    lineHeight: 17,
  },
});
