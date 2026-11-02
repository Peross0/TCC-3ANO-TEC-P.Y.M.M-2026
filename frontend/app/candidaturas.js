import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { colors } from '../lib/theme';

export default function CandidaturasScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headingRow}>
          <View>
            <Text style={styles.eyebrow}>ÁREA DE CANDIDATOS</Text>
          </View>
        </View>

        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}><Feather name="users" size={25} color={colors.ink} /></View>
          <Text style={styles.emptyTitle}>Esta área é voltada a candidatos</Text>
          <Text style={styles.emptyText}>Sua conta atual é de recrutador. Acompanhe as oportunidades da empresa pela área de vagas.</Text>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            onPress={() => router.push('/vagas')}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Ver vagas da empresa</Text><Feather name="arrow-right" size={17} color={colors.onPrimary} />
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
  eyebrow: { color: colors.ink, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 5 },
  emptyState: { backgroundColor: colors.surface, borderRadius: 16, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: colors.line, marginTop: 8 },
  emptyIcon: { width: 56, height: 56, borderRadius: 17, backgroundColor: colors.primaryWash, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptyText: { maxWidth: 480, color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 7 },
  primaryButton: { minHeight: 48, paddingHorizontal: 18, borderRadius: 10, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20 },
  primaryButtonText: { color: colors.onPrimary, fontSize: 13, fontWeight: '800' },
  pressed: { opacity: 0.78 },
});
