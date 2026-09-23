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
            <Feather name="arrow-left" size={20} color="#14213D" />
          </Pressable>
          <View style={styles.headingText}>
            <Text style={styles.eyebrow}>OPORTUNIDADES</Text>
            <Text style={styles.title}>Vagas disponíveis</Text>
            <Text style={styles.subtitle}>Encontre uma oportunidade que combine com você.</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Feather name="search" size={18} color="#8293A8" />
          <TextInput value={busca} onChangeText={setBusca} placeholder="Buscar vaga ou empresa" placeholderTextColor="#9AA8B8" style={styles.searchInput} />
        </View>

        {carregando ? <ActivityIndicator color="#2E56D9" size="large" style={styles.loader} /> : vagasFiltradas.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}><Feather name="briefcase" size={28} color="#2E56D9" /></View>
            <Text style={styles.emptyTitle}>Nenhuma vaga encontrada</Text>
            <Text style={styles.emptyText}>Novas oportunidades cadastradas pelas empresas aparecerão aqui.</Text>
          </View>
        ) : vagasFiltradas.map((vaga) => (
          <View key={vaga.id} style={styles.jobCard}>
            <View style={styles.jobIcon}><Feather name="briefcase" size={20} color="#2E56D9" /></View>
            <View style={styles.jobBody}>
              <View style={styles.jobHeader}>
                <Text style={styles.jobTitle}>{vaga.job_title}</Text>
                <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>ATIVA</Text></View>
              </View>
              <Text style={styles.companyName}>{vaga.company_name}</Text>
              <Text style={styles.location}><Feather name="map-pin" size={13} color="#8293A8" /> {vaga.location || 'Local não informado'}</Text>
              <Text style={styles.jobDescription}>{vaga.job_description}</Text>
              <View style={styles.requirements}><Text style={styles.requirementsLabel}>Requisitos</Text><Text style={styles.requirementsText}>{vaga.requirements || 'Não informado'}</Text></View>
              <Pressable style={styles.applyButton} onPress={() => Alert.alert('Vaga da sua empresa', 'Use o painel para acompanhar os candidatos desta vaga.')}>
                <Text style={styles.applyText}>Gerenciar candidatos</Text><Feather name="arrow-right" size={17} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  content: { padding: 20, paddingBottom: 40 },
  headingRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 22 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  headingText: { flex: 1 },
  eyebrow: { color: '#2E56D9', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 4 },
  title: { color: '#14213D', fontSize: 27, fontWeight: '800' },
  subtitle: { color: '#8792AC', fontSize: 14, lineHeight: 20, marginTop: 4 },
  searchBox: { height: 50, borderWidth: 1, borderColor: '#DCE5EE', borderRadius: 13, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 18 },
  searchInput: { flex: 1, color: '#14213D', fontSize: 14, paddingHorizontal: 10 },
  loader: { marginTop: 40 },
  jobCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#E3EAF2', padding: 15, marginBottom: 14 },
  jobIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#E8EEFF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  jobBody: { flex: 1 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  jobTitle: { flex: 1, color: '#14213D', fontSize: 17, fontWeight: '800' },
  activeBadge: { backgroundColor: '#E5F7EE', borderRadius: 7, paddingHorizontal: 7, paddingVertical: 4 },
  activeBadgeText: { color: '#16834B', fontSize: 10, fontWeight: '800' },
  companyName: { color: '#2E56D9', fontSize: 13, fontWeight: '700', marginTop: 6 },
  location: { color: '#8293A8', fontSize: 12, marginTop: 5 },
  jobDescription: { color: '#526581', fontSize: 13, lineHeight: 19, marginTop: 12 },
  requirements: { backgroundColor: '#F5F8FC', borderRadius: 10, padding: 10, marginTop: 11 },
  requirementsLabel: { color: '#2E56D9', fontSize: 11, fontWeight: '800', marginBottom: 3 },
  requirementsText: { color: '#62708A', fontSize: 12, lineHeight: 17 },
  applyButton: { height: 42, borderRadius: 11, backgroundColor: '#2E56D9', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 13 },
  applyText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  emptyState: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 30, marginTop: 25 },
  emptyIcon: { width: 58, height: 58, borderRadius: 18, backgroundColor: '#E8EEFF', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { color: '#14213D', fontSize: 17, fontWeight: '800' },
  emptyText: { color: '#8792AC', fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 6 },
});
