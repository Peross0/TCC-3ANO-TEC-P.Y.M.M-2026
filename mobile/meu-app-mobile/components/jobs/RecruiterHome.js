import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppPreferences } from "../../context/PreferencesContext";
import { SessionContext } from "../../context/SessionContext";
import { apiFetch, clearToken } from "../../lib/api";
import Header from "../layout/Header";
import NotificationModal from "../modals/NotificationModal";
import ProfileMenuModal from "../modals/ProfileMenuModal";
import RecruiterVacancyCard from "./RecruiterVacancyCard";
import RecruiterVacancyFilters from "./RecruiterVacancyFilters";

const EMPTY_VACANCY_FILTERS = {
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

export default function RecruiterHome() {
  const router = useRouter();
  const {
    sessionData,
    setSessionData,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useContext(SessionContext);
  const { colors, preferences, isDark } = useAppPreferences();
  const styles = makeStyles(colors, preferences.large_text);
  const user = sessionData?.user;
  const [profile, setProfile] = useState(user || {});
  const [myVacancies, setMyVacancies] = useState([]);
  const [publicVacancies, setPublicVacancies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [vacancyFilters, setVacancyFilters] = useState(EMPTY_VACANCY_FILTERS);
  const [sortRecent, setSortRecent] = useState(false);
  const [loadingMine, setLoadingMine] = useState(true);
  const [loadingPublic, setLoadingPublic] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mineError, setMineError] = useState("");
  const [publicError, setPublicError] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const requestSequence = useRef(0);
  const hasFocused = useRef(false);
  const loadPublicRef = useRef(() => {});

  const loadMine = useCallback(
    async (background = false) => {
      if (!user?.id) return;
      if (!background) setLoadingMine(true);
      setMineError("");
      try {
        const [profileData, vacanciesData] = await Promise.all([
          apiFetch("/recruiters/profile"),
          apiFetch("/recruiters/vacancies?status=ALL&limit=5"),
        ]);
        setProfile(profileData.recruiter || user);
        setMyVacancies(vacanciesData.vacancies || []);
      } catch (error) {
        setMineError(error.message || "Não foi possível carregar suas vagas.");
      } finally {
        setLoadingMine(false);
      }
    },
    [user],
  );

  const loadPublic = useCallback(
    async ({ background = false } = {}) => {
      const sequence = ++requestSequence.current;
      if (!background) setLoadingPublic(true);
      setPublicError("");
      const params = new URLSearchParams({ limit: "20" });
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
          `/recruiters/public-vacancies?${params.toString()}`,
        );
        if (sequence === requestSequence.current) {
          setPublicVacancies(data.vacancies || []);
        }
      } catch (error) {
        if (sequence === requestSequence.current) {
          setPublicError(
            error.message || "Não foi possível carregar oportunidades.",
          );
        }
      } finally {
        if (sequence === requestSequence.current) setLoadingPublic(false);
      }
    },
    [searchQuery, vacancyFilters],
  );

  useEffect(() => {
    loadPublicRef.current = loadPublic;
  }, [loadPublic]);

  useFocusEffect(
    useCallback(() => {
      loadMine(true);
      if (hasFocused.current) loadPublicRef.current({ background: true });
      hasFocused.current = true;
      return undefined;
    }, [loadMine]),
  );

  useEffect(() => {
    const timer = setTimeout(() => loadPublic(), searchQuery.trim() ? 350 : 0);
    return () => clearTimeout(timer);
  }, [loadPublic, searchQuery]);

  const refresh = async () => {
    setRefreshing(true);
    await Promise.all([loadMine(true), loadPublic({ background: true })]);
    setRefreshing(false);
  };

  const logout = async () => {
    setShowProfileMenu(false);
    await clearToken();
    setSessionData(null);
    router.replace("/");
  };

  const firstName = String(profile.full_name || user?.full_name || "recrutador")
    .trim()
    .split(/\s+/)[0];
  const companyName =
    profile.company_name || user?.company_name || "Sua empresa";
  const hasPublicFilters = Boolean(
    searchQuery.trim() ||
    vacancyFilters.workModels.length ||
    vacancyFilters.contractTypes.length ||
    vacancyFilters.experienceLevels.length ||
    vacancyFilters.workSchedules.length ||
    vacancyFilters.salaryMin ||
    vacancyFilters.salaryMax ||
    vacancyFilters.city.trim() ||
    vacancyFilters.state.trim() ||
    vacancyFilters.sector.trim(),
  );
  const visiblePublicVacancies = sortRecent
    ? [...publicVacancies].sort(
        (first, second) =>
          new Date(second.created_at).getTime() -
          new Date(first.created_at).getTime(),
      )
    : publicVacancies;

  if (user?.user_type !== "RECRUITER") {
    router.replace(user ? "/(tabs)/home" : "/");
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <Header
        avatarUri={null}
        showNotification={showNotification}
        onToggleNotification={() => {
          setShowProfileMenu(false);
          setShowNotification((current) => !current);
        }}
        onGoToSettings={() => router.push("/configuracoes")}
        onToggleProfileMenu={() => {
          setShowNotification(false);
          setShowProfileMenu((current) => !current);
        }}
        onOpenMessages={() => router.push("/(tabs)/index1")}
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
        onGoToProfile={() => {
          setShowProfileMenu(false);
          router.push("/perfil");
        }}
        onLogout={logout}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
      >
        <View style={styles.greeting}>
          <Text style={styles.eyebrow}>ÁREA DO RECRUTADOR</Text>
          <Text style={styles.title}>Olá, {firstName}</Text>
          <Text style={styles.subtitle}>{companyName}</Text>
        </View>

        <SectionHeading
          title="Vagas de outras empresas"
          caption="Oportunidades públicas disponíveis"
          styles={styles}
        />
        <RecruiterVacancyFilters
          filters={vacancyFilters}
          onChange={setVacancyFilters}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery("")}
          sortRecent={sortRecent}
          onSortRecent={setSortRecent}
        />

        {loadingPublic ? (
          <LoadingState message="Buscando oportunidades..." styles={styles} />
        ) : publicError ? (
          <FeedbackState
            icon="wifi-off"
            title="Não foi possível carregar as oportunidades"
            message={publicError}
            action="Tentar novamente"
            onAction={() => loadPublic()}
            styles={styles}
          />
        ) : visiblePublicVacancies.length ? (
          visiblePublicVacancies.map((vacancy) => (
            <RecruiterVacancyCard
              key={String(vacancy.id)}
              vacancy={vacancy}
              onPress={() => router.push(`/vaga/${vacancy.id}`)}
            />
          ))
        ) : (
          <FeedbackState
            icon="search"
            title="Nenhuma vaga encontrada"
            message={
              hasPublicFilters
                ? "Ajuste sua busca ou os filtros para ver outras oportunidades."
                : "Ainda não há vagas públicas de outras empresas disponíveis."
            }
            styles={styles}
          />
        )}

        <SectionHeading
          title="Minhas vagas"
          caption="Publicações da sua empresa"
          action="Ver todas"
          onAction={() => router.navigate("/(tabs)/gerenciar-vagas")}
          styles={styles}
        />
        {loadingMine ? (
          <LoadingState message="Carregando suas vagas..." styles={styles} />
        ) : mineError ? (
          <FeedbackState
            icon="wifi-off"
            title="Não foi possível carregar suas vagas"
            message={mineError}
            action="Tentar novamente"
            onAction={() => loadMine()}
            styles={styles}
          />
        ) : myVacancies.length ? (
          myVacancies.map((vacancy) => (
            <RecruiterVacancyCard
              key={String(vacancy.id)}
              vacancy={vacancy}
              compact
            />
          ))
        ) : (
          <FeedbackState
            icon="briefcase"
            title="Você ainda não publicou vagas"
            message="As publicações da sua empresa aparecerão aqui."
            action="Criar vaga"
            onAction={() => router.push("/criar-vaga")}
            styles={styles}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeading({ title, caption, action, onAction, styles }) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCaption}>{caption}</Text>
      </View>
      {action ? (
        <TouchableOpacity
          onPress={onAction}
          style={styles.sectionAction}
          accessibilityRole="button"
        >
          <Text style={styles.sectionActionText}>{action}</Text>
          <Feather name="chevron-right" size={16} color={styles.tintColor} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function LoadingState({ message, styles }) {
  return (
    <View style={styles.feedback}>
      <ActivityIndicator size="small" color={styles.tintColor} />
      <Text style={styles.feedbackMessage}>{message}</Text>
    </View>
  );
}

function FeedbackState({ icon, title, message, action, onAction, styles }) {
  return (
    <View style={styles.feedback}>
      <Feather name={icon} size={24} color={styles.mutedColor} />
      <Text style={styles.feedbackTitle}>{title}</Text>
      <Text style={styles.feedbackMessage}>{message}</Text>
      {action ? (
        <TouchableOpacity onPress={onAction} style={styles.feedbackAction}>
          <Text style={styles.feedbackActionText}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function makeStyles(colors, largeText) {
  const scale = largeText ? 1.12 : 1;
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 18, paddingBottom: 28 },
    greeting: { marginTop: 0, marginBottom: 8 },
    eyebrow: {
      color: colors.tint,
      fontSize: 11 * scale,
      fontWeight: "800",
      letterSpacing: 0.8,
    },
    title: {
      color: colors.text,
      fontSize: 26 * scale,
      fontWeight: "800",
      marginTop: 4,
    },
    subtitle: { color: colors.muted, fontSize: 14 * scale, marginTop: 3 },
    sectionHeading: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      marginTop: 0,
      marginBottom: 8,
    },
    sectionCopy: { flex: 1 },
    sectionTitle: {
      color: colors.text,
      fontSize: 18 * scale,
      fontWeight: "800",
    },
    sectionCaption: { color: colors.muted, fontSize: 12 * scale, marginTop: 3 },
    sectionAction: { flexDirection: "row", alignItems: "center", gap: 2 },
    sectionActionText: {
      color: colors.tint,
      fontSize: 12 * scale,
      fontWeight: "700",
    },
    feedback: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 18,
      paddingVertical: 22,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: 12,
      backgroundColor: colors.surface,
    },
    feedbackTitle: {
      color: colors.text,
      fontSize: 14 * scale,
      fontWeight: "700",
      textAlign: "center",
      marginTop: 9,
    },
    feedbackMessage: {
      color: colors.muted,
      fontSize: 12 * scale,
      lineHeight: 18 * scale,
      textAlign: "center",
      marginTop: 6,
    },
    feedbackAction: {
      marginTop: 11,
      paddingVertical: 7,
      paddingHorizontal: 13,
    },
    feedbackActionText: {
      color: colors.tint,
      fontSize: 12 * scale,
      fontWeight: "800",
    },
  });
  return {
    ...styles,
    tintColor: colors.tint,
    mutedColor: colors.muted,
  };
}
