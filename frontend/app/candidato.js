import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { apiFetch, clearSession, getSession, saveSession } from '../lib/api';
import { colors } from '../lib/theme';
import { useHydratedWidth } from '../lib/useHydratedWidth';

const sections = [
  { id: 'overview', label: 'Visão geral', icon: 'grid' },
  { id: 'jobs', label: 'Encontrar vagas', icon: 'search' },
  { id: 'applications', label: 'Minhas candidaturas', icon: 'file-text' },
  { id: 'profile', label: 'Meu perfil', icon: 'user' },
];

const statusLabels = {
  PENDING: 'Em análise',
  ACCEPTED: 'Aprovada',
  REJECTED: 'Não selecionada',
};

function formatSalary(min, max) {
  if (!min && !max) return 'Salário não informado';
  const currency = (value) => new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', maximumFractionDigits: 0,
  }).format(Number(value));
  if (min && max) return `${currency(min)} — ${currency(max)}`;
  return min ? `A partir de ${currency(min)}` : `Até ${currency(max)}`;
}

function Action({ label, onPress, icon, secondary = false, disabled = false }) {
  return (
    <Pressable
      style={({ hovered, pressed }) => [
        styles.action,
        secondary ? styles.actionSecondary : styles.actionPrimary,
        hovered && !disabled && styles.actionHovered,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
    >
      <Text style={[styles.actionText, secondary && styles.actionSecondaryText]}>{label}</Text>
      {icon ? <Feather name={icon} size={16} color={secondary ? colors.primary : colors.onPrimary} /> : null}
    </Pressable>
  );
}

export default function CandidatePortal() {
  const params = useLocalSearchParams();
  const width = useHydratedWidth();
  const isWide = width >= 980;
  const isCompact = width < 680;
  const [section, setSection] = useState('overview');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [vacancies, setVacancies] = useState([]);
  const [vacancyTotal, setVacancyTotal] = useState(0);
  const [vacancyPage, setVacancyPage] = useState(1);
  const [vacancyPages, setVacancyPages] = useState(1);
  const [workModelFilter, setWorkModelFilter] = useState('ALL');
  const [contractFilter, setContractFilter] = useState('ALL');
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '', course: '' });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [applyingTo, setApplyingTo] = useState(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const session = await getSession();
      if (!session.token || session.user?.user_type !== 'CANDIDATE') {
        router.replace('/login');
        return;
      }
      const [profileData, vacancyData, applicationData] = await Promise.all([
        apiFetch('/candidates/profile'),
        apiFetch('/candidates/vacancies?limit=50'),
        apiFetch('/candidates/applications'),
      ]);
      const candidate = profileData.candidate;
      setUser(session.user);
      setProfile(candidate);
      setProfileForm({
        full_name: candidate.full_name || '',
        phone: candidate.phone || '',
        course: candidate.course || '',
      });
      setVacancies(vacancyData.vacancies || []);
      setVacancyTotal(Number(vacancyData.pagination?.total || 0));
      setVacancyPage(Number(vacancyData.pagination?.page || 1));
      setVacancyPages(Number(vacancyData.pagination?.totalPages || 1));
      setApplications(applicationData.applications || []);
    } catch (loadError) {
      if (loadError.status === 401 || loadError.status === 403) {
        await clearSession();
        router.replace('/login');
        return;
      }
      setError(loadError.message || 'Não foi possível carregar sua área.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { loadData(); }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);
  useEffect(() => {
    const requestedSection = Array.isArray(params.secao) ? params.secao[0] : params.secao;
    if (!sections.some((item) => item.id === requestedSection)) return undefined;
    const timer = setTimeout(() => setSection(requestedSection), 0);
    return () => clearTimeout(timer);
  }, [params.secao]);

  const appliedIds = useMemo(
    () => new Set(applications.map((application) => String(application.vacancy_id))),
    [applications],
  );
  const filteredVacancies = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    return vacancies.filter((vacancy) => {
      const matchesSearch = !term || [
        vacancy.job_title,
        vacancy.company_name,
        vacancy.company_sector,
        vacancy.location,
        vacancy.job_description,
      ].some((value) => String(value || '').toLocaleLowerCase('pt-BR').includes(term));
      const matchesModel = workModelFilter === 'ALL' || vacancy.work_model === workModelFilter;
      const matchesContract = contractFilter === 'ALL' || vacancy.contract_type === contractFilter;
      return matchesSearch && matchesModel && matchesContract;
    });
  }, [search, vacancies, workModelFilter, contractFilter]);

  const apply = async (vacancyId) => {
    if (applyingTo !== null) return;
    setApplyingTo(vacancyId);
    setNotice('');
    setError('');
    try {
      await apiFetch(`/candidates/vacancies/${vacancyId}/apply`, { method: 'POST' });
      setNotice('Candidatura enviada. Você pode acompanhar o andamento nesta página.');
      const { applications: nextApplications = [] } = await apiFetch('/candidates/applications');
      setApplications(nextApplications);
    } catch (applyError) {
      setError(applyError.message || 'Não foi possível enviar sua candidatura.');
    } finally {
      setApplyingTo(null);
    }
  };

  const saveProfile = async () => {
    if (profileForm.full_name.trim().length < 2) {
      setError('Informe seu nome completo para salvar o perfil.');
      return;
    }
    setSavingProfile(true);
    setError('');
    setNotice('');
    try {
      const response = await apiFetch('/candidates/profile', {
        method: 'PUT',
        body: JSON.stringify({
          full_name: profileForm.full_name.trim(),
          phone: profileForm.phone.trim() || null,
          course: profileForm.course.trim() || null,
        }),
      });
      setProfile(response.candidate);
      setUser((current) => ({ ...current, full_name: response.candidate.full_name }));
      const session = await getSession();
      if (session.user) await saveSession(session.token, { ...session.user, full_name: response.candidate.full_name });
      setNotice('Seu perfil foi atualizado.');
    } catch (saveError) {
      setError(saveError.message || 'Não foi possível salvar seu perfil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const signOut = async () => {
    await clearSession();
    router.replace('/');
  };

  const loadMoreVacancies = async () => {
    if (loading || vacancyPage >= vacancyPages) return;
    setLoading(true);
    setError('');
    try {
      const nextPage = vacancyPage + 1;
      const data = await apiFetch(`/candidates/vacancies?page=${nextPage}&limit=50`);
      setVacancies((current) => [...current, ...(data.vacancies || [])]);
      setVacancyPage(Number(data.pagination?.page || nextPage));
      setVacancyPages(Number(data.pagination?.totalPages || vacancyPages));
    } catch (loadError) {
      setError(loadError.message || 'Não foi possível carregar mais vagas.');
    } finally {
      setLoading(false);
    }
  };

  const renderVacancy = (vacancy) => {
    const applied = appliedIds.has(String(vacancy.id));
    return (
      <View key={vacancy.id} style={styles.vacancyCard}>
        <View style={styles.vacancyHeading}>
          <View style={styles.vacancyIcon}><Feather name="briefcase" size={19} color={colors.primary} /></View>
          <View style={styles.vacancyTitleGroup}>
            <Text style={styles.vacancyTitle}>{vacancy.job_title}</Text>
            <Text style={styles.vacancyCompany}>{vacancy.company_name || 'Empresa'}</Text>
          </View>
          {vacancy.work_model ? <Text style={styles.pill}>{vacancy.work_model === 'REMOTE' ? 'Remoto' : vacancy.work_model === 'HYBRID' ? 'Híbrido' : 'Presencial'}</Text> : null}
        </View>
        <Text style={styles.vacancyDescription} numberOfLines={3}>{vacancy.job_description}</Text>
        <View style={styles.vacancyMeta}>
          {vacancy.location ? <Meta icon="map-pin" text={vacancy.location} /> : null}
          {vacancy.contract_type ? <Meta icon="clock" text={vacancy.contract_type} /> : null}
          <Meta icon="dollar-sign" text={formatSalary(vacancy.salary_min, vacancy.salary_max)} />
        </View>
        {vacancy.requirements ? <Text style={styles.requirementText} numberOfLines={2}><Text style={styles.requirementLabel}>Requisitos: </Text>{vacancy.requirements}</Text> : null}
        <View style={styles.vacancyFooter}>
          <Text style={styles.sectorText}>{vacancy.company_sector || 'Oportunidade profissional'}</Text>
          <Action
            label={applied ? 'Candidatura enviada' : applyingTo === vacancy.id ? 'Enviando…' : 'Candidatar-se'}
            icon={applied ? 'check' : 'arrow-right'}
            onPress={() => apply(vacancy.id)}
            disabled={applied || applyingTo !== null}
          />
        </View>
      </View>
    );
  };

  const renderApplications = () => applications.length ? (
    <View style={styles.cardList}>
      {applications.map((application) => (
        <View key={application.id} style={styles.applicationCard}>
          <View style={styles.applicationIcon}><Feather name="file-text" size={18} color={colors.primary} /></View>
          <View style={styles.applicationCopy}>
            <Text style={styles.vacancyTitle}>{application.job_title}</Text>
            <Text style={styles.vacancyCompany}>{application.company_name}</Text>
            <Text style={styles.applicationDate}>Enviada em {new Date(application.applied_at).toLocaleDateString('pt-BR')}</Text>
          </View>
          <Text style={[styles.statusPill, application.status === 'ACCEPTED' && styles.statusAccepted, application.status === 'REJECTED' && styles.statusRejected]}>
            {statusLabels[application.status] || application.status}
          </Text>
        </View>
      ))}
    </View>
  ) : <EmptyState icon="file-text" title="Você ainda não se candidatou" text="Encontre uma vaga que combine com você e acompanhe o processo por aqui." action={() => setSection('jobs')} actionLabel="Ver oportunidades" />;

  const renderProfile = () => (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatar}><Feather name="user" size={25} color={colors.primary} /></View>
        <View style={styles.profileHeaderCopy}>
          <Text style={styles.profileName}>{profile?.full_name || user?.full_name || 'Candidato'}</Text>
          <Text style={styles.profileEmail}>{profile?.email || user?.email}</Text>
        </View>
      </View>
      <Text style={styles.formLabel}>Nome completo</Text>
      <TextInput style={styles.input} value={profileForm.full_name} onChangeText={(value) => setProfileForm((current) => ({ ...current, full_name: value }))} placeholder="Seu nome completo" placeholderTextColor={colors.textMuted} />
      <Text style={styles.formLabel}>Telefone</Text>
      <TextInput style={styles.input} value={profileForm.phone} onChangeText={(value) => setProfileForm((current) => ({ ...current, phone: value }))} placeholder="(00) 00000-0000" placeholderTextColor={colors.textMuted} keyboardType="phone-pad" />
      <Text style={styles.formLabel}>Formação principal</Text>
      <TextInput style={styles.input} value={profileForm.course} onChangeText={(value) => setProfileForm((current) => ({ ...current, course: value }))} placeholder="Curso ou área de formação" placeholderTextColor={colors.textMuted} />
      <Text style={styles.profileNote}>O perfil atual permite editar nome, telefone e formação principal. Cursos múltiplos e experiências ainda não têm campos próprios no banco.</Text>
      <Action label={savingProfile ? 'Salvando…' : 'Salvar perfil'} icon="save" onPress={saveProfile} disabled={savingProfile} />
    </View>
  );

  const renderOverview = () => (
    <>
      <View style={[styles.stats, isWide && styles.statsWide]}>
        <Stat icon="search" value={String(vacancyTotal)} label="Vagas disponíveis" />
        <Stat icon="file-text" value={String(applications.length)} label="Candidaturas enviadas" />
        <Stat icon="clock" value={String(applications.filter((application) => application.status === 'PENDING').length)} label="Em análise" />
      </View>
      <View style={styles.sectionHeader}>
        <View><Text style={styles.sectionTitle}>Oportunidades recentes</Text><Text style={styles.sectionSubtitle}>Vagas abertas publicadas por empresas na plataforma.</Text></View>
        <Pressable onPress={() => setSection('jobs')} style={styles.textButton} accessibilityRole="button"><Text style={styles.textButtonLabel}>Ver todas</Text><Feather name="arrow-right" size={15} color={colors.primary} /></Pressable>
      </View>
      <View style={styles.cardList}>{vacancies.slice(0, 3).map(renderVacancy)}</View>
      <View style={styles.sectionHeader}>
        <View><Text style={styles.sectionTitle}>Suas candidaturas</Text><Text style={styles.sectionSubtitle}>Acompanhe as atualizações do processo.</Text></View>
        <Pressable onPress={() => setSection('applications')} style={styles.textButton} accessibilityRole="button"><Text style={styles.textButtonLabel}>Acompanhar</Text><Feather name="arrow-right" size={15} color={colors.primary} /></Pressable>
      </View>
      {renderApplications()}
    </>
  );

  const sectionTitle = sections.find((item) => item.id === section)?.label || 'Visão geral';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <View style={styles.header}>
          <Pressable style={styles.brand} onPress={() => setSection('overview')} accessibilityRole="button" accessibilityLabel="Conecta Fácil, visão geral">
            <View style={styles.brandMark}><Feather name="link-2" size={17} color={colors.onPrimary} /></View>
            <Text style={styles.brandName}>Conecta Fácil</Text>
          </Pressable>
          {!isCompact ? (
            <View style={styles.desktopNav}>
              {sections.map((item) => <SectionButton key={item.id} item={item} active={section === item.id} onPress={() => setSection(item.id)} />)}
            </View>
          ) : null}
          <View style={styles.headerActions}>
            <Pressable style={styles.signOut} onPress={() => router.push('/mensagens')} accessibilityRole="button" accessibilityLabel="Abrir mensagens"><Feather name="message-circle" size={16} color={colors.primary} /><Text style={styles.signOutLabel}>Mensagens</Text></Pressable>
            <Pressable style={styles.signOut} onPress={signOut} accessibilityRole="button" accessibilityLabel="Sair da conta"><Feather name="log-out" size={16} color={colors.textSecondary} /><Text style={styles.signOutLabel}>Sair</Text></Pressable>
          </View>
        </View>
        {isCompact ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mobileNav}>
            {sections.map((item) => <SectionButton key={item.id} item={item} active={section === item.id} onPress={() => setSection(item.id)} compact />)}
          </ScrollView>
        ) : null}
        <ScrollView style={styles.scroller} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.pageHeading}>
            <View style={styles.headingText}>
              <Text style={styles.eyebrow}>ESPAÇO DO CANDIDATO</Text>
              <Text style={styles.pageTitle}>{section === 'overview' ? `Olá, ${profile?.full_name?.split(' ')[0] || user?.full_name?.split(' ')[0] || 'candidato'}!` : sectionTitle}</Text>
              <Text style={styles.pageSubtitle}>{section === 'overview' ? 'Seu próximo passo profissional começa com uma boa oportunidade.' : section === 'jobs' ? 'Pesquise oportunidades e candidate-se diretamente pela plataforma.' : section === 'applications' ? 'Consulte o andamento das vagas para as quais você se candidatou.' : 'Mantenha seus dados de contato e formação atualizados.'}</Text>
            </View>
            <Pressable style={styles.refreshButton} onPress={loadData} accessibilityRole="button" accessibilityLabel="Atualizar dados"><Feather name="refresh-cw" size={17} color={colors.textSecondary} /></Pressable>
          </View>
          {notice ? <Feedback message={notice} success /> : null}
          {error ? <Feedback message={error} /> : null}
          {loading ? <View style={styles.loading}><ActivityIndicator color={colors.primary} /><Text style={styles.loadingText}>Carregando seus dados…</Text></View> : error && !user ? (
            <EmptyState icon="wifi-off" title="Não foi possível carregar sua área" text={error} action={loadData} actionLabel="Tentar novamente" />
          ) : section === 'overview' ? renderOverview()
            : section === 'jobs' ? (
              <>
                <View style={styles.searchRow}>
                  <Feather name="search" size={18} color={colors.textMuted} />
                  <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Cargo, empresa, área ou cidade" placeholderTextColor={colors.textMuted} returnKeyType="search" />
                  {search ? <Pressable onPress={() => setSearch('')} accessibilityRole="button" accessibilityLabel="Limpar busca"><Feather name="x-circle" size={17} color={colors.textMuted} /></Pressable> : null}
                </View>
                <View style={styles.filterRows}>
                  <FilterRow label="Modalidade" value={workModelFilter} onChange={setWorkModelFilter} options={[
                    ['ALL', 'Todas'], ['REMOTE', 'Remoto'], ['HYBRID', 'Híbrido'], ['ONSITE', 'Presencial'],
                  ]} />
                  <FilterRow label="Contrato" value={contractFilter} onChange={setContractFilter} options={[
                    ['ALL', 'Todos'], ['CLT', 'CLT'], ['PJ', 'PJ'], ['INTERNSHIP', 'Estágio'], ['APPRENTICE', 'Aprendiz'], ['FREELANCE', 'Freelance'], ['TEMPORARY', 'Temporário'],
                  ]} />
                </View>
                {filteredVacancies.length ? <View style={styles.cardList}>{filteredVacancies.map(renderVacancy)}</View> : <EmptyState icon="search" title={search || workModelFilter !== 'ALL' || contractFilter !== 'ALL' ? 'Nenhuma vaga encontrada' : 'Não há vagas disponíveis agora'} text="Ajuste os filtros ou tente outra busca." action={() => { setSearch(''); setWorkModelFilter('ALL'); setContractFilter('ALL'); }} actionLabel="Limpar filtros" />}
                {vacancyPage < vacancyPages ? <Action label={loading ? 'Carregando…' : 'Carregar mais vagas'} icon="plus" onPress={loadMoreVacancies} disabled={loading} /> : null}
              </>
            ) : section === 'applications' ? renderApplications() : renderProfile()}
          <View style={styles.footer}><Text style={styles.footerText}>Conecta Fácil · oportunidades e pessoas, mais perto.</Text></View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function SectionButton({ item, active, onPress, compact = false }) {
  return (
    <Pressable style={[styles.sectionButton, compact && styles.sectionButtonCompact, active && styles.sectionButtonActive]} onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }}>
      <Feather name={item.icon} size={15} color={active ? colors.primary : colors.textSecondary} />
      <Text style={[styles.sectionButtonText, active && styles.sectionButtonTextActive]}>{item.label}</Text>
    </Pressable>
  );
}

