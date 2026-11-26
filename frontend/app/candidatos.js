import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { apiFetch, getSession } from '../lib/api';
import { colors } from '../lib/theme';
import { useHydratedWidth } from '../lib/useHydratedWidth';

const statusText = { PENDING: 'Em análise', ACCEPTED: 'Aprovado', REJECTED: 'Rejeitado' };

export default function RecruiterCandidates() {
  const width = useHydratedWidth();
  const wide = width >= 820;
  const [vacancies, setVacancies] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const selectedVacancy = useMemo(
    () => vacancies.find((vacancy) => String(vacancy.id) === String(selectedId)) || null,
    [vacancies, selectedId],
  );

  const loadVacancies = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const session = await getSession();
      if (!session.token || session.user?.user_type !== 'RECRUITER') {
        router.replace('/login');
        return;
      }
      const data = await apiFetch('/recruiters/vacancies?status=ALL&limit=50');
      const list = data.vacancies || [];
      setVacancies(list);
      setSelectedId((current) => list.some((item) => String(item.id) === String(current)) ? current : list[0]?.id ?? null);
    } catch (loadError) {
      setError(loadError.message || 'Não foi possível carregar as vagas da empresa.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCandidates = useCallback(async (vacancyId) => {
    if (!vacancyId) {
      setCandidates([]);
      return;
    }
    setLoadingCandidates(true);
    setError('');
    try {
      const data = await apiFetch(`/recruiters/vacancies/${vacancyId}/candidates?limit=50`);
      setCandidates(data.candidates || []);
    } catch (loadError) {
      setCandidates([]);
      setError(loadError.message || 'Não foi possível carregar as candidaturas.');
    } finally {
      setLoadingCandidates(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { loadVacancies(); }, 0);
    return () => clearTimeout(timer);
  }, [loadVacancies]);
  useEffect(() => {
    const timer = setTimeout(() => { loadCandidates(selectedId); }, 0);
    return () => clearTimeout(timer);
  }, [selectedId, loadCandidates]);

  const updateStatus = async (candidate, status) => {
    if (!selectedId || updatingId !== null) return;
    setUpdatingId(candidate.candidate_id);
    setError('');
    setNotice('');
    try {
      await apiFetch(`/recruiters/vacancies/${selectedId}/candidates/${candidate.candidate_id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setCandidates((current) => current.map((item) => item.candidate_id === candidate.candidate_id ? { ...item, status } : item));
      setNotice(`Candidatura de ${candidate.full_name} atualizada: ${statusText[status]?.toLowerCase()}.`);
    } catch (updateError) {
      setError(updateError.message || 'Não foi possível atualizar o status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <View style={styles.headingCopy}>
            <Text style={styles.eyebrow}>PROCESSO SELETIVO</Text>
            <Text style={styles.title}>Candidatos</Text>
            <Text style={styles.subtitle}>Revise inscrições e atualize o andamento de cada candidatura.</Text>
          </View>
          <Pressable style={styles.refresh} onPress={() => { loadVacancies(); loadCandidates(selectedId); }} accessibilityRole="button" accessibilityLabel="Atualizar candidatos"><Feather name="refresh-cw" size={17} color={colors.textSecondary} /></Pressable>
        </View>

        {error ? <Feedback text={error} /> : null}
        {notice ? <Feedback text={notice} success /> : null}

        {loading ? (
          <View style={styles.loading}><ActivityIndicator color={colors.primary} /><Text style={styles.muted}>Carregando vagas…</Text></View>
        ) : vacancies.length === 0 ? (
          <EmptyState title="Nenhuma vaga cadastrada" text="Publique uma vaga para receber e acompanhar candidaturas." action={() => router.push('/vagas')} actionLabel="Ir para minhas vagas" />
        ) : (
          <>
            <Text style={styles.label}>Selecione uma vaga</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vacancyChoices}>
              {vacancies.map((vacancy) => (
                <Pressable key={vacancy.id} style={[styles.vacancyChoice, String(vacancy.id) === String(selectedId) && styles.vacancyChoiceActive]} onPress={() => setSelectedId(vacancy.id)} accessibilityRole="button" accessibilityState={{ selected: String(vacancy.id) === String(selectedId) }}>
                  <Text style={[styles.choiceTitle, String(vacancy.id) === String(selectedId) && styles.choiceTitleActive]} numberOfLines={1}>{vacancy.job_title}</Text>
                  <Text style={styles.choiceMeta}>{Number(vacancy.applicant_count) || 0} candidaturas · {vacancy.status === 'OPEN' ? 'Ativa' : 'Desativada'}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {selectedVacancy ? (
              <View style={[styles.selectedSummary, wide && styles.selectedSummaryWide]}>
                <View style={styles.summaryIcon}><Feather name="briefcase" size={18} color={colors.primary} /></View>
                <View style={styles.summaryCopy}><Text style={styles.summaryTitle}>{selectedVacancy.job_title}</Text><Text style={styles.summaryText}>{selectedVacancy.company_name} · {selectedVacancy.location || 'Local não informado'}</Text></View>
                <Text style={styles.totalPill}>{candidates.length} carregados</Text>
              </View>
            ) : null}

            {loadingCandidates ? (
              <View style={styles.loading}><ActivityIndicator color={colors.primary} /><Text style={styles.muted}>Carregando candidaturas…</Text></View>
            ) : candidates.length === 0 ? (
              <EmptyState title="Ainda não há candidaturas" text="Quando alguém se candidatar a esta vaga, o perfil aparecerá aqui." />
            ) : (
              <View style={[styles.candidateGrid, wide && styles.candidateGridWide]}>
                {candidates.map((candidate) => (
                  <CandidateCard
                    key={`${selectedId}-${candidate.candidate_id}`}
                    candidate={candidate}
                    busy={updatingId === candidate.candidate_id}
                    onApprove={() => updateStatus(candidate, 'ACCEPTED')}
                    onReject={() => updateStatus(candidate, 'REJECTED')}
                    onMessage={() => router.push({ pathname: '/mensagens', params: { application_id: String(candidate.id) } })}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function CandidateCard({ candidate, busy, onApprove, onReject, onMessage }) {
  return (
    <View style={styles.candidateCard}>
      <View style={styles.candidateHeader}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{candidate.full_name?.trim()?.[0]?.toUpperCase() || 'C'}</Text></View>
        <View style={styles.candidateCopy}><Text style={styles.candidateName}>{candidate.full_name || 'Candidato'}</Text><Text style={styles.candidateDate}>Candidatou-se em {new Date(candidate.applied_at).toLocaleDateString('pt-BR')}</Text></View>
        <Text style={[styles.statusPill, candidate.status === 'ACCEPTED' && styles.statusAccepted, candidate.status === 'REJECTED' && styles.statusRejected]}>{statusText[candidate.status] || candidate.status}</Text>
      </View>
      <View style={styles.contactRow}><Feather name="mail" size={14} color={colors.textMuted} /><Text style={styles.contactText}>{candidate.email}</Text></View>
      {candidate.phone ? <View style={styles.contactRow}><Feather name="phone" size={14} color={colors.textMuted} /><Text style={styles.contactText}>{candidate.phone}</Text></View> : null}
      <View style={styles.actions}>
        <Pressable style={styles.messageButton} onPress={onMessage} accessibilityRole="button"><Feather name="message-circle" size={15} color={colors.primary} /><Text style={styles.messageText}>Mensagens</Text></Pressable>
        {candidate.status !== 'ACCEPTED' ? <Pressable style={[styles.statusButton, styles.approveButton, busy && styles.disabled]} onPress={onApprove} disabled={busy} accessibilityRole="button"><Feather name="check" size={15} color={colors.success} /><Text style={styles.approveText}>{busy ? 'Salvando…' : 'Aprovar'}</Text></Pressable> : null}
        {candidate.status !== 'REJECTED' ? <Pressable style={[styles.statusButton, styles.rejectButton, busy && styles.disabled]} onPress={onReject} disabled={busy} accessibilityRole="button"><Feather name="x" size={15} color={colors.danger} /><Text style={styles.rejectText}>Rejeitar</Text></Pressable> : null}
      </View>
    </View>
  );
}

function Feedback({ text, success = false }) {
  return <View style={[styles.feedback, success && styles.feedbackSuccess]}><Feather name={success ? 'check-circle' : 'alert-circle'} size={16} color={success ? colors.success : colors.danger} /><Text style={[styles.feedbackText, success && styles.feedbackSuccessText]}>{text}</Text></View>;
}

function EmptyState({ title, text, action, actionLabel }) {
  return <View style={styles.emptyState}><View style={styles.emptyIcon}><Feather name="users" size={23} color={colors.primary} /></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyText}>{text}</Text>{action ? <Pressable style={styles.emptyAction} onPress={action} accessibilityRole="button"><Text style={styles.emptyActionText}>{actionLabel}</Text><Feather name="arrow-right" size={15} color={colors.onPrimary} /></Pressable> : null}</View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: 28, paddingTop: 31, paddingBottom: 48 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 25 },
  headingCopy: { flex: 1 },
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.4, marginBottom: 8 },
  title: { color: colors.textPrimary, fontSize: 29, fontWeight: '800', letterSpacing: -0.7 },
  subtitle: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 6 },
  refresh: { width: 43, height: 43, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 11, backgroundColor: colors.surface },
  label: { color: colors.textPrimary, fontSize: 12, fontWeight: '700', marginBottom: 10 },
  vacancyChoices: { gap: 9, paddingBottom: 6 },
  vacancyChoice: { width: 225, minHeight: 74, justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.surface },
  vacancyChoiceActive: { borderColor: colors.primary, backgroundColor: colors.surfaceElevated },
  choiceTitle: { color: colors.textPrimary, fontSize: 12, fontWeight: '700' },
  choiceTitleActive: { color: colors.primary },
  choiceMeta: { color: colors.textMuted, fontSize: 10, marginTop: 6 },
  selectedSummary: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 18, marginBottom: 14, padding: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: colors.surface },
  selectedSummaryWide: { paddingHorizontal: 18 },
  summaryIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: colors.surfaceElevated },
  summaryCopy: { flex: 1, minWidth: 0 },
  summaryTitle: { color: colors.textPrimary, fontSize: 13, fontWeight: '750' },
  summaryText: { color: colors.textMuted, fontSize: 10, marginTop: 4 },
  totalPill: { color: colors.primary, fontSize: 10, fontWeight: '700', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 20, backgroundColor: colors.surfaceElevated },
  candidateGrid: { gap: 12 },
  candidateGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  candidateCard: { flex: 1, minWidth: 300, padding: 17, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface },
  candidateHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  avatar: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
  avatarText: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  candidateCopy: { flex: 1, minWidth: 0 },
  candidateName: { color: colors.textPrimary, fontSize: 13, fontWeight: '750' },
  candidateDate: { color: colors.textMuted, fontSize: 9, marginTop: 4 },
  statusPill: { color: colors.warning, fontSize: 9, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 20, backgroundColor: colors.warningSurface },
  statusAccepted: { color: colors.success, backgroundColor: colors.successSurface },
  statusRejected: { color: colors.danger, backgroundColor: colors.dangerSurface },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  contactText: { color: colors.textSecondary, fontSize: 11 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 7, marginTop: 16, paddingTop: 13, borderTopWidth: 1, borderTopColor: colors.border },
  messageButton: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, borderRadius: 9, backgroundColor: colors.surfaceElevated },
  messageText: { color: colors.primary, fontSize: 10, fontWeight: '700' },
  statusButton: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, borderRadius: 9 },
  approveButton: { backgroundColor: colors.successSurface },
  rejectButton: { backgroundColor: colors.dangerSurface },
  approveText: { color: colors.success, fontSize: 10, fontWeight: '700' },
  rejectText: { color: colors.danger, fontSize: 10, fontWeight: '700' },
  disabled: { opacity: 0.55 },
  loading: { minHeight: 160, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  muted: { color: colors.textSecondary, fontSize: 12 },
  emptyState: { alignItems: 'center', padding: 28, marginTop: 18, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface },
  emptyIcon: { width: 49, height: 49, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: colors.surfaceElevated },
  emptyTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '750', marginTop: 13 },
  emptyText: { maxWidth: 420, color: colors.textSecondary, fontSize: 11, lineHeight: 18, textAlign: 'center', marginTop: 6 },
  emptyAction: { minHeight: 41, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 13, marginTop: 16, borderRadius: 10, backgroundColor: colors.primary },
  emptyActionText: { color: colors.onPrimary, fontSize: 11, fontWeight: '750' },
  feedback: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 11, marginBottom: 12, borderWidth: 1, borderColor: colors.danger, borderRadius: 10, backgroundColor: colors.dangerSurface },
  feedbackSuccess: { borderColor: colors.success, backgroundColor: colors.successSurface },
  feedbackText: { flex: 1, color: colors.danger, fontSize: 11, lineHeight: 17 },
  feedbackSuccessText: { color: colors.success },
});
