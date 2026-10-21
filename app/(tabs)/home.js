import React, { useContext, useState, useEffect } from 'react';
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { SessionContext } from '../../context/SessionContext';
import { clearToken, apiFetch, getAssetUrl } from '../../lib/api';

import Header from '../../components/layout/Header';
import NotificationModal from '../../components/modals/NotificationModal';
import ProfileMenuModal from '../../components/modals/ProfileMenuModal';
import JobCard from '../../components/jobs/JobCard';

const colors = Colors.light;

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'Salário a combinar';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(amount);
};

const formatTimeAgo = (value) => {
  if (!value) return 'Recente';

  const diffMs = Date.now() - new Date(value).getTime();
  const diffHours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));

  if (diffHours < 24) return `Há ${diffHours}h`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return `Há ${diffDays} dia${diffDays === 1 ? '' : 's'}`;
  const diffMonths = Math.round(diffDays / 30);
  return `Há ${diffMonths} mês${diffMonths === 1 ? '' : 'es'}`;
};

const normalizeJob = (vacancy) => ({
  id: String(vacancy.id),
  vacancyId: vacancy.id,
  company: vacancy.company_name || 'Empresa',
  logoUri: getAssetUrl(vacancy.company_logo_url),
  category: vacancy.company_sector || '',
  timeAgo: formatTimeAgo(vacancy.created_at),
  createdAt: vacancy.created_at ? new Date(vacancy.created_at) : new Date(),
  title: (vacancy.job_title || 'Vaga disponível').toUpperCase(),
  description: vacancy.job_description || 'Descrição não informada.',
  salary: vacancy.salary_min || vacancy.salary_max
    ? `${formatCurrency(vacancy.salary_min || vacancy.salary_max)}${vacancy.salary_min && vacancy.salary_max ? ` - ${formatCurrency(vacancy.salary_max)}` : ''}`
    : null,
  salaryMin: vacancy.salary_min == null ? null : Number(vacancy.salary_min),
  salaryMax: vacancy.salary_max == null ? null : Number(vacancy.salary_max),
  location: vacancy.location || '',
  workModel: ({ REMOTE: 'Remoto', HYBRID: 'Híbrido', ONSITE: 'Presencial' })[vacancy.work_model] || '',
  workModelCode: vacancy.work_model || '',
  contractType: ({ CLT: 'CLT', PJ: 'PJ', INTERNSHIP: 'Estágio', FREELANCE: 'Freelancer' })[vacancy.contract_type] || '',
  logoBg: colors.primaryWash,
  logoTextColor: colors.text,
  isRemote: vacancy.work_model === 'REMOTE',
});