function Meta({ icon, text }) {
  return <View style={styles.metaItem}><Feather name={icon} size={13} color={colors.textMuted} /><Text style={styles.metaText}>{text}</Text></View>;
}

function Stat({ icon, value, label }) {
  return <View style={styles.statCard}><View style={styles.statIcon}><Feather name={icon} size={16} color={colors.primary} /></View><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

function Feedback({ message, success = false }) {
  return <View style={[styles.feedback, success && styles.feedbackSuccess]}><Feather name={success ? 'check-circle' : 'alert-circle'} size={16} color={success ? colors.success : colors.danger} /><Text style={[styles.feedbackText, success && styles.feedbackSuccessText]}>{message}</Text></View>;
}

function EmptyState({ icon, title, text, action, actionLabel }) {
  return <View style={styles.emptyState}><View style={styles.emptyIcon}><Feather name={icon} size={22} color={colors.primary} /></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyText}>{text}</Text><Action label={actionLabel} icon="arrow-right" onPress={action} secondary /></View>;
}

function FilterRow({ label, value, onChange, options }) {
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChoices}>
        {options.map(([optionValue, optionLabel]) => (
          <Pressable key={optionValue} style={[styles.filterChip, value === optionValue && styles.filterChipActive]} onPress={() => onChange(optionValue)} accessibilityRole="button" accessibilityState={{ selected: value === optionValue }}>
            <Text style={[styles.filterChipText, value === optionValue && styles.filterChipTextActive]}>{optionLabel}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  page: { flex: 1, minWidth: 0, backgroundColor: colors.background },
  header: { minHeight: 70, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 18, paddingHorizontal: 28, borderBottomWidth: 1, borderBottomColor: colors.border },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  brandMark: { width: 35, height: 35, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: colors.primary },
  brandName: { color: colors.textPrimary, fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  desktopNav: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionButton: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, borderRadius: 10 },
  sectionButtonCompact: { minHeight: 40, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, marginRight: 8 },
  sectionButtonActive: { backgroundColor: colors.surfaceElevated },
  sectionButtonText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  sectionButtonTextActive: { color: colors.primary, fontWeight: '700' },
  signOut: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 11, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.surface },
  signOutLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  mobileNav: { paddingHorizontal: 18, paddingVertical: 10 },
  scroller: { flex: 1 },
  content: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: 28, paddingTop: 32, paddingBottom: 38 },
  pageHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 15, marginBottom: 26 },
  headingText: { flex: 1 },
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.4, marginBottom: 8 },
  pageTitle: { color: colors.textPrimary, fontSize: 29, lineHeight: 37, fontWeight: '800', letterSpacing: -0.8 },
  pageSubtitle: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 6 },
  refreshButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 11, backgroundColor: colors.surface },
  stats: { gap: 12, marginBottom: 29 },
  statsWide: { flexDirection: 'row' },
  statCard: { flex: 1, minHeight: 120, padding: 17, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface },
  statIcon: { width: 31, height: 31, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: colors.surfaceElevated },
  statValue: { color: colors.textPrimary, fontSize: 24, fontWeight: '800', marginTop: 11 },
  statLabel: { color: colors.textSecondary, fontSize: 11, marginTop: 3 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 13, marginTop: 24 },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '750' },
  sectionSubtitle: { color: colors.textMuted, fontSize: 11, lineHeight: 17, marginTop: 4 },
  textButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 7 },
  textButtonLabel: { color: colors.primary, fontSize: 11, fontWeight: '700' },
  cardList: { gap: 12 },
  vacancyCard: { padding: 18, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface },
  vacancyHeading: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  vacancyIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: colors.surfaceElevated },
  vacancyTitleGroup: { flex: 1, minWidth: 0 },
  vacancyTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '750' },
  vacancyCompany: { color: colors.textSecondary, fontSize: 11, marginTop: 4 },
  pill: { color: colors.primary, fontSize: 9, fontWeight: '700', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 20, backgroundColor: colors.surfaceElevated },
  vacancyDescription: { color: colors.textSecondary, fontSize: 12, lineHeight: 19, marginTop: 14 },
  vacancyMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 13 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: colors.textMuted, fontSize: 10 },
  requirementText: { color: colors.textSecondary, fontSize: 11, lineHeight: 17, marginTop: 11 },
  requirementLabel: { color: colors.textPrimary, fontWeight: '700' },
  vacancyFooter: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 16, paddingTop: 13, borderTopWidth: 1, borderTopColor: colors.border },
  sectorText: { color: colors.textMuted, fontSize: 10 },
  action: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 14, borderRadius: 10 },
  actionPrimary: { backgroundColor: colors.primary },
  actionSecondary: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceElevated },
  actionHovered: { opacity: 0.88 },
  actionText: { color: colors.onPrimary, fontSize: 11, fontWeight: '750' },
  actionSecondaryText: { color: colors.textPrimary },
  pressed: { opacity: 0.76 },
  disabled: { opacity: 0.5 },
  searchRow: { minHeight: 51, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.surface },
  filterRows: { gap: 12, marginBottom: 17 },
  filterGroup: { gap: 7 },
  filterLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: '700' },
  filterChoices: { gap: 7 },
  filterChip: { minHeight: 34, justifyContent: 'center', paddingHorizontal: 11, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface },
  filterChipActive: { borderColor: colors.primary, backgroundColor: colors.surfaceElevated },
  filterChipText: { color: colors.textSecondary, fontSize: 10, fontWeight: '600' },
  filterChipTextActive: { color: colors.primary, fontWeight: '700' },
  applicationCard: { minHeight: 83, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: colors.surface },
  applicationIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: colors.surfaceElevated },
  applicationCopy: { flex: 1, minWidth: 0 },
  applicationDate: { color: colors.textMuted, fontSize: 10, marginTop: 5 },
  statusPill: { color: colors.warning, fontSize: 10, fontWeight: '700', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 20, backgroundColor: colors.warningSurface },
  statusAccepted: { color: colors.success, backgroundColor: colors.successSurface },
  statusRejected: { color: colors.danger, backgroundColor: colors.dangerSurface },
  profileCard: { maxWidth: 680, padding: 21, borderWidth: 1, borderColor: colors.border, borderRadius: 15, backgroundColor: colors.surface },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 21, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: colors.border },
  profileAvatar: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: colors.surfaceElevated },
  profileHeaderCopy: { flex: 1 },
  profileName: { color: colors.textPrimary, fontSize: 16, fontWeight: '750' },
  profileEmail: { color: colors.textMuted, fontSize: 11, marginTop: 5 },
  formLabel: { color: colors.textPrimary, fontSize: 11, fontWeight: '700', marginBottom: 7, marginTop: 12 },
  input: { minHeight: 46, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 10, color: colors.textPrimary, backgroundColor: colors.background, fontSize: 13 },
  profileNote: { color: colors.textMuted, fontSize: 10, lineHeight: 16, marginTop: 15, marginBottom: 16 },
  feedback: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginBottom: 15, padding: 12, borderWidth: 1, borderColor: colors.danger, borderRadius: 10, backgroundColor: colors.dangerSurface },
  feedbackSuccess: { borderColor: colors.success, backgroundColor: colors.successSurface },
  feedbackText: { flex: 1, color: colors.danger, fontSize: 11, lineHeight: 17 },
  feedbackSuccessText: { color: colors.success },
  loading: { minHeight: 180, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 11 },
  loadingText: { color: colors.textSecondary, fontSize: 12 },
  emptyState: { alignItems: 'center', paddingHorizontal: 22, paddingVertical: 30, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface },
  emptyIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: colors.surfaceElevated },
  emptyTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', textAlign: 'center', marginTop: 13 },
  emptyText: { maxWidth: 450, color: colors.textSecondary, fontSize: 11, lineHeight: 18, textAlign: 'center', marginTop: 6, marginBottom: 15 },
  footer: { alignItems: 'center', paddingTop: 32 },
  footerText: { color: colors.textMuted, fontSize: 10 },
});
