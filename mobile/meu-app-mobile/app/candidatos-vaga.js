import { Feather } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppPreferences } from '../context/PreferencesContext';
import { SessionContext } from '../context/SessionContext';
import { apiFetch } from '../lib/api';

const STATUS_LABELS = { PENDING: 'Em análise', ACCEPTED: 'Aprovado', REJECTED: 'Rejeitado' };

export default function VacancyCandidatesScreen() {
  const { vacancyId } = useLocalSearchParams();
  const router = useRouter();
  const { sessionData } = useContext(SessionContext);
  const { colors, isDark } = useAppPreferences();
  const styles = makeStyles(colors);
  const [vacancy, setVacancy] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  const loadCandidates = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [vacancyData, candidatesData] = await Promise.all([
        apiFetch(`/recruiters/vacancies/${vacancyId}`),
        apiFetch(`/recruiters/vacancies/${vacancyId}/candidates?limit=50`),
      ]);
      setVacancy(vacancyData.vacancy);
      setCandidates(candidatesData.candidates || []);
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível carregar as candidaturas.');
    } finally {
      setLoading(false);
    }
  }, [vacancyId]);

  useEffect(() => {
    const timer = setTimeout(loadCandidates, 0);
    return () => clearTimeout(timer);
  }, [loadCandidates]);

  const updateStatus = async (candidate, status) => {
    const title = status === 'ACCEPTED' ? 'Aprovar candidatura?' : 'Rejeitar candidatura?';
    const confirmation = `${candidate.full_name} · ${vacancy?.job_title || 'vaga'}`;
    const saveStatus = async () => {
      setUpdatingId(candidate.candidate_id);
      setError('');
      try {
        await apiFetch(`/recruiters/vacancies/${vacancyId}/candidates/${candidate.candidate_id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        });
        setCandidates((current) => current.map((item) => item.candidate_id === candidate.candidate_id ? { ...item, status } : item));
      } catch (requestError) {
        setError(requestError.message || 'Não foi possível atualizar a candidatura.');
      } finally {
        setUpdatingId(null);
      }
    };

    if (Platform.OS === 'web') {
      if (typeof globalThis.confirm === 'function' && globalThis.confirm(`${title}\n${confirmation}`)) await saveStatus();
      return;
    }

    Alert.alert(title, confirmation, [
      { text: 'Cancelar', style: 'cancel' },
      { text: status === 'ACCEPTED' ? 'Aprovar' : 'Rejeitar', style: status === 'REJECTED' ? 'destructive' : 'default', onPress: saveStatus },
    ]);
  };

  if (sessionData?.user?.user_type !== 'RECRUITER') {
    return <Redirect href={sessionData?.user ? '/(tabs)/home' : '/'} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Voltar para vagas">
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>PROCESSO SELETIVO</Text>
          <Text style={styles.title}>Candidatos</Text>
        </View>
        <TouchableOpacity onPress={loadCandidates} style={styles.refreshButton} accessibilityRole="button" accessibilityLabel="Atualizar candidatos">
          <Feather name="refresh-cw" size={17} color={colors.text} />
        </TouchableOpacity>
      </View>
      {vacancy ? (
        <View style={styles.vacancyBanner}>
          <Feather name="briefcase" size={17} color={colors.tint} />
          <View style={styles.vacancyCopy}><Text style={styles.vacancyTitle}>{vacancy.job_title}</Text><Text style={styles.vacancyCompany}>{vacancy.company_name}</Text></View>
          <Text style={styles.count}>{candidates.length}</Text>
        </View>
      ) : null}
      {error ? <View style={styles.errorBox}><Feather name="alert-circle" size={16} color={colors.error} /><Text style={styles.errorText}>{error}</Text></View> : null}
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.tint} /><Text style={styles.muted}>Carregando candidaturas…</Text></View>
      ) : candidates.length === 0 ? (
        <View style={styles.center}><View style={styles.emptyIcon}><Feather name="users" size={24} color={colors.tint} /></View><Text style={styles.emptyTitle}>Ainda não há candidaturas</Text><Text style={styles.muted}>Quando alguém se candidatar a esta vaga, o perfil aparecerá aqui.</Text></View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {candidates.map((candidate) => (
            <View key={candidate.candidate_id} style={styles.card}>
              <View style={styles.candidateHeader}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{candidate.full_name?.trim()?.[0]?.toUpperCase() || 'C'}</Text></View>
                <View style={styles.candidateCopy}><Text style={styles.candidateName}>{candidate.full_name || 'Candidato'}</Text><Text style={styles.appliedDate}>Candidatou-se em {new Date(candidate.applied_at).toLocaleDateString('pt-BR')}</Text></View>
                <Text style={[styles.status, candidate.status === 'ACCEPTED' && styles.statusAccepted, candidate.status === 'REJECTED' && styles.statusRejected]}>{STATUS_LABELS[candidate.status] || candidate.status}</Text>
              </View>
              <View style={styles.contact}><Feather name="mail" size={14} color={colors.muted} /><Text style={styles.contactText}>{candidate.email}</Text></View>
              {candidate.phone ? <View style={styles.contact}><Feather name="phone" size={14} color={colors.muted} /><Text style={styles.contactText}>{candidate.phone}</Text></View> : null}
              <View style={styles.actions}>
                <TouchableOpacity style={styles.messageButton} onPress={() => router.push({ pathname: '/(tabs)/index1', params: { applicationId: String(candidate.id) } })} accessibilityRole="button"><Feather name="message-circle" size={15} color={colors.tint} /><Text style={styles.messageText}>Mensagens</Text></TouchableOpacity>
                {candidate.status !== 'ACCEPTED' ? <TouchableOpacity style={[styles.statusButton, styles.approveButton, updatingId === candidate.candidate_id && styles.disabled]} onPress={() => updateStatus(candidate, 'ACCEPTED')} disabled={updatingId !== null} accessibilityRole="button"><Feather name="check" size={15} color={colors.lime} /><Text style={styles.approveText}>{updatingId === candidate.candidate_id ? 'Salvando…' : 'Aprovar'}</Text></TouchableOpacity> : null}
                {candidate.status !== 'REJECTED' ? <TouchableOpacity style={[styles.statusButton, styles.rejectButton, updatingId === candidate.candidate_id && styles.disabled]} onPress={() => updateStatus(candidate, 'REJECTED')} disabled={updatingId !== null} accessibilityRole="button"><Feather name="x" size={15} color={colors.error} /><Text style={styles.rejectText}>Rejeitar</Text></TouchableOpacity> : null}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { minHeight: 65, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: colors.line },
    backButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.surface },
    headerCopy: { flex: 1 },
    eyebrow: { color: colors.tint, fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
    title: { color: colors.text, fontSize: 19, fontWeight: '800', marginTop: 3 },
    refreshButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.surface },
    vacancyBanner: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 11, marginHorizontal: 16, marginTop: 14, paddingHorizontal: 13, borderWidth: 1, borderColor: colors.line, borderRadius: 13, backgroundColor: colors.surface },
    vacancyCopy: { flex: 1 },
    vacancyTitle: { color: colors.text, fontSize: 12, fontWeight: '700' },
    vacancyCompany: { color: colors.muted, fontSize: 10, marginTop: 3 },
    count: { color: colors.tint, fontSize: 12, fontWeight: '800' },
    errorBox: { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginTop: 12, padding: 11, borderWidth: 1, borderColor: colors.errorBorder, borderRadius: 10, backgroundColor: colors.errorWash },
    errorText: { flex: 1, color: colors.error, fontSize: 11, lineHeight: 17 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 28 },
    muted: { color: colors.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
    emptyIcon: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: colors.surface },
    emptyTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
    list: { width: '100%', maxWidth: 820, alignSelf: 'center', gap: 11, padding: 16, paddingBottom: 28 },
    card: { padding: 15, borderWidth: 1, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.surface },
    candidateHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
    avatar: { width: 39, height: 39, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: 13, backgroundColor: colors.accentWash },
    avatarText: { color: colors.tint, fontSize: 14, fontWeight: '800' },
    candidateCopy: { flex: 1, minWidth: 0 },
    candidateName: { color: colors.text, fontSize: 13, fontWeight: '750' },
    appliedDate: { color: colors.muted, fontSize: 9, marginTop: 4 },
    status: { color: colors.warning, fontSize: 9, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 18, backgroundColor: colors.warningSurface },
    statusAccepted: { color: colors.lime, backgroundColor: colors.limeWash },
    statusRejected: { color: colors.error, backgroundColor: colors.errorWash },
    contact: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
    contactText: { color: colors.muted, fontSize: 11 },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line },
    messageButton: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, borderRadius: 9, backgroundColor: colors.accentWash },
    messageText: { color: colors.tint, fontSize: 10, fontWeight: '700' },
    statusButton: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, borderRadius: 9 },
    approveButton: { backgroundColor: colors.limeWash },
    rejectButton: { backgroundColor: colors.errorWash },
    approveText: { color: colors.lime, fontSize: 10, fontWeight: '700' },
    rejectText: { color: colors.error, fontSize: 10, fontWeight: '700' },
    disabled: { opacity: 0.55 },
  });
}
