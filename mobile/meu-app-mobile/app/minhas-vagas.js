import { Feather } from "@expo/vector-icons";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useContext, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    SectionList,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RecruiterVacancyCard from "../components/jobs/RecruiterVacancyCard";
import { useAppPreferences } from "../context/PreferencesContext";
import { SessionContext } from "../context/SessionContext";
import { apiFetch } from "../lib/api";

const STATUS_FILTERS = [
  { value: "ALL", label: "Todas" },
  { value: "OPEN", label: "Ativas" },
  { value: "CLOSED", label: "Desativadas" },
];

export default function MyVacanciesScreen({ inTab = false } = {}) {
  const router = useRouter();
  const { sessionData } = useContext(SessionContext);
  const { colors, preferences, isDark } = useAppPreferences();
  const styles = makeStyles(colors, preferences.large_text);
  const [vacancies, setVacancies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [updatingVacancyId, setUpdatingVacancyId] = useState(null);
  const isRecruiter = sessionData?.user?.user_type === "RECRUITER";

  const loadVacancies = useCallback(
    async (requestedPage = 1, append = false, quiet = false) => {
      if (!isRecruiter) return;
      setError("");
      if (append) setLoadingMore(true);
      else if (!quiet) setLoading(true);
      try {
        const data = await apiFetch(
          `/recruiters/vacancies?status=${statusFilter}&page=${requestedPage}&limit=50`,
        );
        setVacancies((current) =>
          append
            ? [...current, ...(data.vacancies || [])]
            : data.vacancies || [],
        );
        setPage(requestedPage);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (requestError) {
        setError(
          requestError.message || "Não foi possível carregar suas vagas.",
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [isRecruiter, statusFilter],
  );

  useFocusEffect(
    useCallback(() => {
      loadVacancies(1);
      return undefined;
    }, [loadVacancies]),
  );

  const filteredVacancies = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    if (!query) return vacancies;
    return vacancies.filter((vacancy) =>
      `${vacancy.job_title || ""} ${vacancy.company_name || ""} ${vacancy.job_description || ""}`
        .toLocaleLowerCase("pt-BR")
        .includes(query),
    );
  }, [search, vacancies]);

  const sections = useMemo(() => {
    if (statusFilter !== "ALL") {
      return [
        {
          title: statusFilter === "OPEN" ? "Vagas ativas" : "Vagas desativadas",
          data: filteredVacancies,
        },
      ];
    }
    return [
      {
        title: `Ativas (${filteredVacancies.filter((item) => item.status === "OPEN").length})`,
        data: filteredVacancies.filter((item) => item.status === "OPEN"),
      },
      {
        title: `Desativadas (${filteredVacancies.filter((item) => item.status !== "OPEN").length})`,
        data: filteredVacancies.filter((item) => item.status !== "OPEN"),
      },
    ];
  }, [filteredVacancies, statusFilter]);

  const changeStatus = (vacancy) => {
    const targetStatus = vacancy.status === "OPEN" ? "CLOSED" : "OPEN";
    const actionLabel = targetStatus === "CLOSED" ? "Desativar" : "Reativar";
    Alert.alert(
      `${actionLabel} vaga?`,
      targetStatus === "CLOSED"
        ? "A vaga deixará de aparecer para candidatos, mas continuará salva."
        : "A vaga voltará a ficar disponível para candidatos.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: actionLabel,
          style: targetStatus === "CLOSED" ? "destructive" : "default",
          onPress: async () => {
            setUpdatingVacancyId(String(vacancy.id));
            try {
              await apiFetch(`/recruiters/vacancies/${vacancy.id}`, {
                method: "PUT",
                body: JSON.stringify({ status: targetStatus }),
              });
              await loadVacancies(1, false, true);
              Alert.alert(
                targetStatus === "CLOSED"
                  ? "Vaga desativada"
                  : "Vaga reativada",
                targetStatus === "CLOSED"
                  ? "A publicação foi ocultada e os dados foram preservados."
                  : "A publicação voltou a ficar disponível.",
              );
            } catch (requestError) {
              Alert.alert(
                "Não foi possível alterar a vaga",
                requestError.message ||
                  "Verifique sua conexão e tente novamente.",
              );
            } finally {
              setUpdatingVacancyId(null);
            }
          },
        },
      ],
    );
  };

  const editVacancy = (vacancy) => {
    if (vacancy.status === "OPEN") {
      Alert.alert(
        "Vaga ativa",
        "Para editar esta vaga, primeiro desative a publicação.",
      );
      return;
    }
    router.push({
      pathname: "/criar-vaga",
      params: { vacancyId: String(vacancy.id) },
    });
  };

  if (!isRecruiter)
    return <Redirect href={sessionData?.user ? "/(tabs)/home" : "/"} />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <View style={styles.header}>
        {!inTab ? (
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Voltar"
          >
            <Feather name="arrow-left" size={21} color={colors.text} />
          </TouchableOpacity>
        ) : null}
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Gerenciar vagas</Text>
          <Text style={styles.subtitle}>Publicações da sua empresa</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/criar-vaga")}
          style={styles.createButton}
          accessibilityRole="button"
          accessibilityLabel="Criar vaga"
        >
          <Feather name="plus" size={17} color={colors.buttonText} />
          <Text style={styles.createButtonText}>Criar vaga</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.filters}>
        {STATUS_FILTERS.map((filter) => {
          const selected = statusFilter === filter.value;
          return (
            <TouchableOpacity
              key={filter.value}
              onPress={() => {
                setStatusFilter(filter.value);
                setLoading(true);
                setError("");
              }}
              style={[styles.filterChip, selected && styles.filterChipSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text
                style={[
                  styles.filterText,
                  selected && styles.filterTextSelected,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.searchBox}>
        <Feather name="search" size={18} color={colors.muted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar vaga ou empresa"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Feather name="wifi-off" size={28} color={colors.muted} />
          <Text style={styles.emptyTitle}>
            Não foi possível carregar suas vagas
          </Text>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity
            onPress={() => loadVacancies(1)}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionTitle}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <RecruiterVacancyCard
              vacancy={item}
              onCandidates={() => router.push({ pathname: "/candidatos-vaga", params: { vacancyId: String(item.id) } })}
              onEdit={() => editVacancy(item)}
              onToggleStatus={() => changeStatus(item)}
              isUpdating={updatingVacancyId === String(item.id)}
              canEdit={item.status !== "OPEN"}
            />
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Feather name="briefcase" size={32} color={colors.muted} />
              <Text style={styles.emptyTitle}>
                {search ? "Nenhuma vaga encontrada" : "Nenhuma vaga publicada"}
              </Text>
              <Text style={styles.emptyText}>
                {search
                  ? "Tente outro título ou nome de empresa."
                  : "Suas publicações aparecerão nesta lista."}
              </Text>
            </View>
          }
          onRefresh={() => {
            setRefreshing(true);
            loadVacancies(1, false, true);
          }}
          refreshing={refreshing}
          onEndReached={() => {
            if (!loadingMore && page < totalPages)
              loadVacancies(page + 1, true);
          }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color={colors.tint} style={styles.footer} />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

function makeStyles(colors, largeText) {
  const scale = largeText ? 1.12 : 1;
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 18,
      gap: 12,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    headerCopy: { flex: 1 },
    title: { color: colors.text, fontSize: 21 * scale, fontWeight: "800" },
    subtitle: { color: colors.muted, fontSize: 13 * scale, marginTop: 3 },
    createButton: {
      minHeight: 42,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingHorizontal: 12,
      borderRadius: 9,
      backgroundColor: colors.tint,
    },
    createButtonText: {
      color: colors.buttonText,
      fontSize: 12 * scale,
      fontWeight: "800",
    },
    filters: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 18,
      marginBottom: 12,
    },
    filterChip: {
      minHeight: 34,
      justifyContent: "center",
      paddingHorizontal: 13,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
    },
    filterChipSelected: {
      backgroundColor: colors.tint,
      borderColor: colors.tint,
    },
    filterText: {
      color: colors.muted,
      fontSize: 12 * scale,
      fontWeight: "700",
    },
    filterTextSelected: { color: colors.buttonText },
    searchBox: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 18,
      marginBottom: 12,
      paddingHorizontal: 12,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 14 * scale,
      marginLeft: 8,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 16 * scale,
      fontWeight: "800",
      paddingHorizontal: 18,
      marginTop: 12,
      marginBottom: 8,
    },
    list: { paddingHorizontal: 18, paddingBottom: 26, flexGrow: 1 },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 16 * scale,
      fontWeight: "700",
      textAlign: "center",
      marginTop: 12,
    },
    emptyText: {
      color: colors.muted,
      fontSize: 13 * scale,
      textAlign: "center",
      lineHeight: 19,
      marginTop: 6,
    },
    retryButton: { padding: 12, marginTop: 8 },
    retryText: { color: colors.tint, fontSize: 13 * scale, fontWeight: "700" },
    footer: { padding: 18 },
  });
}
