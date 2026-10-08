import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
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

const FILTERS = [
  { key: 'ALL', label: 'Todas' },
  { key: 'OPEN', label: 'Ativas' },
  { key: 'CLOSED', label: 'Inativas' },
];

const getStatusLabel = (status) => (status === 'OPEN' ? 'ATIVA' : 'INATIVA');

const getDefaultDraft = (vaga = null) => ({
  job_title: vaga?.job_title || '',
  company_name: vaga?.company_name || '',
  company_sector: vaga?.company_sector || '',
  job_description: vaga?.job_description || '',
  requirements: vaga?.requirements || '',
  benefits: vaga?.benefits || '',
  location: vaga?.location || '',
  work_model: vaga?.work_model || 'ONSITE',
  contract_type: vaga?.contract_type || 'CLT',
  salary_min: vaga?.salary_min ? String(vaga.salary_min) : '',
  salary_max: vaga?.salary_max ? String(vaga.salary_max) : '',
});

export default function VagasScreen() {
  const { nome, email } = useLocalSearchParams();
  const [vagas, setVagas] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('ALL');
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [editarVaga, setEditarVaga] = useState(null);
  const [draft, setDraft] = useState(getDefaultDraft());

  const carregarVagas = async (statusFilter = filtroStatus) => {
    setCarregando(true);
    try {
      const query = new URLSearchParams({ limit: '50' });
      if (statusFilter !== 'ALL') {
        query.set('status', statusFilter);
      }

      const data = await apiFetch(`/recruiters/vacancies?${query.toString()}`);
      setVagas(data.vacancies || []);
    } catch (error) {
      Alert.alert('Não foi possível carregar vagas', error.message || 'Verifique o backend.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarVagas(filtroStatus);
  }, [filtroStatus]);

  const vagasFiltradas = useMemo(() => vagas.filter((vaga) => {
    if (!`${vaga.job_title} ${vaga.company_name} ${vaga.job_description}`.toLowerCase().includes(busca.toLowerCase())) {
      return false;
    }
    return true;
  }), [vagas, busca]);

  const abrirEdicao = (vaga) => {
    if (vaga.status === 'OPEN') {
      Alert.alert('Não foi possível editar', 'Para editar esta vaga, primeiro desative-a.');
      return;
    }

    setEditarVaga(vaga);
    setDraft(getDefaultDraft(vaga));
    setModalVisible(true);
  };

  const atualizarDraft = (field, value) => {
    setDraft((atual) => ({ ...atual, [field]: value }));
  };

  const handleStatusToggle = (vaga, targetStatus) => {
    setConfirmAction({ vaga, targetStatus });
    setConfirmVisible(true);
  };

  const confirmStatusChange = async () => {
    if (!confirmAction) return;

    const { vaga, targetStatus } = confirmAction;
    setConfirmVisible(false);

    try {
      await apiFetch(`/recruiters/vacancies/${vaga.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: targetStatus }),
      });

      await carregarVagas(filtroStatus);
      Alert.alert(targetStatus === 'CLOSED' ? 'Vaga desativada' : 'Vaga reativada', targetStatus === 'CLOSED'
        ? 'A vaga foi ocultada para os candidatos e continua salva no sistema.'
        : 'A vaga voltou a ficar disponível para candidatos.');
    } catch (error) {
      Alert.alert('Não foi possível alterar o status', error.message || 'Verifique o backend.');
    } finally {
      setConfirmAction(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!editarVaga) return;

    const payload = {
      job_title: draft.job_title.trim(),
      company_name: draft.company_name.trim(),
      company_sector: draft.company_sector.trim(),
      job_description: draft.job_description.trim(),
      requirements: draft.requirements.trim(),
      benefits: draft.benefits.trim(),
      location: draft.location.trim(),
      work_model: draft.work_model,
      contract_type: draft.contract_type,
      salary_min: draft.salary_min ? Number(draft.salary_min) : null,
      salary_max: draft.salary_max ? Number(draft.salary_max) : null,
    };

    if (!payload.job_title || !payload.company_name || !payload.job_description) {
      Alert.alert('Dados incompletos', 'Preencha o nome da vaga, a empresa e a descrição antes de salvar.');
      return;
    }

    try {
      const result = await apiFetch(`/recruiters/vacancies/${editarVaga.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      const updatedVacancy = result.vacancy || { ...editarVaga, ...payload, status: 'CLOSED' };
      setVagas((prev) => prev.map((item) => (item.id === editarVaga.id ? { ...item, ...updatedVacancy } : item)));
      setModalVisible(false);
      Alert.alert('Vaga atualizada', 'As alterações foram salvas com sucesso.');
    } catch (error) {
      Alert.alert('Não foi possível editar a vaga', error.message || 'Verifique o backend.');
    }
  };

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
            <Text style={styles.subtitle}>Gerencie o ciclo de vida das oportunidades da sua empresa.</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map((filter) => (
            <Pressable
              key={filter.key}
              style={[styles.filterChip, filtroStatus === filter.key && styles.filterChipSelected]}
              onPress={() => setFiltroStatus(filter.key)}
            >
              <Text style={[styles.filterChipText, filtroStatus === filter.key && styles.filterChipTextSelected]}>{filter.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.searchBox}>
          <Feather name="search" size={18} color={colors.muted} />
          <TextInput value={busca} onChangeText={setBusca} placeholder="Buscar vaga ou empresa" placeholderTextColor={colors.muted} style={styles.searchInput} />
        </View>

        {carregando ? (
          <ActivityIndicator color={colors.primary} size="large" style={styles.loader} />
        ) : vagasFiltradas.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}><Feather name="briefcase" size={28} color={colors.ink} /></View>
            <Text style={styles.emptyTitle}>Nenhuma vaga encontrada</Text>
            <Text style={styles.emptyText}>Novas oportunidades cadastradas pelas empresas aparecerão aqui.</Text>
          </View>
        ) : vagasFiltradas.map((vaga) => (
          <View key={vaga.id} style={styles.jobCard}>
            <View style={styles.jobIcon}><Feather name="briefcase" size={20} color={colors.ink} /></View>
            <View style={styles.jobBody}>
              <View style={styles.jobHeader}>
                <Text style={styles.jobTitle}>{vaga.job_title}</Text>
                <View style={[styles.statusBadge, vaga.status === 'OPEN' ? styles.statusBadgeActive : styles.statusBadgeInactive]}>
                  <Text style={styles.statusBadgeText}>{getStatusLabel(vaga.status)}</Text>
                </View>
              </View>
              <Text style={styles.companyName}>{vaga.company_name}</Text>
              <Text style={styles.location}><Feather name="map-pin" size={13} color={colors.muted} /> {vaga.location || 'Local não informado'}</Text>
              <Text style={styles.jobDescription}>{vaga.job_description}</Text>
              <View style={styles.requirements}><Text style={styles.requirementsLabel}>Requisitos</Text><Text style={styles.requirementsText}>{vaga.requirements || 'Não informado'}</Text></View>

              <View style={styles.actionRow}>
                <Pressable
                  style={[styles.actionButton, styles.editButton, vaga.status === 'OPEN' && styles.actionButtonDisabled]}
                  onPress={() => abrirEdicao(vaga)}
                  disabled={vaga.status === 'OPEN'}
                >
                  <Text style={styles.actionButtonText}>Editar</Text>
                </Pressable>

                <Pressable
                  style={[styles.actionButton, vaga.status === 'OPEN' ? styles.deactivateButton : styles.reactivateButton]}
                  onPress={() => handleStatusToggle(vaga, vaga.status === 'OPEN' ? 'CLOSED' : 'OPEN')}
                >
                  <Text style={styles.actionButtonText}>{vaga.status === 'OPEN' ? 'Desativar' : 'Reativar'}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar vaga inativa</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Nome da vaga</Text>
              <TextInput value={draft.job_title} onChangeText={(value) => atualizarDraft('job_title', value)} style={styles.textInput} />

              <Text style={styles.fieldLabel}>Empresa</Text>
              <TextInput value={draft.company_name} onChangeText={(value) => atualizarDraft('company_name', value)} style={styles.textInput} />

              <Text style={styles.fieldLabel}>Setor</Text>
              <TextInput value={draft.company_sector} onChangeText={(value) => atualizarDraft('company_sector', value)} style={styles.textInput} />

              <Text style={styles.fieldLabel}>Local</Text>
              <TextInput value={draft.location} onChangeText={(value) => atualizarDraft('location', value)} style={styles.textInput} />

              <Text style={styles.fieldLabel}>Descrição</Text>
              <TextInput value={draft.job_description} onChangeText={(value) => atualizarDraft('job_description', value)} multiline style={[styles.textInput, styles.textArea]} />

              <Text style={styles.fieldLabel}>Requisitos</Text>
              <TextInput value={draft.requirements} onChangeText={(value) => atualizarDraft('requirements', value)} multiline style={[styles.textInput, styles.textArea]} />

              <Text style={styles.fieldLabel}>Benefícios</Text>
              <TextInput value={draft.benefits} onChangeText={(value) => atualizarDraft('benefits', value)} multiline style={[styles.textInput, styles.textArea]} />

              <Text style={styles.fieldLabel}>Salário mínimo</Text>
              <TextInput value={draft.salary_min} keyboardType="numeric" onChangeText={(value) => atualizarDraft('salary_min', value)} style={styles.textInput} />

              <Text style={styles.fieldLabel}>Salário máximo</Text>
              <TextInput value={draft.salary_max} keyboardType="numeric" onChangeText={(value) => atualizarDraft('salary_max', value)} style={styles.textInput} />
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable style={[styles.actionButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.actionButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable style={[styles.actionButton, styles.saveButton]} onPress={handleSaveEdit}>
                <Text style={styles.actionButtonText}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={confirmVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Confirmar ação</Text>
            <Text style={styles.confirmText}>
              {confirmAction?.targetStatus === 'CLOSED'
                ? 'Deseja realmente desativar esta vaga? Ela deixará de aparecer para os candidatos, mas continuará salva no sistema.'
                : 'Deseja realmente reativar esta vaga? Ela voltará a aparecer para os candidatos.'}
            </Text>

            <View style={styles.modalActions}>
              <Pressable style={[styles.actionButton, styles.cancelButton]} onPress={() => {
                setConfirmVisible(false);
                setConfirmAction(null);
              }}>
                <Text style={styles.actionButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable style={[styles.actionButton, styles.saveButton]} onPress={confirmStatusChange}>
                <Text style={styles.actionButtonText}>Confirmar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 18, flexWrap: 'wrap' },
  filterChip: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  filterChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  filterChipTextSelected: { color: colors.paper },
  searchBox: { minHeight: 50, borderWidth: 1, borderColor: colors.line, borderRadius: 11, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 18 },
  searchInput: { flex: 1, minWidth: 0, color: colors.ink, fontSize: 14, paddingHorizontal: 10 },
  loader: { marginTop: 40 },
  jobCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 18, marginBottom: 13 },
  jobIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.primaryWash, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  jobBody: { flex: 1 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  jobTitle: { flex: 1, color: colors.ink, fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, alignSelf: 'flex-start' },
  statusBadgeActive: { backgroundColor: '#dff7ea', borderWidth: 1, borderColor: '#3aa76d' },
  statusBadgeInactive: { backgroundColor: '#fce6e6', borderWidth: 1, borderColor: '#d15a5a' },
  statusBadgeText: { color: colors.ink, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  companyName: { color: colors.ink, fontSize: 13, fontWeight: '700', marginTop: 6 },
  location: { color: colors.muted, fontSize: 12, marginTop: 5 },
  jobDescription: { color: colors.inkSoft, fontSize: 13, lineHeight: 20, marginTop: 12 },
  requirements: { backgroundColor: colors.surfaceSoft, borderRadius: 10, padding: 12, marginTop: 11 },
  requirementsLabel: { color: colors.ink, fontSize: 11, fontWeight: '800', marginBottom: 3 },
  requirementsText: { color: colors.inkSoft, fontSize: 12, lineHeight: 18 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14, flexWrap: 'wrap' },
  actionButton: { minHeight: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1 },
  actionButtonText: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  editButton: { backgroundColor: colors.surface, borderColor: colors.line },
  deactivateButton: { backgroundColor: '#f3a7a7', borderColor: '#d96c6c' },
  reactivateButton: { backgroundColor: '#bfe7d0', borderColor: '#4fa770' },
  actionButtonDisabled: { opacity: 0.55 },
  cancelButton: { backgroundColor: colors.surface, borderColor: colors.line },
  saveButton: { backgroundColor: colors.primary, borderColor: colors.primary },
  emptyState: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 30, marginTop: 16 },
  emptyIcon: { width: 56, height: 56, borderRadius: 17, backgroundColor: colors.primaryWash, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: '700' },
  emptyText: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.35)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: colors.paper, borderRadius: 18, padding: 18, maxHeight: '85%' },
  confirmCard: { backgroundColor: colors.paper, borderRadius: 18, padding: 18, width: '100%', maxWidth: 420, alignSelf: 'center' },
  modalTitle: { color: colors.ink, fontSize: 22, fontWeight: '800', marginBottom: 14 },
  confirmTitle: { color: colors.ink, fontSize: 20, fontWeight: '800', marginBottom: 10 },
  confirmText: { color: colors.inkSoft, fontSize: 14, lineHeight: 20, marginBottom: 18 },
  fieldLabel: { color: colors.ink, fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 10 },
  textInput: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.ink,
    fontSize: 13,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 18 },
});
