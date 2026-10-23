import React from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAppPreferences } from '../../context/PreferencesContext';

export default function JobCard({
  item,
  onApply,
  isApplied = false,
  isApplying = false,
  isFavorite = false,
  isSavingFavorite = false,
  onToggleFavorite,
}) {
  const { colors, preferences } = useAppPreferences();
  const styles = makeStyles(colors, preferences.large_text);

  return (

    <View style={[styles.card, preferences.high_contrast && styles.highContrastCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.companyLogo}>
          {item.logoUri
            ? <Image source={{ uri: item.logoUri }} style={styles.companyLogoImage} resizeMode="cover" />
            : <Feather name="briefcase" size={19} color={colors.primaryDark} />}
        </View>

        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{item.company}</Text>
          <Text style={styles.companyCategory}>{item.category}</Text>
        </View>
        <View style={styles.timeMetadata}>
          <Text style={styles.timeAgo}>{item.timeAgo}</Text>
          {item.dateTimeLabel ? (
            <Text style={styles.dateTimeLabel}>{item.dateTimeLabel} BRT</Text>
          ) : null}
        </View>
      </View>

      <Text style={styles.jobTitle}>{item.title}</Text>
      <Text style={styles.jobDescription}>{item.description}</Text>
      <Text style={styles.salary}>{item.salary}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.vacancyInfo}>
          <Feather name="users" size={16} color={colors.muted} />
          <Text style={styles.vacancyText}>{item.vacancies}</Text>
        </View>

        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.bookmarkButton, isFavorite && styles.bookmarkSelected]}
            onPress={() => onToggleFavorite?.(item.vacancyId)}
            disabled={isSavingFavorite}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Remover vaga dos salvos' : 'Salvar vaga'}
            accessibilityState={{ disabled: isSavingFavorite, selected: isFavorite }}
          >
            <Ionicons
              name={isFavorite ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isFavorite ? colors.tint : colors.muted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.interestButton, (isApplied || isApplying) && styles.interestButtonDisabled]}
            onPress={() => onApply?.(item.vacancyId)}
            disabled={isApplied || isApplying}
            accessibilityRole="button"
          >
            <Text style={styles.interestButtonText}>
              {isApplying ? 'Enviando...' : isApplied ? 'Candidatado' : 'Tenho interesse'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function makeStyles(colors, largeText) {
  const scale = largeText ? 1.15 : 1;
  return StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyLogoImage: { width: '100%', height: '100%', borderRadius: 22 },
  companyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  companyName: {
    fontSize: 14 * scale,
    fontWeight: '700',
    color: colors.text,
  },
  companyCategory: {
    fontSize: 12 * scale,
    color: colors.muted,
  },
  timeAgo: {
    fontSize: 11 * scale,
    color: colors.muted,
    textAlign: 'right',
  },
  timeMetadata: { alignItems: 'flex-end', marginLeft: 5 },
  dateTimeLabel: { color: colors.muted, fontSize: 9, marginTop: 3, textAlign: 'right' },
  jobTitle: {
    fontSize: 14 * scale,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  jobDescription: {
    fontSize: 12 * scale,
    color: colors.muted,
    marginBottom: 12,
    lineHeight: 16,
  },
  salary: {
    fontSize: 12 * scale,
    fontWeight: '700',
    color: colors.primaryDark,
    textAlign: 'right',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 12,
  },
  vacancyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vacancyText: {
    fontSize: 12 * scale,
    color: colors.muted,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bookmarkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryWash,
    justifyContent: 'center',
    alignItems: 'center',
  },
  interestButton: {
    borderWidth: 1.5,
    borderColor: colors.tint,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  interestButtonDisabled: {
    opacity: 0.6,
  },
  interestButtonText: {
    fontSize: 12 * scale,
    fontWeight: '700',
    color: colors.primaryDark,
  },
    highContrastCard: { borderWidth: 2 },
    bookmarkSelected: { borderColor: colors.tint, borderWidth: 1 },
  });
}