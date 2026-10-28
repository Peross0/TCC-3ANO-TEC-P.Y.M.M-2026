import { Feather } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppPreferences } from '../../context/PreferencesContext';

export default function JobCard({ item, onApply, onSave, onOpenDetails, isSaved = false, isApplied = false, isApplying = false, isSaving = false }) {
  const { colors } = useAppPreferences();
  const styles = makeStyles(colors);
  return (

    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.companyLogo, { backgroundColor: item.logoBg }]}>
          {item.logoUri
            ? <Image source={{ uri: item.logoUri }} style={styles.companyLogoImage} resizeMode="cover" />
            : <Feather name="briefcase" size={19} color={colors.primaryDark} />}
        </View>

        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{item.company}</Text>
          {item.category ? <Text style={styles.companyCategory}>{item.category}</Text> : null}
        </View>
        <Text style={styles.timeAgo}>{item.timeAgo}</Text>
      </View>

      <TouchableOpacity onPress={() => onOpenDetails?.(item)} accessibilityRole="button" accessibilityLabel={`Ver detalhes de ${item.title}`}>
        <Text style={styles.jobTitle}>{item.title}</Text>
      </TouchableOpacity>
      <Text style={styles.jobDescription} numberOfLines={3}>{item.description}</Text>
      {item.salary ? <Text style={styles.salary}>{item.salary}</Text> : null}
      <View style={styles.metadataRow}>
        {item.location ? <Text style={styles.metadata}>{item.location}</Text> : null}
        {item.workModel ? <Text style={styles.metadata}>{item.workModel}</Text> : null}
        {item.contractType ? <Text style={styles.metadata}>{item.contractType}</Text> : null}
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity onPress={() => onOpenDetails?.(item)} accessibilityRole="button">
          <Text style={styles.detailsText}>Ver detalhes</Text>
        </TouchableOpacity>

        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.bookmarkButton, isSaved && styles.bookmarkButtonSaved]}
            onPress={() => onSave?.(item)}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel={isSaved ? `Remover ${item.title} das vagas salvas` : `Salvar ${item.title}`}
          >
            <MaterialIcons name={isSaved ? 'bookmark' : 'bookmark-border'} size={20} color={isSaved ? colors.tint : colors.muted} />
          </TouchableOpacity>
          {onApply ? (
            <TouchableOpacity
              style={[styles.interestButton, (isApplied || isApplying) && styles.interestButtonDisabled]}
              onPress={() => onApply(item.vacancyId)}
              disabled={isApplied || isApplying}
              accessibilityRole="button"
            >
              <Text style={styles.interestButtonText}>
                {isApplying ? 'Enviando...' : isApplied ? 'Candidatado' : 'Tenho interesse'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function makeStyles(colors) {
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
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  companyCategory: {
    fontSize: 12,
    color: colors.muted,
  },
  timeAgo: {
    fontSize: 11,
    color: colors.muted,
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  jobDescription: {
    fontSize: 12,
    color: colors.inkSoft,
    marginBottom: 12,
    lineHeight: 16,
  },
  salary: {
    fontSize: 12,
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
  metadataRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 12 },
  metadata: { color: colors.muted, fontSize: 11, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: colors.surfaceSoft },
  detailsText: { color: colors.primaryDark, fontSize: 12, fontWeight: '700' },
  bookmarkButtonSaved: { backgroundColor: colors.primaryWash },
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
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  });
}