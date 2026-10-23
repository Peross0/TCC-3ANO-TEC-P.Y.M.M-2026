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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SessionContext } from '../../context/SessionContext';
import { useAppPreferences } from '../../context/PreferencesContext';
import { clearToken, apiFetch, getAssetUrl } from '../../lib/api';
import { formatBrasiliaDateTime, parseApiDate } from '../../lib/dateTime';
import AnimatedScreen from '../../components/layout/AnimatedScreen';

import Header from '../../components/layout/Header';
import NotificationModal from '../../components/modals/NotificationModal';
import ProfileMenuModal from '../../components/modals/ProfileMenuModal';
import JobCard from '../../components/jobs/JobCard';

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'Salário a combinar';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(amount);
};

const formatTimeAgo = (value, now = Date.now()) => {
  const date = parseApiDate(value);
  if (!date) return 'Data indisponível';

  const diffMs = now - date.getTime();
  if (diffMs < 0) return 'Em breve';
  if (diffMs < 60_000) return 'Agora';
  if (diffMs < 60 * 60_000) return `Há ${Math.floor(diffMs / 60_000)} min`;
  if (diffMs < 24 * 60 * 60_000) return `Há ${Math.floor(diffMs / (60 * 60_000))}h`;
  if (diffMs < 30 * 24 * 60 * 60_000) {
    const days = Math.floor(diffMs / (24 * 60 * 60_000));
    return `Há ${days} dia${days === 1 ? '' : 's'}`;
  }

  return formatBrasiliaDateTime(date);
};

const normalizeJob = (vacancy, now) => ({
  id: String(vacancy.id),
  vacancyId: vacancy.id,
  company: vacancy.company_name || 'Empresa',
  logoUri: getAssetUrl(vacancy.company_logo_url),
  category: vacancy.company_sector || 'Empresa',
  timeAgo: formatTimeAgo(vacancy.created_at, now),
  createdAt: parseApiDate(vacancy.created_at) || new Date(0),
  dateTimeLabel: formatBrasiliaDateTime(vacancy.created_at),
  title: (vacancy.job_title || 'Vaga disponível').toUpperCase(),
  description: vacancy.job_description || 'Descrição não informada.',
  salary: vacancy.salary_min || vacancy.salary_max
    ? `${formatCurrency(vacancy.salary_min || vacancy.salary_max)}${vacancy.salary_min && vacancy.salary_max ? ` - ${formatCurrency(vacancy.salary_max)}` : ''}`
    : 'Salário a combinar',
  vacancies: '1 vaga',
  isRemote: vacancy.work_model === 'REMOTE',
});

