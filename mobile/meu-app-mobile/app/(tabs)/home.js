import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AnimatedScreen from "../../components/layout/AnimatedScreen";
import { useAppPreferences } from "../../context/PreferencesContext";
import { SessionContext } from "../../context/SessionContext";
import { apiFetch, clearToken, getAssetUrl } from "../../lib/api";
import { formatBrasiliaDateTime, parseApiDate } from "../../lib/dateTime";

import JobCard from "../../components/jobs/JobCard";
import Header from "../../components/layout/Header";
import NotificationModal from "../../components/modals/NotificationModal";
import ProfileMenuModal from "../../components/modals/ProfileMenuModal";

const EMPTY_ADVANCED_FILTERS = {
  workModels: [],
  contractTypes: [],
  experienceLevels: [],
  workSchedules: [],
  salaryMin: "",
  salaryMax: "",
  city: "",
  state: "",
  sector: "",
};

const WORK_MODEL_OPTIONS = [
  { value: "ONSITE", label: "Presencial" },
  { value: "REMOTE", label: "Remoto" },
  { value: "HYBRID", label: "Híbrido" },
];
const CONTRACT_OPTIONS = [
  { value: "CLT", label: "CLT" },
  { value: "PJ", label: "PJ" },
  { value: "INTERNSHIP", label: "Estágio" },
  { value: "APPRENTICE", label: "Aprendiz" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "TEMPORARY", label: "Temporário" },
];
const EXPERIENCE_OPTIONS = [
  { value: "FIRST_JOB", label: "Primeiro emprego" },
  { value: "NO_EXPERIENCE", label: "Sem experiência" },
  { value: "EXPERIENCED", label: "Com experiência" },
];
const SCHEDULE_OPTIONS = [
  { value: "PART_TIME", label: "Meio período" },
  { value: "FULL_TIME", label: "Integral" },
  { value: "FLEXIBLE", label: "Flexível" },
];

const getOptionLabel = (options, value) =>
  options.find((option) => option.value === value)?.label || value;

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Salário a combinar";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatTimeAgo = (value, now = Date.now()) => {
  const date = parseApiDate(value);
  if (!date) return "Data indisponível";

  const diffMs = now - date.getTime();
  if (diffMs < 0) return "Em breve";
  if (diffMs < 60_000) return "Agora";
  if (diffMs < 60 * 60_000) return `Há ${Math.floor(diffMs / 60_000)} min`;
  if (diffMs < 24 * 60 * 60_000)
    return `Há ${Math.floor(diffMs / (60 * 60_000))}h`;
  if (diffMs < 30 * 24 * 60 * 60_000) {
    const days = Math.floor(diffMs / (24 * 60 * 60_000));
    return `Há ${days} dia${days === 1 ? "" : "s"}`;
  }

  return formatBrasiliaDateTime(date);
};

const normalizeJob = (vacancy, now) => ({
  id: String(vacancy.id),
  vacancyId: vacancy.id,
  company: vacancy.company_name || "Empresa",
  logoUri: getAssetUrl(vacancy.company_logo_url),
  category: vacancy.company_sector || "Empresa",
  location: vacancy.location || "",
  workModel: vacancy.work_model || "",
  contractType: vacancy.contract_type || "",
  timeAgo: formatTimeAgo(vacancy.created_at, now),
  createdAt: parseApiDate(vacancy.created_at) || new Date(0),
  dateTimeLabel: formatBrasiliaDateTime(vacancy.created_at),
  title: (vacancy.job_title || "Vaga disponível").toUpperCase(),
  description: vacancy.job_description || "Descrição não informada.",
  salary:
    vacancy.salary_min || vacancy.salary_max
      ? `${formatCurrency(vacancy.salary_min || vacancy.salary_max)}${vacancy.salary_min && vacancy.salary_max ? ` - ${formatCurrency(vacancy.salary_max)}` : ""}`
      : "Salário a combinar",
  vacancies: "1 vaga",
  isRemote: vacancy.work_model === "REMOTE",
});