export default function HomeScreen() {
  const { sessionData, setSessionData } = useContext(SessionContext);
  const isEmployer = sessionData?.user?.user_type === 'RECRUITER';

  const [selectedFilter, setSelectedFilter] = useState('Para você');
  const [searchText, setSearchText] = useState('');
  const [advancedFilters, setAdvancedFilters] = useState({ company_sector: '', location: '', work_model: '', contract_type: '', salary_min: '', salary_max: '' });
  const [draftFilters, setDraftFilters] = useState(advancedFilters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [jobDetails, setJobDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSettingsActive, setIsSettingsActive] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [jobs, setJobs] = useState([]);
  const [employerJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [errorJobs, setErrorJobs] = useState('');
  const [refreshJobs, setRefreshJobs] = useState(0);
  const [applyingToJob, setApplyingToJob] = useState(null);
  const [savingVacancyId, setSavingVacancyId] = useState(null);
  const [favoriteVacancyIds, setFavoriteVacancyIds] = useState([]);
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [appliedVacancyIds, setAppliedVacancyIds] = useState([]);

  const router = useRouter();

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoadingJobs(true);
      setErrorJobs('');
      const params = new URLSearchParams({ page: '1', limit: '50' });
      const term = searchText.trim().replace(/\s+/g, ' ');
      if (term) params.set('q', term);
      if (advancedFilters.company_sector.trim()) params.set('company_sector', advancedFilters.company_sector.trim());
      if (advancedFilters.location.trim()) params.set('location', advancedFilters.location.trim());
      if (advancedFilters.salary_min) params.set('salary_min', advancedFilters.salary_min);
      if (advancedFilters.salary_max) params.set('salary_max', advancedFilters.salary_max);
      if (advancedFilters.contract_type) params.set('contract_type', advancedFilters.contract_type);
      if (selectedFilter === 'Remotos' && advancedFilters.work_model && advancedFilters.work_model !== 'REMOTE') {
        if (active) {
          setJobs([]);
          setLoadingJobs(false);
        }
        return;
      }
      const workModel = selectedFilter === 'Remotos' ? 'REMOTE' : advancedFilters.work_model;
      if (workModel) params.set('work_model', workModel);

      try {
        const data = await apiFetch(`/candidates/vacancies?${params.toString()}`);
        if (active) setJobs((data.vacancies || []).map(normalizeJob));
      } catch (error) {
        if (active) {
          setJobs([]);
          setErrorJobs(error.message || 'Não foi possível conectar ao servidor.');
        }
      } finally {
        if (active) setLoadingJobs(false);
      }
    }, searchText.trim() ? 350 : 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchText, advancedFilters, selectedFilter, refreshJobs]);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      apiFetch('/candidates/favorites'),
      apiFetch('/candidates/applications'),
    ]).then(([favoritesResult, applicationsResult]) => {
      if (!active) return;
      if (favoritesResult.status === 'fulfilled') {
        const favorites = favoritesResult.value.favorites || [];
        setFavoriteJobs(favorites.map(normalizeJob));
        setFavoriteVacancyIds(favorites.map((favorite) => String(favorite.id)));
      }
      if (applicationsResult.status === 'fulfilled') {
        const items = applicationsResult.value.applications || [];
        setApplications(items);
        setAppliedVacancyIds(items.map((application) => String(application.vacancy_id)));
      }
    });
    return () => { active = false; };
  }, []);

  const applyToJob = async (vacancyId) => {
    if (applyingToJob !== null) return;

    setApplyingToJob(String(vacancyId));
    try {
      const result = await apiFetch(`/candidates/vacancies/${vacancyId}/apply`, { method: 'POST' });
      setAppliedVacancyIds((current) => [...new Set([...current, String(vacancyId)])]);
      const application = result.application;
      if (application) {
        setApplications((current) => [{ ...application, id: application.id || String(vacancyId), vacancy_id: vacancyId, job_title: jobDetails?.job_title, company_name: jobDetails?.company_name }, ...current]);
        setJobDetails((current) => current ? { ...current, already_applied: true, application_status: application.status } : current);
        apiFetch('/candidates/applications').then((data) => setApplications(data.applications || [])).catch(() => {});
      }
      Alert.alert('Candidatura enviada', 'A empresa poderá conversar com você pela aba Mensagens.');
    } catch (error) {
      Alert.alert('Não foi possível se candidatar', error.message || 'Tente novamente.');
    } finally {
      setApplyingToJob(null);
    }
  };

  const confirmApplication = (vacancyId) => {
    const submit = () => applyToJob(vacancyId);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm('Deseja se candidatar a esta vaga?')) submit();
      return;
    }
    Alert.alert('Confirmar candidatura', 'Deseja se candidatar a esta vaga?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Candidatar-se', onPress: submit },
    ]);
  };

  const toggleFavorite = async (job) => {
    if (savingVacancyId) return;
    const vacancyId = String(job.vacancyId);
    const isSaved = favoriteVacancyIds.includes(vacancyId);
    setSavingVacancyId(vacancyId);
    try {
      await apiFetch(`/candidates/vacancies/${vacancyId}/favorite`, { method: isSaved ? 'DELETE' : 'PUT' });
      if (isSaved) {
        setFavoriteVacancyIds((current) => current.filter((id) => id !== vacancyId));
        setFavoriteJobs((current) => current.filter((favorite) => String(favorite.vacancyId) !== vacancyId));
      } else {
        setFavoriteVacancyIds((current) => [...new Set([...current, vacancyId])]);
        setFavoriteJobs((current) => [job, ...current.filter((favorite) => String(favorite.vacancyId) !== vacancyId)]);
        const result = await apiFetch('/candidates/favorites');
        const favorites = result.favorites || [];
        setFavoriteJobs(favorites.map(normalizeJob));
        setFavoriteVacancyIds(favorites.map((favorite) => String(favorite.id)));
      }
    } catch (error) {
      Alert.alert('Não foi possível atualizar vagas salvas', error.message || 'Tente novamente.');
    } finally {
      setSavingVacancyId(null);
    }
  };

  const openJobDetails = async (job) => {
    setLoadingDetails(true);
    setJobDetails({ loading: true, job });
    try {
      const result = await apiFetch(`/candidates/vacancies/${job.vacancyId}`);
      setJobDetails(result.vacancy);
    } catch (error) {
      setJobDetails(null);
      Alert.alert('Não foi possível carregar os detalhes', error.message || 'Tente novamente.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleLogout = async () => {
    setShowProfileMenu(false);
    setIsLoggingOut(true);

    try {
      await clearToken();
      setSessionData(null);
      setTimeout(() => {
        setIsLoggingOut(false);
        router.replace('/');
      }, 400);
    } catch (error) {
      setIsLoggingOut(false);
      Alert.alert('Não foi possível sair', error.message);
    }
  };

  const handleGoToProfile = () => {
    setShowProfileMenu(false);
    router.push('/perfil');
  };

  const handleGoToApplications = async () => {
    setShowProfileMenu(false);
    setShowApplications(true);
    try {
      const data = await apiFetch('/candidates/applications');
      setApplications(data.applications || []);
    } catch (error) {
      Alert.alert('Não foi possível carregar candidaturas', error.message || 'Tente novamente.');
    }
  };

  const handleOpenMessages = () => {
    router.push('/(tabs)/index1');
  };

  const toggleNotifications = async () => {
    const shouldOpen = !showNotification;
    setShowNotification(shouldOpen);
    setShowProfileMenu(false);
    if (!shouldOpen) return;

    try {
      const data = await apiFetch('/candidates/applications');
      setApplications(data.applications || []);
    } catch (error) {
      Alert.alert('Não foi possível carregar atualizações', error.message || 'Tente novamente.');
    }
  };

  const handleGoToSettings = () => {
    setIsSettingsActive(true);
    setShowNotification(false);
    setShowProfileMenu(false);

    setTimeout(() => {
      setIsSettingsActive(false);
      router.push('/configuracoes');
    }, 150);
  };

  const handleCreateJob = () => {
    // Redireciona para a tela de criação de vagas (ajuste a rota se necessário)
    router.push('/criar-vaga');
  };

  const getFilteredJobs = () => {
    if (selectedFilter === 'Salvas') {
      const query = searchText.trim().toLocaleLowerCase('pt-BR');
      return favoriteJobs.filter((job) => {
        const matchesQuery = !query || [job.title, job.company, job.category, job.description, job.location]
          .some((value) => value?.toLocaleLowerCase('pt-BR').includes(query));
        const matchesSector = !advancedFilters.company_sector || job.category.toLocaleLowerCase('pt-BR').includes(advancedFilters.company_sector.toLocaleLowerCase('pt-BR'));
        const matchesLocation = !advancedFilters.location || job.location.toLocaleLowerCase('pt-BR').includes(advancedFilters.location.toLocaleLowerCase('pt-BR'));
        const matchesModel = (selectedFilter !== 'Remotos' || job.workModelCode === 'REMOTE')
          && (!advancedFilters.work_model || job.workModelCode === advancedFilters.work_model);
        const matchesContract = !advancedFilters.contract_type || job.contractType === ({ CLT: 'CLT', PJ: 'PJ', INTERNSHIP: 'Estágio', FREELANCE: 'Freelancer' })[advancedFilters.contract_type];
        const matchesMinimum = !advancedFilters.salary_min || (job.salaryMax !== null && job.salaryMax >= Number(advancedFilters.salary_min));
        const matchesMaximum = !advancedFilters.salary_max || (job.salaryMin !== null && job.salaryMin <= Number(advancedFilters.salary_max));
        return matchesQuery && matchesSector && matchesLocation && matchesModel && matchesContract && matchesMinimum && matchesMaximum;
      });
    }

    if (selectedFilter === 'Remotos') {
      return jobs.filter((job) => job.isRemote);
    }

    const recentJobs = [...jobs].sort((a, b) => b.createdAt - a.createdAt);
    if (selectedFilter !== 'Para você') return recentJobs;

    const course = sessionData?.profile?.course?.trim().toLocaleLowerCase('pt-BR');
    if (!course) return recentJobs;

    const matchingJobs = recentJobs.filter((job) =>
      [job.category, job.title, job.description]
        .some((value) => value.toLocaleLowerCase('pt-BR').includes(course))
    );
    return matchingJobs.length
      ? [...matchingJobs, ...recentJobs.filter((job) => !matchingJobs.includes(job))]
      : recentJobs;
  };

  const filteredJobs = getFilteredJobs();

  return (
    <SafeAreaView style={styles.homeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Modal de Logout */}
      <Modal visible={isLoggingOut} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.tint} />
            <Text style={styles.loadingText}>Saindo...</Text>
          </View>
        </View>
      </Modal>

      <Header
        avatarUri={getAssetUrl(sessionData?.profile?.avatar_url || sessionData?.user?.avatar_url)}
        showNotification={showNotification}
        onToggleNotification={toggleNotifications}
        onGoToSettings={handleGoToSettings}
        isSettingsActive={isSettingsActive}
        onToggleProfileMenu={() => {
          setShowNotification(false);
          setShowProfileMenu(!showProfileMenu);
        }}
        onOpenMessages={handleOpenMessages}
        searchText={searchText}
        onSearchChange={setSearchText}
        onSearchSubmit={() => setSearchText((value) => value.trim().replace(/\s+/g, ' '))}
        onClearSearch={() => setSearchText('')}
      />

      <NotificationModal
        visible={showNotification}
        onClose={() => setShowNotification(false)}
        applications={applications}
      />

      <ProfileMenuModal
        visible={showProfileMenu}
        onClose={() => setShowProfileMenu(false)}
        onGoToProfile={handleGoToProfile}
        onGoToApplications={handleGoToApplications}
        onLogout={handleLogout}
      />

      <Modal visible={showApplications} transparent animationType="fade" onRequestClose={() => setShowApplications(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowApplications(false)} accessibilityLabel="Fechar candidaturas" />
          <View style={styles.detailSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Minhas candidaturas</Text>
              <TouchableOpacity onPress={() => setShowApplications(false)} accessibilityLabel="Fechar candidaturas"><Feather name="x" size={22} color={colors.muted} /></TouchableOpacity>
            </View>
            <ScrollView>
              {applications.length ? applications.map((application) => (
                <View key={application.id} style={styles.applicationRow}>
                  <Text style={styles.applicationTitle}>{application.job_title}</Text>
                  <Text style={styles.applicationCompany}>{application.company_name}</Text>
                  <View style={styles.applicationMetaRow}>
                    <Text style={styles.applicationStatus}>{({ PENDING: 'Em análise', ACCEPTED: 'Aprovado', REJECTED: 'Reprovado' })[application.status] || application.status}</Text>
                    {application.applied_at ? <Text style={styles.applicationDate}>{new Date(application.applied_at).toLocaleDateString('pt-BR')}</Text> : null}
                  </View>
                </View>
              )) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyTitle}>Você ainda não se candidatou</Text>
                  <Text style={styles.emptySubText}>Encontre uma oportunidade e acompanhe o andamento por aqui.</Text>
                  <TouchableOpacity onPress={() => setShowApplications(false)} style={styles.retryButton}><Text style={styles.retryButtonText}>Buscar oportunidades</Text></TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.homeContent}
      >
        {isEmployer ? (
          /* ==================== TELA DO EMPRESÁRIO ==================== */
          <View style={styles.employerSection}>
            {/* Barra Arredondada de Criar Vaga */}
            <View style={styles.createJobBarContainer}>
              <TouchableOpacity
                style={styles.createJobPillButton}
                activeOpacity={0.8}
                onPress={handleCreateJob}
              >
                <Text style={styles.createJobPillText}>Criar Vaga</Text>
                <Feather name="plus-circle" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Conteúdo: Estado Vazio ou Lista de Vagas */}
            {employerJobs.length === 0 ? (
              <View style={styles.emptyEmployerContainer}>
                <Text style={styles.emptyEmployerText}>Não há vaga criada</Text>
              </View>
            ) : (
              employerJobs.map((job) => (
                <View key={job.id} style={styles.employerJobCard}>
                  <Text style={styles.employerJobTitle}>{job.title}</Text>
                  <Text style={styles.employerJobDetails}>{job.category}</Text>
                </View>
              ))
            )}
          </View>
        ) : (
          /* ==================== TELA DO CANDIDATO ==================== */
          <>
            <View style={styles.filterContainer}>
              {['Para você', 'Recentes', 'Remotos', 'Salvas'].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setSelectedFilter(filter)}
                  style={[
                    styles.filterChip,
                    selectedFilter === filter && styles.activeFilterChip,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selectedFilter === filter && styles.activeFilterText,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.advancedFilterButton}
                onPress={() => {
                  setDraftFilters(advancedFilters);
                  setShowAdvancedFilters(true);
                }}
                accessibilityRole="button"
                accessibilityLabel="Abrir filtros avançados"
              >
                <Feather name="sliders" size={15} color={colors.primaryDark} />
                <Text style={styles.advancedFilterText}>Filtros</Text>
              </TouchableOpacity>
            </View>

            {loadingJobs ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color={colors.tint} />
                <Text style={styles.emptySubText}>Carregando vagas do portal…</Text>
              </View>
            ) : errorJobs ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Não foi possível carregar as vagas</Text>
                <Text style={styles.emptySubText}>{errorJobs}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => setRefreshJobs((current) => current + 1)}>
                  <Text style={styles.retryButtonText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job, index) => {
                const isHighlight = selectedFilter === 'Recentes' && index === 0;

                return (
                  <View
                    key={job.id}
                    style={isHighlight ? styles.mostRecentHighlight : null}
                  >
                    {isHighlight && (
                      <View style={styles.recentBadge}>
                        <Text style={styles.recentBadgeText}>Mais recente</Text>
                      </View>
                    )}
                    <JobCard
                      item={job}
                      onApply={confirmApplication}
                      onSave={toggleFavorite}
                      onOpenDetails={openJobDetails}
                      isSaved={favoriteVacancyIds.includes(String(job.vacancyId))}
                      isSaving={savingVacancyId === String(job.vacancyId)}
                      isApplied={appliedVacancyIds.includes(String(job.vacancyId))}
                      isApplying={applyingToJob === String(job.vacancyId)}
                    />
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>{selectedFilter === 'Salvas' ? 'Nenhuma vaga salva' : searchText.trim() ? 'Nenhum resultado para sua pesquisa' : 'Nenhuma vaga encontrada'}</Text>
                <Text style={styles.emptySubText}>
                  {selectedFilter === 'Salvas'
                    ? 'Use o marcador nos cartões para guardar oportunidades.'
                    : searchText.trim()
                      ? 'Tente outros termos ou limpe a pesquisa.'
                      : 'Não encontramos oportunidades disponíveis no momento. Ajuste os filtros ou volte mais tarde.'}
                </Text>
                {searchText.trim() ? <TouchableOpacity style={styles.retryButton} onPress={() => setSearchText('')}><Text style={styles.retryButtonText}>Limpar pesquisa</Text></TouchableOpacity> : null}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={showAdvancedFilters} transparent animationType="slide" onRequestClose={() => setShowAdvancedFilters(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowAdvancedFilters(false)} accessibilityLabel="Fechar filtros avançados" />
          <View style={styles.filterSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros avançados</Text>
              <TouchableOpacity onPress={() => setShowAdvancedFilters(false)} accessibilityLabel="Fechar filtros"><Feather name="x" size={22} color={colors.muted} /></TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.fieldLabel}>Área profissional</Text>
              <TextInput value={draftFilters.company_sector} onChangeText={(value) => setDraftFilters((current) => ({ ...current, company_sector: value }))} placeholder="Ex.: Tecnologia" style={styles.filterInput} />
              <Text style={styles.fieldLabel}>Localização</Text>
              <TextInput value={draftFilters.location} onChangeText={(value) => setDraftFilters((current) => ({ ...current, location: value }))} placeholder="Cidade ou região" style={styles.filterInput} />
              <Text style={styles.fieldLabel}>Modalidade</Text>
              <View style={styles.optionRow}>
                {[['', 'Todas'], ['ONSITE', 'Presencial'], ['HYBRID', 'Híbrido'], ['REMOTE', 'Remoto']].map(([value, label]) => (
                  <TouchableOpacity key={value || 'all-models'} onPress={() => setDraftFilters((current) => ({ ...current, work_model: value }))} style={[styles.optionChip, draftFilters.work_model === value && styles.optionChipSelected]}>
                    <Text style={[styles.optionText, draftFilters.work_model === value && styles.optionTextSelected]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.fieldLabel}>Tipo de contratação</Text>
              <View style={styles.optionRow}>
                {[['', 'Todos'], ['CLT', 'CLT'], ['PJ', 'PJ'], ['INTERNSHIP', 'Estágio'], ['FREELANCE', 'Freelancer']].map(([value, label]) => (
                  <TouchableOpacity key={value || 'all-contracts'} onPress={() => setDraftFilters((current) => ({ ...current, contract_type: value }))} style={[styles.optionChip, draftFilters.contract_type === value && styles.optionChipSelected]}>
                    <Text style={[styles.optionText, draftFilters.contract_type === value && styles.optionTextSelected]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.fieldLabel}>Salário mensal (R$), quando informado</Text>
              <View style={styles.salaryInputs}>
                <TextInput value={draftFilters.salary_min} onChangeText={(value) => setDraftFilters((current) => ({ ...current, salary_min: value.replace(/[^0-9]/g, '') }))} placeholder="Mínimo" keyboardType="numeric" style={[styles.filterInput, styles.salaryInput]} accessibilityLabel="Salário mínimo" />
                <TextInput value={draftFilters.salary_max} onChangeText={(value) => setDraftFilters((current) => ({ ...current, salary_max: value.replace(/[^0-9]/g, '') }))} placeholder="Máximo" keyboardType="numeric" style={[styles.filterInput, styles.salaryInput]} accessibilityLabel="Salário máximo" />
              </View>
            </ScrollView>
            <View style={styles.filterActions}>
              <TouchableOpacity onPress={() => setDraftFilters({ company_sector: '', location: '', work_model: '', contract_type: '', salary_min: '', salary_max: '' })} style={styles.clearFilterButton}>
                <Text style={styles.clearFilterText}>Limpar filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setAdvancedFilters(draftFilters); setShowAdvancedFilters(false); }} style={styles.applyFilterButton}>
                <Text style={styles.applyFilterText}>Aplicar filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={Boolean(jobDetails)} transparent animationType="fade" onRequestClose={() => setJobDetails(null)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setJobDetails(null)} accessibilityLabel="Fechar detalhes da vaga" />
          <View style={styles.detailSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes da oportunidade</Text>
              <TouchableOpacity onPress={() => setJobDetails(null)} accessibilityLabel="Fechar detalhes"><Feather name="x" size={22} color={colors.muted} /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {loadingDetails ? <ActivityIndicator size="large" color={colors.tint} /> : null}
              <Text style={styles.detailJobTitle}>{jobDetails?.job_title || jobDetails?.job?.title}</Text>
              <Text style={styles.detailCompany}>{jobDetails?.company_name || jobDetails?.job?.company}</Text>
              {jobDetails?.company_sector ? <Text style={styles.detailSector}>{jobDetails.company_sector}</Text> : null}
              <Text style={styles.detailSectionTitle}>Descrição</Text>
              <Text style={styles.detailBody}>{jobDetails?.job_description || jobDetails?.job?.description}</Text>
              {jobDetails?.requirements ? <><Text style={styles.detailSectionTitle}>Requisitos</Text><Text style={styles.detailBody}>{jobDetails.requirements}</Text></> : null}
              {jobDetails?.benefits ? <><Text style={styles.detailSectionTitle}>Benefícios</Text><Text style={styles.detailBody}>{jobDetails.benefits}</Text></> : null}
              <View style={styles.detailMeta}>
                {jobDetails?.location ? <Text style={styles.detailBody}>{jobDetails.location}</Text> : null}
                {jobDetails?.work_model ? <Text style={styles.detailBody}>{{ REMOTE: 'Remoto', HYBRID: 'Híbrido', ONSITE: 'Presencial' }[jobDetails.work_model]}</Text> : null}
                {jobDetails?.contract_type ? <Text style={styles.detailBody}>{{ CLT: 'CLT', PJ: 'PJ', INTERNSHIP: 'Estágio', FREELANCE: 'Freelancer' }[jobDetails.contract_type]}</Text> : null}
                {jobDetails?.salary_min || jobDetails?.salary_max ? <Text style={styles.detailBody}>{formatCurrency(jobDetails.salary_min || jobDetails.salary_max)}{jobDetails.salary_min && jobDetails.salary_max ? ` - ${formatCurrency(jobDetails.salary_max)}` : ''}</Text> : null}
              </View>
              {jobDetails?.created_at ? <Text style={styles.detailDate}>Publicada em {new Date(jobDetails.created_at).toLocaleDateString('pt-BR')}</Text> : null}
            </ScrollView>
            {jobDetails && !jobDetails.loading ? (
              <View style={styles.detailActions}>
                <TouchableOpacity onPress={() => toggleFavorite(normalizeJob(jobDetails))} style={styles.detailSaveButton} accessibilityLabel={favoriteVacancyIds.includes(String(jobDetails.id)) ? 'Remover vaga das salvas' : 'Salvar vaga'}>
                  <Feather name="bookmark" size={18} color={favoriteVacancyIds.includes(String(jobDetails.id)) ? colors.primaryDark : colors.muted} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => jobDetails.already_applied ? null : confirmApplication(jobDetails.id)}
                  disabled={jobDetails.already_applied || applyingToJob === String(jobDetails.id)}
                  style={[styles.detailApplyButton, jobDetails.already_applied && styles.detailApplyDisabled]}
                >
                  <Text style={styles.detailApplyText}>{jobDetails.already_applied ? `Candidatado · ${({ PENDING: 'Em análise', ACCEPTED: 'Aprovado', REJECTED: 'Reprovado' })[jobDetails.application_status] || jobDetails.application_status}` : applyingToJob === String(jobDetails.id) ? 'Enviando...' : 'Tenho interesse'}</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  homeContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  // Candidato
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 10,
  },
  filterChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  activeFilterChip: {
    backgroundColor: colors.tint,
    borderColor: colors.tint,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted,
  },
  activeFilterText: {
    color: colors.text,
  },
  advancedFilterButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: colors.line, borderRadius: 18, backgroundColor: colors.surface },
  advancedFilterText: { color: colors.primaryDark, fontSize: 13, fontWeight: '700' },
  retryButton: { marginTop: 14, borderWidth: 1, borderColor: colors.tint, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  retryButtonText: { color: colors.primaryDark, fontSize: 13, fontWeight: '700' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 18, backgroundColor: 'rgba(0,0,0,0.36)' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  filterSheet: { width: '100%', maxWidth: 520, maxHeight: '88%', backgroundColor: colors.surface, borderRadius: 16, padding: 20 },
  detailSheet: { width: '100%', maxWidth: 560, maxHeight: '88%', backgroundColor: colors.surface, borderRadius: 16, padding: 20 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  fieldLabel: { color: colors.inkSoft, fontSize: 13, fontWeight: '700', marginTop: 14, marginBottom: 7 },
  filterInput: { minHeight: 44, borderWidth: 1, borderColor: colors.line, borderRadius: 9, paddingHorizontal: 12, color: colors.text, backgroundColor: colors.background },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  optionChip: { borderWidth: 1, borderColor: colors.line, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 7 },
  optionChipSelected: { backgroundColor: colors.tint, borderColor: colors.tint },
  optionText: { color: colors.inkSoft, fontSize: 12, fontWeight: '600' },
  optionTextSelected: { color: colors.text },
  salaryInputs: { flexDirection: 'row', gap: 10 },
  salaryInput: { flex: 1 },
  filterActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 18 },
  clearFilterButton: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 44, borderWidth: 1, borderColor: colors.line, borderRadius: 9 },
  clearFilterText: { color: colors.inkSoft, fontWeight: '700' },
  applyFilterButton: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 44, backgroundColor: colors.tint, borderRadius: 9 },
  applyFilterText: { color: colors.text, fontWeight: '800' },
  detailJobTitle: { color: colors.text, fontSize: 21, fontWeight: '800', marginBottom: 5 },
  detailCompany: { color: colors.inkSoft, fontSize: 15, fontWeight: '700' },
  detailSector: { color: colors.primaryDark, fontSize: 13, marginTop: 4 },
  detailSectionTitle: { color: colors.text, fontSize: 14, fontWeight: '800', marginTop: 20, marginBottom: 6 },
  detailBody: { color: colors.inkSoft, fontSize: 14, lineHeight: 21 },
  detailMeta: { gap: 5, marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.line },
  detailDate: { color: colors.muted, fontSize: 12, marginTop: 12 },
  detailActions: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 16 },
  detailSaveButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryWash, alignItems: 'center', justifyContent: 'center' },
  detailApplyButton: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 44, borderRadius: 22, backgroundColor: colors.tint },
  detailApplyDisabled: { opacity: 0.65 },
  detailApplyText: { color: colors.text, fontWeight: '800' },
  applicationRow: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.line },
  applicationTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  applicationCompany: { color: colors.inkSoft, fontSize: 13, marginTop: 3 },
  applicationMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 9 },
  applicationStatus: { color: colors.primaryDark, fontSize: 12, fontWeight: '700' },
  applicationDate: { color: colors.muted, fontSize: 12 },
  mostRecentHighlight: {
    borderWidth: 2,
    borderColor: colors.tint,
    borderRadius: 12,
    marginBottom: 16,
    position: 'relative',
  },
  recentBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: colors.tint,
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 10,
    zIndex: 1,
  },
  recentBadgeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    elevation: 5,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },

  // Empresário (Igual à foto)
  employerSection: {
    marginTop: 10,
  },
  createJobBarContainer: {
    width: '100%',
    height: 54,
    backgroundColor: colors.surfaceSoft,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  createJobPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryWash,
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.line,
    gap: 6,
  },
  createJobPillText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  emptyEmployerContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  emptyEmployerText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.muted,
  },
  employerJobCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  employerJobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  employerJobDetails: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },
});