export default function HomeScreen() {
  const { sessionData, setSessionData } = useContext(SessionContext);
  const { colors, preferences, isDark } = useAppPreferences();
  const styles = makeStyles(colors, preferences.large_text);
  const isEmployer = sessionData?.user?.user_type === 'RECRUITER';

  const [selectedFilter, setSelectedFilter] = useState('Para você');
  const [showNotification, setShowNotification] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSettingsActive, setIsSettingsActive] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [jobs, setJobs] = useState([]);
  const [employerJobs, setEmployerJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [applyingToJob, setApplyingToJob] = useState(null);
  const [appliedVacancyIds, setAppliedVacancyIds] = useState([]);
  const [favoriteVacancyIds, setFavoriteVacancyIds] = useState([]);
  const [savingFavoriteIds, setSavingFavoriteIds] = useState([]);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (sessionData?.favoriteVacancyIds) {
      setFavoriteVacancyIds(sessionData.favoriteVacancyIds);
    }
  }, [sessionData?.favoriteVacancyIds]);

  useEffect(() => {
    const carregarVagas = async () => {
      try {
        setLoadingJobs(true);
        if (isEmployer) {
          const data = await apiFetch('/recruiters/vacancies?status=ALL&limit=20');
          setEmployerJobs((data.vacancies || []).map((vacancy) => ({
            id: String(vacancy.id),
            title: vacancy.job_title || 'Vaga sem título',
            category: `${vacancy.status === 'OPEN' ? 'Aberta' : 'Fechada'} · ${vacancy.company_name || 'Empresa'}`,
          })));
          return;
        }

        const requests = [
          apiFetch('/candidates/vacancies?limit=20'),
          apiFetch('/candidates/applications'),
          apiFetch('/candidates/favorites'),
        ];
        const [data, applicationsData, favoritesData] = await Promise.all(requests);
        setJobs((data.vacancies || []).map((vacancy) => normalizeJob(vacancy, Date.now())));
        setAppliedVacancyIds((applicationsData.applications || []).map((application) => String(application.vacancy_id)));
        const favoriteIds = (favoritesData.favorites || []).map((vacancy) => String(vacancy.id));
        setFavoriteVacancyIds(favoriteIds);
        setSessionData((current) => current
          ? { ...current, favoriteVacancyIds: favoriteIds }
          : current);
      } catch (error) {
        setJobs([]);
        Alert.alert('Erro ao carregar vagas', error.message || 'Não foi possível conectar ao servidor.');
      } finally {
        setLoadingJobs(false);
      }
    };

    carregarVagas();
  }, [isEmployer, setSessionData]);

  useEffect(() => {
    setJobs((current) => current.map((job) => ({
      ...job,
      timeAgo: formatTimeAgo(job.createdAt, currentTime),
    })));
  }, [currentTime]);

  const applyToJob = async (vacancyId) => {
    if (applyingToJob !== null) return;

    setApplyingToJob(String(vacancyId));
    try {
      await apiFetch(`/candidates/vacancies/${vacancyId}/apply`, { method: 'POST' });
      setAppliedVacancyIds((current) => [...new Set([...current, String(vacancyId)])]);
      Alert.alert('Candidatura enviada', 'A empresa poderá conversar com você pela aba Mensagens.');
    } catch (error) {
      Alert.alert('Não foi possível se candidatar', error.message || 'Tente novamente.');
    } finally {
      setApplyingToJob(null);
    }
  };

  const toggleFavorite = async (vacancyId) => {
    const id = String(vacancyId);
    if (savingFavoriteIds.includes(id)) return;

    const isFavorite = favoriteVacancyIds.includes(id);
    setSavingFavoriteIds((current) => [...current, id]);
    try {
      await apiFetch(`/candidates/vacancies/${vacancyId}/favorite`, {
        method: isFavorite ? 'DELETE' : 'PUT',
      });
      setFavoriteVacancyIds((current) => (
        isFavorite
          ? current.filter((favoriteId) => favoriteId !== id)
          : [...new Set([...current, id])]
      ));
      setSessionData((current) => {
        if (!current) return current;
        const currentIds = current.favoriteVacancyIds || [];
        return {
          ...current,
          favoriteVacancyIds: isFavorite
            ? currentIds.filter((favoriteId) => favoriteId !== id)
            : [...new Set([...currentIds, id])],
        };
      });
    } catch (error) {
      Alert.alert(
        isFavorite ? 'Não foi possível remover dos salvos' : 'Não foi possível salvar a vaga',
        error.message || 'Tente novamente.',
      );
    } finally {
      setSavingFavoriteIds((current) => current.filter((favoriteId) => favoriteId !== id));
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

  const handleOpenMessages = () => {
    router.push('/(tabs)/index1');
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
    if (selectedFilter === 'Remotos') {
      return jobs.filter((job) => job.isRemote);
    }

    if (selectedFilter === 'Recentes') {
      return [...jobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return jobs;
  };

  const filteredJobs = getFilteredJobs();

  return (
    <AnimatedScreen>
    <SafeAreaView style={styles.homeContainer}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

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
        onToggleNotification={() => {
          setShowProfileMenu(false);
          setShowNotification(!showNotification);
        }}
        onGoToSettings={handleGoToSettings}
        isSettingsActive={isSettingsActive}
        onToggleProfileMenu={() => {
          setShowNotification(false);
          setShowProfileMenu(!showProfileMenu);
        }}
        onOpenMessages={handleOpenMessages}
      />

      <NotificationModal
        visible={showNotification}
        onClose={() => setShowNotification(false)}
      />

      <ProfileMenuModal
        visible={showProfileMenu}
        onClose={() => setShowProfileMenu(false)}
        onGoToProfile={handleGoToProfile}
        onLogout={handleLogout}
      />

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
              {['Para você', 'Recentes', 'Remotos'].map((filter) => (
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
            </View>

            {loadingJobs ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color={colors.tint} />
                <Text style={styles.emptySubText}>Carregando vagas do portal…</Text>
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
                      onApply={applyToJob}
                      isApplied={appliedVacancyIds.includes(String(job.vacancyId))}
                      isApplying={applyingToJob === String(job.vacancyId)}
                      isFavorite={favoriteVacancyIds.includes(String(job.vacancyId))}
                      isSavingFavorite={savingFavoriteIds.includes(String(job.vacancyId))}
                      onToggleFavorite={toggleFavorite}
                    />
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Nenhuma vaga encontrada</Text>
                <Text style={styles.emptySubText}>
                  Não há vagas disponíveis para a categoria selecionada no momento.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
    </AnimatedScreen>
  );
}

function makeStyles(colors, largeText) {
  const scale = largeText ? 1.12 : 1;
  return StyleSheet.create({
  homeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  homeContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
    fontSize: 14 * scale,
    fontWeight: '600',
    color: colors.muted,
  },
  activeFilterText: {
    color: colors.text,
  },
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
    fontSize: 10 * scale,
    fontWeight: 'bold',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16 * scale,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 13 * scale,
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
    backgroundColor: colors.surface,
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
    fontSize: 15 * scale,
    fontWeight: '700',
    color: colors.text,
  },
  emptyEmployerContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  emptyEmployerText: {
    fontSize: 18 * scale,
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
    fontSize: 16 * scale,
    fontWeight: '700',
    color: colors.text,
  },
  employerJobDetails: {
    fontSize: 13 * scale,
    color: colors.muted,
    marginTop: 4,
  },
  });
}