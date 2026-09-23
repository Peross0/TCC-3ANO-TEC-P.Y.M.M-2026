import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

export default function CandidaturasScreen() {
  const { nome, email } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headingRow}>
          <Pressable onPress={() => router.replace({ pathname: '/home', params: { nome, email } })} style={styles.backButton} accessibilityLabel="Voltar para início">
            <Feather name="arrow-left" size={20} color="#14213D" />
          </Pressable>
          <View>
            <Text style={styles.eyebrow}>ACOMPANHAMENTO</Text>
            <Text style={styles.title}>Candidaturas</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}><Text style={styles.summaryNumber}>0</Text><Text style={styles.summaryLabel}>Em análise</Text></View>
          <View style={styles.summaryCard}><Text style={styles.summaryNumber}>0</Text><Text style={styles.summaryLabel}>Entrevistas</Text></View>
          <View style={styles.summaryCard}><Text style={styles.summaryNumber}>0</Text><Text style={styles.summaryLabel}>Aprovadas</Text></View>
        </View>

        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}><Feather name="file-text" size={28} color="#2E56D9" /></View>
          <Text style={styles.emptyTitle}>Você ainda não se candidatou</Text>
          <Text style={styles.emptyText}>Explore as vagas disponíveis e acompanhe o andamento das suas candidaturas por aqui.</Text>
          <Pressable style={styles.primaryButton} onPress={() => router.push({ pathname: '/vagas', params: { nome, email } })}>
            <Text style={styles.primaryButtonText}>Explorar vagas</Text><Feather name="arrow-right" size={17} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  content: { padding: 20 },
  headingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  eyebrow: { color: '#2E56D9', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 4 },
  title: { color: '#14213D', fontSize: 27, fontWeight: '800' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  summaryCard: { width: '31%', backgroundColor: '#FFFFFF', borderRadius: 15, paddingVertical: 17, alignItems: 'center', borderWidth: 1, borderColor: '#E3EAF2' },
  summaryNumber: { color: '#2E56D9', fontSize: 25, fontWeight: '800' },
  summaryLabel: { color: '#8792AC', fontSize: 11, textAlign: 'center', marginTop: 4 },
  emptyState: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: '#E3EAF2', marginTop: 8 },
  emptyIcon: { width: 60, height: 60, borderRadius: 19, backgroundColor: '#E8EEFF', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  emptyTitle: { color: '#14213D', fontSize: 18, fontWeight: '800', textAlign: 'center' },
  emptyText: { color: '#8792AC', fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 7 },
  primaryButton: { height: 46, paddingHorizontal: 18, borderRadius: 12, backgroundColor: '#2E56D9', flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});
