import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '../lib/theme';

export default function CandidaturasScreen() {
  const { nome, email } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headingRow}>
          <Pressable onPress={() => router.replace({ pathname: '/home', params: { nome, email } })} style={styles.backButton} accessibilityLabel="Voltar para início">
            <Feather name="arrow-left" size={20} color={colors.ink} />
          </Pressable>
          <View>
            <Text style={styles.eyebrow}>ÁREA DE CANDIDATOS</Text>
            <Text style={styles.title}>Candidaturas</Text>
          </View>
        </View>

        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}><Feather name="users" size={25} color={colors.ink} /></View>
          <Text style={styles.emptyTitle}>Esta área é voltada a candidatos</Text>
          <Text style={styles.emptyText}>Sua conta atual é de recrutador. Acompanhe as oportunidades da empresa pela área de vagas.</Text>
          <Pressable style={styles.primaryButton} onPress={() => router.push({ pathname: '/vagas', params: { nome, email } })}>
            <Text style={styles.primaryButtonText}>Ver vagas da empresa</Text><Feather name="arrow-right" size={17} color={colors.ink} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  content: { width: '100%', maxWidth: 900, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 28, paddingBottom: 48 },
  headingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  eyebrow: { color: colors.ink, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 5 },
  title: { color: colors.ink, fontSize: 29, fontWeight: '700', letterSpacing: -0.7 },
  emptyState: { backgroundColor: colors.surface, borderRadius: 16, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: colors.line, marginTop: 8 },
  emptyIcon: { width: 56, height: 56, borderRadius: 17, backgroundColor: colors.primaryWash, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptyText: { maxWidth: 480, color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 7 },
  primaryButton: { minHeight: 46, paddingHorizontal: 18, borderRadius: 10, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20 },
  primaryButtonText: { color: colors.ink, fontSize: 13, fontWeight: '800' },
});