export default function HomeScreen() {
  const {
    sessionData,
    setSessionData,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    vacancyFilters,
    setVacancyFilters,
  } = useContext(SessionContext);
  const { colors, preferences, isDark } = useAppPreferences();
  const styles = makeStyles(colors, preferences.large_text);
  const isEmployer = sessionData?.user?.user_type === "RECRUITER";
  const favoriteVacancyIds = sessionData?.favoriteVacancyIds || [];

  const [selectedFilter, setSelectedFilter] = useState("Todas");
  const [selectedContractType, setSelectedContractType] = useState("Todos");
  const [sortRecent, setSortRecent] = useState(false);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [draftFilters, setDraftFilters] = useState(
    vacancyFilters || EMPTY_ADVANCED_FILTERS,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSettingsActive, setIsSettingsActive] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [jobs, setJobs] = useState([]);
  const [employerJobs, setEmployerJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [jobsReloadKey, setJobsReloadKey] = useState(0);
  const [applyingToJob, setApplyingToJob] = useState(null);
  const [appliedVacancyIds, setAppliedVacancyIds] = useState([]);
  const [savingFavoriteIds, setSavingFavoriteIds] = useState([]);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const appliedVacancyIdSet = new Set([
    ...appliedVacancyIds,
    ...(sessionData?.applications || []).map((application) =>
      String(application.vacancy_id),
    ),
  ]);

  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const carregarVagas = async () => {
      try {
        if (isEmployer) {
          setLoadingJobs(true);
          const data = await apiFetch(
            "/recruiters/vacancies?status=ALL&limit=20",
          );
          setEmployerJobs(
            (data.vacancies || []).map((vacancy) => ({
              id: String(vacancy.id),
              title: vacancy.job_title || "Vaga sem título",
              category: `${vacancy.status === "OPEN" ? "Aberta" : "Fechada"} · ${vacancy.company_name || "Empresa"}`,
            })),
          );
          return;
        }

        const requests = [
          apiFetch("/candidates/applications"),
          apiFetch("/candidates/favorites"),
        ];
        const [applicationsData, favoritesData] = await Promise.all(requests);
        setAppliedVacancyIds(
          (applicationsData.applications || []).map((application) =>
            String(application.vacancy_id),
          ),
        );
        const favoriteIds = (favoritesData.favorites || []).map((vacancy) =>
          String(vacancy.id),
        );
        setSessionData((current) =>
          current ? { ...current, favoriteVacancyIds: favoriteIds } : current,
        );
      } catch (error) {
        Alert.alert(
          isEmployer ? "Erro ao carregar vagas" : "Erro ao carregar seus dados",
          error.message || "Não foi possível conectar ao servidor.",
        );
      } finally {
        if (isEmployer) setLoadingJobs(false);
      }
    };

    carregarVagas();
  }, [isEmployer, setSessionData, sessionData?.recruiterVacanciesUpdatedAt]);

  useEffect(() => {
    if (isEmployer) return undefined;

    let active = true;
    const timer = setTimeout(
      async () => {
        setLoadingJobs(true);
        setJobsError("");
        const params = new URLSearchParams({ limit: "50" });
        const query = searchQuery.trim();
        if (query) params.set("q", query);
        if (vacancyFilters.workModels.length)
          params.set("work_models", vacancyFilters.workModels.join(","));
        if (vacancyFilters.contractTypes.length)
          params.set("contract_types", vacancyFilters.contractTypes.join(","));
        if (vacancyFilters.experienceLevels.length)
          params.set(
            "experience_levels",
            vacancyFilters.experienceLevels.join(","),
          );
        if (vacancyFilters.workSchedules.length)
          params.set("work_schedules", vacancyFilters.workSchedules.join(","));
        if (vacancyFilters.salaryMin)
          params.set("salary_min", vacancyFilters.salaryMin);
        if (vacancyFilters.salaryMax)
          params.set("salary_max", vacancyFilters.salaryMax);
        if (vacancyFilters.city.trim())
          params.set("city", vacancyFilters.city.trim());
        if (vacancyFilters.state.trim())
          params.set("state", vacancyFilters.state.trim());
        if (vacancyFilters.sector.trim())
          params.set("company_sector", vacancyFilters.sector.trim());

        try {
          const data = await apiFetch(
            `/candidates/vacancies?${params.toString()}`,
          );
          if (active) {
            setJobs(
              (data.vacancies || []).map((vacancy) =>
                normalizeJob(vacancy, Date.now()),
              ),
            );
          }
        } catch (error) {
          if (active) {
            setJobsError(
              error.message || "Não foi possível conectar ao servidor.",
            );
          }
        } finally {
          if (active) setLoadingJobs(false);
        }
      },
      searchQuery.trim() ? 350 : 0,
    );

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isEmployer, searchQuery, vacancyFilters, jobsReloadKey]);

  const applyToJob = async (vacancyId) => {
    if (applyingToJob !== null) return;

    setApplyingToJob(String(vacancyId));
    try {
      const result = await apiFetch(
        `/candidates/vacancies/${vacancyId}/apply`,
        {
          method: "POST",
        },
      );
      const application = {
        ...result.application,
        vacancy_id: vacancyId,
        job_title: jobs.find(
          (job) => String(job.vacancyId) === String(vacancyId),
        )?.title,
      };
      setAppliedVacancyIds((current) => [
        ...new Set([...current, String(vacancyId)]),
      ]);
      setSessionData((current) =>
        current
          ? {
              ...current,
              applications: [
                application,
                ...(current.applications || []).filter(
                  (item) => String(item.vacancy_id) !== String(vacancyId),
                ),
              ],
            }
          : current,
      );
      Alert.alert(
        "Candidatura enviada",
        "A empresa poderá conversar com você pela aba Mensagens.",
      );
    } catch (error) {
      Alert.alert(
        "Não foi possível se candidatar",
        error.message || "Tente novamente.",
      );
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
        method: isFavorite ? "DELETE" : "PUT",
      });
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
        isFavorite
          ? "Não foi possível remover dos salvos"
          : "Não foi possível salvar a vaga",
        error.message || "Tente novamente.",
      );
    } finally {
      setSavingFavoriteIds((current) =>
        current.filter((favoriteId) => favoriteId !== id),
      );
    }
  };

  const handleLogout = async () => {
    setShowProfileMenu(false);
    setIsLoggingOut(true);

    try {
      await clearToken();
      setVacancyFilters({
        workModels: [],
        contractTypes: [],
        experienceLevels: [],
        workSchedules: [],
        salaryMin: "",
        salaryMax: "",
        city: "",
        state: "",
        sector: "",
      });
      setSessionData(null);
      setTimeout(() => {
        setIsLoggingOut(false);
        router.replace("/");
      }, 400);
    } catch (error) {
      setIsLoggingOut(false);
      Alert.alert("Não foi possível sair", error.message);
    }
  };

  const handleGoToProfile = () => {
    setShowProfileMenu(false);
    router.push("/perfil");
  };

  const handleOpenMessages = () => {
    router.push("/(tabs)/index1");
  };

  const handleGoToSettings = () => {
    setIsSettingsActive(true);
    setShowNotification(false);
    setShowProfileMenu(false);

    setTimeout(() => {
      setIsSettingsActive(false);
      router.push("/configuracoes");
    }, 150);
  };

  const handleCreateJob = () => {
    // Redireciona para a tela de criação de vagas (ajuste a rota se necessário)
    router.push("/criar-vaga");
  };

  const getFilteredJobs = () => {
    if (sortRecent) {
      return [...jobs].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
    }

    return jobs;
  };

  const filteredJobs = getFilteredJobs().map((job) => ({
    ...job,
    timeAgo: formatTimeAgo(job.createdAt, currentTime),
  }));
  const normalizedSearch = searchQuery.trim().toLocaleLowerCase("pt-BR");
  const filteredEmployerJobs = employerJobs.filter((job) =>
    `${job.title} ${job.category}`
      .toLocaleLowerCase("pt-BR")
      .includes(normalizedSearch),
  );

  const selectedFilterCount =
    vacancyFilters.workModels.length +
    vacancyFilters.contractTypes.length +
    vacancyFilters.experienceLevels.length +
    vacancyFilters.workSchedules.length +
    (vacancyFilters.salaryMin || vacancyFilters.salaryMax ? 1 : 0) +
    (vacancyFilters.city.trim() ? 1 : 0) +
    (vacancyFilters.state.trim() ? 1 : 0) +
    (vacancyFilters.sector.trim() ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const activeFilterTags = [
    ...vacancyFilters.workModels.map((value) => ({
      key: "workModels",
      value,
      label: getOptionLabel(WORK_MODEL_OPTIONS, value),
    })),
    ...vacancyFilters.contractTypes.map((value) => ({
      key: "contractTypes",
      value,
      label: getOptionLabel(CONTRACT_OPTIONS, value),
    })),
    ...vacancyFilters.experienceLevels.map((value) => ({
      key: "experienceLevels",
      value,
      label: getOptionLabel(EXPERIENCE_OPTIONS, value),
    })),
    ...vacancyFilters.workSchedules.map((value) => ({
      key: "workSchedules",
      value,
      label: getOptionLabel(SCHEDULE_OPTIONS, value),
    })),
    ...(vacancyFilters.salaryMin || vacancyFilters.salaryMax
      ? [
          {
            key: "salary",
            label: `Salário: ${vacancyFilters.salaryMin || "0"}–${vacancyFilters.salaryMax || "sem limite"}`,
          },
        ]
      : []),
    ...(vacancyFilters.city.trim()
      ? [{ key: "city", label: `Cidade: ${vacancyFilters.city}` }]
      : []),
    ...(vacancyFilters.state.trim()
      ? [{ key: "state", label: `Estado: ${vacancyFilters.state}` }]
      : []),
    ...(vacancyFilters.sector.trim()
      ? [{ key: "sector", label: `Área: ${vacancyFilters.sector}` }]
      : []),
    ...(searchQuery.trim()
      ? [{ key: "search", label: `Busca: ${searchQuery.trim()}` }]
      : []),
  ];

  const openAllFilters = () => {
    setDraftFilters({ ...(vacancyFilters || EMPTY_ADVANCED_FILTERS) });
    setShowAllFilters(true);
  };

  const toggleDraftOption = (field, value) => {
    setDraftFilters((current) => ({
      ...current,
      [field]: current[field].includes(value)
        ? current[field].filter((item) => item !== value)
        : [...current[field], value],
    }));
  };

  const syncQuickFilters = (filters) => {
    if (filters.workModels.length === 1) {
      setSelectedFilter(
        getOptionLabel(WORK_MODEL_OPTIONS, filters.workModels[0]),
      );
    } else if (selectedFilter !== "Recentes") {
      setSelectedFilter("Todas");
    }
    setSelectedContractType(
      filters.contractTypes.length === 1
        ? getOptionLabel(CONTRACT_OPTIONS, filters.contractTypes[0])
        : "Todos",
    );
  };

  const applyAdvancedFilters = () => {
    const min = draftFilters.salaryMin.trim();
    const max = draftFilters.salaryMax.trim();
    if (
      (min && (!Number.isFinite(Number(min)) || Number(min) < 0)) ||
      (max && (!Number.isFinite(Number(max)) || Number(max) < 0))
    ) {
      Alert.alert(
        "Faixa salarial inválida",
        "Informe valores numéricos positivos para a faixa salarial.",
      );
      return;
    }
    if (min && max && Number(min) > Number(max)) {
      Alert.alert(
        "Faixa salarial inválida",
        "O salário mínimo deve ser menor ou igual ao máximo.",
      );
      return;
    }

    const appliedFilters = { ...draftFilters };
    setVacancyFilters(appliedFilters);
    syncQuickFilters(appliedFilters);
    setShowAllFilters(false);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      ...EMPTY_ADVANCED_FILTERS,
      workModels: [],
      contractTypes: [],
      experienceLevels: [],
      workSchedules: [],
    };
    setDraftFilters(clearedFilters);
    setVacancyFilters(clearedFilters);
    setSelectedFilter("Todas");
    setSelectedContractType("Todos");
    setSortRecent(false);
    setShowAllFilters(false);
  };

  const removeFilterTag = (tag) => {
    if (tag.key === "search") {
      setSearchQuery("");
      return;
    }
    const next = { ...vacancyFilters };
    if (
      [
        "workModels",
        "contractTypes",
        "experienceLevels",
        "workSchedules",
      ].includes(tag.key)
    ) {
      next[tag.key] = next[tag.key].filter((value) => value !== tag.value);
    } else if (tag.key === "salary") {
      next.salaryMin = "";
      next.salaryMax = "";
    } else if (
      tag.key === "city" ||
      tag.key === "state" ||
      tag.key === "sector"
    ) {
      next[tag.key] = "";
    }
    setVacancyFilters(next);
    syncQuickFilters(next);
  };

  return (
    <AnimatedScreen>
      <SafeAreaView style={styles.homeContainer}>
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
        />

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
          avatarUri={getAssetUrl(
            sessionData?.profile?.avatar_url || sessionData?.user?.avatar_url,
          )}
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
          searchValue={searchQuery}
          onSearchChangeText={setSearchQuery}
          notificationCount={unreadNotificationCount}
        />

        <NotificationModal
          visible={showNotification}
          onClose={() => setShowNotification(false)}
          notifications={notifications}
          onMarkAllRead={markAllNotificationsRead}
          onPressNotification={(notification) => {
            markNotificationRead(notification.id);
            setShowNotification(false);
            router.push({
              pathname: "/(tabs)/index1",
              params: { applicationId: String(notification.applicationId) },
            });
          }}
        />

        <ProfileMenuModal
          visible={showProfileMenu}
          onClose={() => setShowProfileMenu(false)}
          onGoToProfile={handleGoToProfile}
          onLogout={handleLogout}
        />

        <Modal
          visible={showAllFilters}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAllFilters(false)}
        >
          <KeyboardAvoidingView
            style={styles.filterModalOverlay}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.filterModal}>
              <View style={styles.filterModalHeader}>
                <View>
                  <Text style={styles.filterModalTitle}>Todos os filtros</Text>
                  <Text style={styles.filterModalSubtitle}>
                    Combine critérios para encontrar sua oportunidade.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowAllFilters(false)}
                  style={styles.modalCloseButton}
                  accessibilityLabel="Fechar filtros"
                >
                  <Feather name="x" size={22} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.filterModalScroll}
                contentContainerStyle={styles.filterModalContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <FilterOptionGroup
                  title="Modalidade"
                  options={WORK_MODEL_OPTIONS}
                  selected={draftFilters.workModels}
                  onToggle={(value) => toggleDraftOption("workModels", value)}
                  styles={styles}
                />
                <FilterOptionGroup
                  title="Tipo de contrato"
                  options={CONTRACT_OPTIONS}
                  selected={draftFilters.contractTypes}
                  onToggle={(value) =>
                    toggleDraftOption("contractTypes", value)
                  }
                  styles={styles}
                />
                <FilterOptionGroup
                  title="Experiência"
                  options={EXPERIENCE_OPTIONS}
                  selected={draftFilters.experienceLevels}
                  onToggle={(value) =>
                    toggleDraftOption("experienceLevels", value)
                  }
                  styles={styles}
                />
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>
                    Faixa salarial (R$)
                  </Text>
                  <View style={styles.filterInputRow}>
                    <TextInput
                      value={draftFilters.salaryMin}
                      onChangeText={(salaryMin) =>
                        setDraftFilters((current) => ({
                          ...current,
                          salaryMin: salaryMin
                            .replace(/[^\d.,]/g, "")
                            .replace(",", "."),
                        }))
                      }
                      placeholder="Mínimo"
                      placeholderTextColor={colors.muted}
                      keyboardType="decimal-pad"
                      style={styles.filterTextInput}
                      accessibilityLabel="Salário mínimo"
                    />
                    <Text style={styles.filterRangeSeparator}>até</Text>
                    <TextInput
                      value={draftFilters.salaryMax}
                      onChangeText={(salaryMax) =>
                        setDraftFilters((current) => ({
                          ...current,
                          salaryMax: salaryMax
                            .replace(/[^\d.,]/g, "")
                            .replace(",", "."),
                        }))
                      }
                      placeholder="Máximo"
                      placeholderTextColor={colors.muted}
                      keyboardType="decimal-pad"
                      style={styles.filterTextInput}
                      accessibilityLabel="Salário máximo"
                    />
                  </View>
                </View>
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Localização</Text>
                  <View style={styles.filterInputRow}>
                    <TextInput
                      value={draftFilters.city}
                      onChangeText={(city) =>
                        setDraftFilters((current) => ({ ...current, city }))
                      }
                      placeholder="Cidade"
                      placeholderTextColor={colors.muted}
                      style={[styles.filterTextInput, styles.locationInput]}
                      accessibilityLabel="Cidade"
                    />
                    <TextInput
                      value={draftFilters.state}
                      onChangeText={(state) =>
                        setDraftFilters((current) => ({ ...current, state }))
                      }
                      placeholder="Estado/UF"
                      placeholderTextColor={colors.muted}
                      style={[styles.filterTextInput, styles.stateInput]}
                      maxLength={100}
                      accessibilityLabel="Estado"
                    />
                  </View>
                </View>
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>
                    Área profissional
                  </Text>
                  <TextInput
                    value={draftFilters.sector}
                    onChangeText={(sector) =>
                      setDraftFilters((current) => ({ ...current, sector }))
                    }
                    placeholder="Ex.: Tecnologia, Saúde, Administração"
                    placeholderTextColor={colors.muted}
                    style={styles.filterTextInput}
                    returnKeyType="done"
                    accessibilityLabel="Área profissional"
                  />
                </View>
                <FilterOptionGroup
                  title="Jornada de trabalho"
                  options={SCHEDULE_OPTIONS}
                  selected={draftFilters.workSchedules}
                  onToggle={(value) =>
                    toggleDraftOption("workSchedules", value)
                  }
                  styles={styles}
                />
              </ScrollView>

              <View style={styles.filterModalActions}>
                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={clearAllFilters}
                >
                  <Text style={styles.clearFiltersText}>Limpar filtros</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyFiltersButton}
                  onPress={applyAdvancedFilters}
                >
                  <Text style={styles.applyFiltersText}>Aplicar filtros</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
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
              {filteredEmployerJobs.length === 0 ? (
                <View style={styles.emptyEmployerContainer}>
                  <Text style={styles.emptyEmployerText}>
                    {searchQuery
                      ? "Nenhuma vaga corresponde à pesquisa"
                      : "Não há vaga criada"}
                  </Text>
                </View>
              ) : (
                filteredEmployerJobs.map((job) => (
                  <View key={job.id} style={styles.employerJobCard}>
                    <Text style={styles.employerJobTitle}>{job.title}</Text>
                    <Text style={styles.employerJobDetails}>
                      {job.category}
                    </Text>
                  </View>
                ))
              )}
            </View>
          ) : (
            /* ==================== TELA DO CANDIDATO ==================== */
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterContainer}
              >
                {["Todas", "Recentes", "Remoto", "Híbrido", "Presencial"].map(
                  (filter) => (
                    <TouchableOpacity
                      key={filter}
                      onPress={() => {
                        if (filter === "Recentes") {
                          const nextSortRecent = !sortRecent;
                          setSortRecent(nextSortRecent);
                          setSelectedFilter(
                            nextSortRecent
                              ? "Recentes"
                              : vacancyFilters.workModels.length === 1
                                ? getOptionLabel(
                                    WORK_MODEL_OPTIONS,
                                    vacancyFilters.workModels[0],
                                  )
                                : "Todas",
                          );
                          return;
                        }
                        setSortRecent(false);
                        setSelectedFilter(filter);
                        const selectedModel = {
                          Remoto: "REMOTE",
                          Híbrido: "HYBRID",
                          Presencial: "ONSITE",
                        }[filter];
                        const next = {
                          ...vacancyFilters,
                          workModels: selectedModel ? [selectedModel] : [],
                        };
                        setVacancyFilters(next);
                        setDraftFilters((current) => ({
                          ...current,
                          workModels: next.workModels,
                        }));
                      }}
                      style={[
                        styles.filterChip,
                        (filter === "Recentes"
                          ? sortRecent
                          : filter === "Todas"
                            ? vacancyFilters.workModels.length === 0
                            : vacancyFilters.workModels.includes(
                                {
                                  Remoto: "REMOTE",
                                  Híbrido: "HYBRID",
                                  Presencial: "ONSITE",
                                }[filter],
                              )) && styles.activeFilterChip,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterText,
                          (filter === "Recentes"
                            ? sortRecent
                            : filter === "Todas"
                              ? vacancyFilters.workModels.length === 0
                              : vacancyFilters.workModels.includes(
                                  {
                                    Remoto: "REMOTE",
                                    Híbrido: "HYBRID",
                                    Presencial: "ONSITE",
                                  }[filter],
                                )) && styles.activeFilterText,
                        ]}
                      >
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </ScrollView>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterContainer}
              >
                {["Todos", "CLT", "PJ", "Estágio", "Freelance"].map(
                  (contractType) => (
                    <TouchableOpacity
                      key={contractType}
                      onPress={() => {
                        setSelectedContractType(contractType);
                        const selectedContract = {
                          CLT: "CLT",
                          PJ: "PJ",
                          Estágio: "INTERNSHIP",
                          Freelance: "FREELANCE",
                        }[contractType];
                        const next = {
                          ...vacancyFilters,
                          contractTypes: selectedContract
                            ? [selectedContract]
                            : [],
                        };
                        setVacancyFilters(next);
                        setDraftFilters((current) => ({
                          ...current,
                          contractTypes: next.contractTypes,
                        }));
                      }}
                      style={[
                        styles.filterChip,
                        selectedContractType === contractType &&
                          styles.activeFilterChip,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterText,
                          selectedContractType === contractType &&
                            styles.activeFilterText,
                        ]}
                      >
                        {contractType === "Todos"
                          ? "Todos os contratos"
                          : contractType}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </ScrollView>

              <View style={styles.allFiltersRow}>
                <TouchableOpacity
                  style={styles.allFiltersButton}
                  onPress={openAllFilters}
                  activeOpacity={0.8}
                >
                  <Feather name="sliders" size={17} color={colors.tint} />
                  <Text style={styles.allFiltersButtonText}>
                    Todos os filtros
                  </Text>
                  <View style={styles.filterCountBadge}>
                    <Text style={styles.filterCountText}>
                      {selectedFilterCount}
                    </Text>
                  </View>
                </TouchableOpacity>
                <Text style={styles.filterCountCaption}>
                  {selectedFilterCount}{" "}
                  {selectedFilterCount === 1
                    ? "filtro selecionado"
                    : "filtros selecionados"}
                </Text>
              </View>

              {activeFilterTags.length > 0 && (
                <View style={styles.activeFiltersContainer}>
                  {activeFilterTags.map((tag, index) => (
                    <TouchableOpacity
                      key={`${tag.key}-${tag.value || index}`}
                      style={styles.activeFilterTag}
                      onPress={() => removeFilterTag(tag)}
                      accessibilityLabel={`Remover filtro ${tag.label}`}
                    >
                      <Text style={styles.activeFilterTagText}>
                        {tag.label}
                      </Text>
                      <Feather name="x" size={13} color={colors.tint} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {!loadingJobs && (
                <Text style={styles.resultsCount}>
                  {filteredJobs.length}{" "}
                  {filteredJobs.length === 1
                    ? "vaga encontrada"
                    : "vagas encontradas"}
                </Text>
              )}

              {loadingJobs ? (
                <View style={styles.emptyContainer}>
                  <ActivityIndicator size="large" color={colors.tint} />
                  <Text style={styles.emptySubText}>
                    Carregando vagas do portal…
                  </Text>
                </View>
              ) : jobsError ? (
                <View style={styles.emptyContainer}>
                  <Feather name="wifi-off" size={30} color={colors.muted} />
                  <Text style={styles.emptyTitle}>
                    Não foi possível carregar as vagas
                  </Text>
                  <Text style={styles.emptySubText}>{jobsError}</Text>
                  <TouchableOpacity
                    style={styles.retryJobsButton}
                    onPress={() => setJobsReloadKey((current) => current + 1)}
                  >
                    <Text style={styles.retryJobsText}>Tentar novamente</Text>
                  </TouchableOpacity>
                </View>
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => {
                  const isHighlight = sortRecent && index === 0;

                  return (
                    <View
                      key={job.id}
                      style={isHighlight ? styles.mostRecentHighlight : null}
                    >
                      {isHighlight && (
                        <View style={styles.recentBadge}>
                          <Text style={styles.recentBadgeText}>
                            Mais recente
                          </Text>
                        </View>
                      )}
                      <JobCard
                        item={job}
                        onApply={applyToJob}
                        isApplied={appliedVacancyIdSet.has(
                          String(job.vacancyId),
                        )}
                        isApplying={applyingToJob === String(job.vacancyId)}
                        isFavorite={favoriteVacancyIds.includes(
                          String(job.vacancyId),
                        )}
                        isSavingFavorite={savingFavoriteIds.includes(
                          String(job.vacancyId),
                        )}
                        onToggleFavorite={toggleFavorite}
                      />
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyTitle}>Nenhuma vaga encontrada</Text>
                  <Text style={styles.emptySubText}>
                    {searchQuery
                      ? "Tente outra palavra ou ajuste os filtros selecionados."
                      : "Tente alterar os filtros de modalidade ou contrato."}
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
    allFiltersRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      marginBottom: 10,
    },
    allFiltersButton: {
      minHeight: 42,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    allFiltersButtonText: {
      color: colors.text,
      fontSize: 13 * scale,
      fontWeight: "700",
    },
    filterCountBadge: {
      minWidth: 21,
      height: 21,
      borderRadius: 11,
      paddingHorizontal: 5,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primaryWash,
    },
    filterCountText: { color: colors.tint, fontSize: 11, fontWeight: "700" },
    filterCountCaption: {
      flexShrink: 1,
      color: colors.muted,
      fontSize: 11 * scale,
      textAlign: "right",
    },
    activeFiltersContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 7,
      marginBottom: 12,
    },
    activeFilterTag: {
      maxWidth: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingVertical: 6,
      paddingHorizontal: 9,
      borderRadius: 16,
      backgroundColor: colors.primaryWash,
    },
    activeFilterTagText: {
      color: colors.tint,
      fontSize: 11 * scale,
      fontWeight: "600",
    },
    filterModalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 14,
      backgroundColor: "rgba(0,0,0,0.48)",
    },
    filterModal: {
      width: "100%",
      maxWidth: 560,
      maxHeight: "94%",
      borderRadius: 22,
      backgroundColor: colors.surface,
      overflow: "hidden",
      elevation: 8,
    },
    filterModalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.line,
    },
    filterModalTitle: {
      color: colors.text,
      fontSize: 19 * scale,
      fontWeight: "800",
    },
    filterModalSubtitle: {
      color: colors.muted,
      fontSize: 12 * scale,
      marginTop: 3,
      maxWidth: 270,
    },
    modalCloseButton: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    filterModalScroll: { flexShrink: 1 },
    filterModalContent: {
      paddingHorizontal: 20,
      paddingTop: 5,
      paddingBottom: 14,
    },
    filterSection: { marginTop: 14 },
    filterSectionTitle: {
      color: colors.text,
      fontSize: 14 * scale,
      fontWeight: "700",
      marginBottom: 9,
    },
    filterOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    filterOption: {
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.background,
      borderRadius: 18,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    filterOptionSelected: {
      borderColor: colors.tint,
      backgroundColor: colors.primaryWash,
    },
    filterOptionText: {
      color: colors.muted,
      fontSize: 12 * scale,
      fontWeight: "600",
    },
    filterOptionTextSelected: { color: colors.tint },
    filterInputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    filterTextInput: {
      minHeight: 44,
      flex: 1,
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: 11,
      paddingHorizontal: 11,
      color: colors.text,
      backgroundColor: colors.background,
      fontSize: 13 * scale,
    },
    filterRangeSeparator: { color: colors.muted, fontSize: 12 * scale },
    locationInput: { flex: 2 },
    stateInput: { flex: 1 },
    filterModalActions: {
      flexDirection: "row",
      gap: 10,
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.line,
    },
    clearFiltersButton: {
      flex: 1,
      minHeight: 46,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: 12,
    },
    clearFiltersText: {
      color: colors.muted,
      fontSize: 13 * scale,
      fontWeight: "700",
    },
    applyFiltersButton: {
      flex: 1.3,
      minHeight: 46,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      backgroundColor: colors.tint,
    },
    applyFiltersText: {
      color: colors.buttonText,
      fontSize: 13 * scale,
      fontWeight: "700",
    },
    // Candidato
    filterContainer: {
      flexDirection: "row",
      marginBottom: 10,
      gap: 10,
      paddingVertical: 2,
    },
    resultsCount: {
      color: colors.muted,
      fontSize: 12 * scale,
      marginBottom: 10,
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
      fontWeight: "600",
      color: colors.muted,
    },
    activeFilterText: {
      color: colors.buttonText,
    },
    mostRecentHighlight: {
      borderWidth: 2,
      borderColor: colors.tint,
      borderRadius: 12,
      marginBottom: 16,
      position: "relative",
    },
    recentBadge: {
      position: "absolute",
      top: -10,
      right: 16,
      backgroundColor: colors.tint,
      paddingVertical: 2,
      paddingHorizontal: 10,
      borderRadius: 10,
      zIndex: 1,
    },
    recentBadgeText: {
      color: colors.buttonText,
      fontSize: 10 * scale,
      fontWeight: "bold",
    },
    emptyContainer: {
      paddingVertical: 60,
      alignItems: "center",
      justifyContent: "center",
    },
    retryJobsButton: {
      marginTop: 16,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: colors.primaryWash,
    },
    retryJobsText: {
      color: colors.tint,
      fontSize: 13 * scale,
      fontWeight: "700",
    },
    emptyTitle: {
      fontSize: 16 * scale,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 6,
    },
    emptySubText: {
      fontSize: 13 * scale,
      color: colors.muted,
      textAlign: "center",
    },
    loadingOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.3)",
      justifyContent: "center",
      alignItems: "center",
    },
    loadingBox: {
      backgroundColor: colors.surface,
      padding: 24,
      borderRadius: 16,
      alignItems: "center",
      gap: 12,
      elevation: 5,
    },
    loadingText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },

    // Empresário (Igual à foto)
    employerSection: {
      marginTop: 10,
    },
    createJobBarContainer: {
      width: "100%",
      height: 54,
      backgroundColor: colors.surface,
      borderRadius: 27,
      borderWidth: 1,
      borderColor: colors.line,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    createJobPillButton: {
      flexDirection: "row",
      alignItems: "center",
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
      fontWeight: "700",
      color: colors.text,
    },
    emptyEmployerContainer: {
      alignItems: "center",
      marginTop: 10,
    },
    emptyEmployerText: {
      fontSize: 18 * scale,
      fontWeight: "700",
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
      fontWeight: "700",
      color: colors.text,
    },
    employerJobDetails: {
      fontSize: 13 * scale,
      color: colors.muted,
      marginTop: 4,
    },
  });
}

function FilterOptionGroup({ title, options, selected, onToggle, styles }) {
  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>{title}</Text>
      <View style={styles.filterOptions}>
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onToggle(option.value)}
              style={[
                styles.filterOption,
                isSelected && styles.filterOptionSelected,
              ]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  isSelected && styles.filterOptionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
