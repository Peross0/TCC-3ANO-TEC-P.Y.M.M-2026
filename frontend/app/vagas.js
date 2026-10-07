import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { apiFetch } from '../lib/api';
import { colors } from '../lib/theme';

export default function VagasScreen() {
  const { nome, email } = useLocalSearchParams();
  const [vagas, setVagas] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    apiFetch('/recruiters/vacancies?limit=50')
      .then((data) => setVagas(data.vacancies || []))
      .catch((error) => Alert.alert('Não foi possível carregar vagas', error.message || 'Verifique o backend.'))
      .finally(() => setCarregando(false));
  }, []);

  const vagasFiltradas = vagas.filter((vaga) => `${vaga.job_title} ${vaga.company_name} ${vaga.job_description}`.toLowerCase().includes(busca.toLowerCase()));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headingRow}>
          <Pressable onPress={() => router.replace({ pathname: '/home', params: { nome, email } })} style={styles.backButton} accessibilityLabel="Voltar para início">
            <Feather name="arrow-left" size={20} color={colors.ink} />
          </Pressable>
          <View style={styles.headingText}>
            <Text style={styles.eyebrow}>GESTÃO DE OPORTUNIDADES</Text>
            <Text style={styles.title}>Vagas da empresa</Text>
            <Text style={styles.subtitle}>Consulte as oportunidades publicadas pela sua empresa.</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Feather name="search" size={18} color={colors.muted} />
          <TextInput value={busca} onChangeText={setBusca} placeholder="Buscar vaga ou empresa" placeholderTextColor={colors.muted} style={styles.searchInput} />
        </View>

        {carregando ? <ActivityIndicator color={colors.primary} size="large" style={styles.loader} /> : vagasFiltradas.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}><Feather name="briefcase" size={28} color={colors.ink} /></View>
            <Text style={styles.emptyTitle}>Nenhuma vaga encontrada</Text>
            <Text style={styles.emptyText}>Novas oportunidades cadastradas pelas empresas aparecerão aqui.</Text>
          </View>
        ) : vagasFiltradas.map((vaga) => (
          <View key={vaga.id} style={styles.jobCard}>
            <View style={styles.jobIcon}><Feather name="briefcase" size={20} color={colors.ink} /></View>
            <View style={styles.jobBody}>
              <View style={styles.jobHeader}><Text style={styles.jobTitle}>{vaga.job_title}</Text></View>
              <Text style={styles.companyName}>{vaga.company_name}</Text>
              <Text style={styles.location}><Feather name="map-pin" size={13} color={colors.muted} /> {vaga.location || 'Local não informado'}</Text>
              <Text style={styles.jobDescription}>{vaga.job_description}</Text>
              <View style={styles.requirements}><Text style={styles.requirementsLabel}>Requisitos</Text><Text style={styles.requirementsText}>{vaga.requirements || 'Não informado'}</Text></View>
              <Pressable style={styles.applyButton} onPress={() => Alert.alert('Acompanhamento de candidatos', 'O acompanhamento individual das candidaturas ainda não está disponível nesta área.')}>
                <Text style={styles.applyText}>Acompanhamento de candidatos</Text><Feather name="arrow-right" size={17} color={colors.ink} />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  content: { width: '100%', maxWidth: 1040, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 28, paddingBottom: 48 },
  headingRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 22 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  headingText: { flex: 1 },
  eyebrow: { color: colors.ink, fontSize: 10, fontWeight: '800', letterSpacing: 1.3, marginBottom: 5 },
  title: { color: colors.ink, fontSize: 29, fontWeight: '700', letterSpacing: -0.7 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 5 },
  searchBox: { minHeight: 50, borderWidth: 1, borderColor: colors.line, borderRadius: 11, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 18 },
  searchInput: { flex: 1, minWidth: 0, color: colors.ink, fontSize: 14, paddingHorizontal: 10 },
  loader: { marginTop: 40 },
  jobCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 18, marginBottom: 13 },
  jobIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.primaryWash, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  jobBody: { flex: 1 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  jobTitle: { flex: 1, color: colors.ink, fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  companyName: { color: colors.ink, fontSize: 13, fontWeight: '700', marginTop: 6 },
  location: { color: colors.muted, fontSize: 12, marginTop: 5 },
  jobDescription: { color: colors.inkSoft, fontSize: 13, lineHeight: 20, marginTop: 12 },
  requirements: { backgroundColor: colors.surfaceSoft, borderRadius: 10, padding: 12, marginTop: 11 },
  requirementsLabel: { color: colors.ink, fontSize: 11, fontWeight: '800', marginBottom: 3 },
  requirementsText: { color: colors.inkSoft, fontSize: 12, lineHeight: 18 },
  applyButton: { minHeight: 43, borderRadius: 10, backgroundColor: colors.primary, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 13, paddingHorizontal: 12 },
  applyText: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  emptyState: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 30, marginTop: 16 },
  emptyIcon: { width: 56, height: 56, borderRadius: 17, backgroundColor: colors.primaryWash, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: '700' },
  emptyText: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 6 },
});
