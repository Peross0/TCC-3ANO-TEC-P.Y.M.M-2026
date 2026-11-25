import { Feather } from "@expo/vector-icons";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
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
import { apiFetch } from "../../lib/api";
import { formatBrasiliaDateTime, parseApiDate } from "../../lib/dateTime";

const WORK_MODELS = {
  ONSITE: "Presencial",
  HYBRID: "Híbrido",
  REMOTE: "Remoto",
};
const CONTRACT_TYPES = {
  CLT: "CLT",
  PJ: "PJ",
  INTERNSHIP: "Estágio",
  APPRENTICE: "Aprendiz",
  FREELANCE: "Freelance",
  TEMPORARY: "Temporário",
};

export default function PublicVacancyDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { sessionData } = useContext(SessionContext);
  const { colors, preferences, isDark } = useAppPreferences();
  const styles = makeStyles(colors, preferences.large_text);
  const [vacancy, setVacancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isRecruiter = sessionData?.user?.user_type === "RECRUITER";

  useEffect(() => {
    if (!isRecruiter || !id) return undefined;
    let active = true;
    apiFetch(`/recruiters/public-vacancies/${encodeURIComponent(String(id))}`)
      .then((data) => {
        if (active) setVacancy(data.vacancy || null);
      })
      .catch((requestError) => {
        if (active)
          setError(
            requestError.message || "Não foi possível carregar esta vaga.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, isRecruiter]);

  if (!isRecruiter)
    return <Redirect href={sessionData?.user ? "/(tabs)/home" : "/"} />;

  const salary =
    vacancy?.salary_min || vacancy?.salary_max
      ? [vacancy.salary_min, vacancy.salary_max]
          .filter(Boolean)
          .map((value) =>
            new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
              maximumFractionDigits: 0,
            }).format(Number(value)),
          )
          .join(" a ")
      : "A combinar";
  const publicationDate = parseApiDate(vacancy?.created_at);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Voltar"
        >
          <Feather name="arrow-left" size={21} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da vaga</Text>
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : error || !vacancy ? (
        <View style={styles.center}>
          <Feather name="alert-circle" size={30} color={colors.muted} />
          <Text style={styles.emptyTitle}>Vaga indisponível</Text>
          <Text style={styles.bodyText}>
            {error || "Esta vaga não está mais disponível."}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backAction}
          >
            <Text style={styles.backActionText}>Voltar às oportunidades</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.eyebrow}>
            {vacancy.company_sector || "OPORTUNIDADE"}
          </Text>
          <Text style={styles.title}>{vacancy.job_title}</Text>
          <Text style={styles.company}>{vacancy.company_name}</Text>
          <View style={styles.metadata}>
            {vacancy.location ? (
              <Metadata
                icon="map-pin"
                value={vacancy.location}
                styles={styles}
              />
            ) : null}
            {vacancy.work_model ? (
              <Metadata
                icon="briefcase"
                value={WORK_MODELS[vacancy.work_model] || vacancy.work_model}
                styles={styles}
              />
            ) : null}
            {vacancy.contract_type ? (
              <Metadata
                icon="file-text"
                value={
                  CONTRACT_TYPES[vacancy.contract_type] || vacancy.contract_type
                }
                styles={styles}
              />
            ) : null}
            <Metadata icon="dollar-sign" value={salary} styles={styles} />
            {publicationDate ? (
              <Metadata
                icon="calendar"
                value={formatBrasiliaDateTime(publicationDate)}
                styles={styles}
              />
            ) : null}
          </View>
          {vacancy.company_description ? (
            <DetailSection title="Sobre a empresa" styles={styles}>
              <Text style={styles.bodyText}>{vacancy.company_description}</Text>
            </DetailSection>
          ) : null}
          <DetailSection title="Sobre a vaga" styles={styles}>
            <Text style={styles.bodyText}>
              {vacancy.job_description || "Descrição não informada."}
            </Text>
          </DetailSection>
          {vacancy.requirements ? (
            <DetailSection title="Requisitos" styles={styles}>
              <Text style={styles.bodyText}>{vacancy.requirements}</Text>
            </DetailSection>
          ) : null}
          {vacancy.benefits ? (
            <DetailSection title="Benefícios" styles={styles}>
              <Text style={styles.bodyText}>{vacancy.benefits}</Text>
            </DetailSection>
          ) : null}
          {vacancy.experience_level ? (
            <DetailSection title="Experiência" styles={styles}>
              <Text style={styles.bodyText}>{vacancy.experience_level}</Text>
            </DetailSection>
          ) : null}
          {vacancy.work_schedule ? (
            <DetailSection title="Jornada" styles={styles}>
              <Text style={styles.bodyText}>{vacancy.work_schedule}</Text>
            </DetailSection>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Metadata({ icon, value, styles }) {
  return (
    <View style={styles.metadataRow}>
      <Feather name={icon} size={15} color={styles.tintColor} />
      <Text style={styles.metadataText}>{value}</Text>
    </View>
  );
}

function DetailSection({ title, children, styles }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function makeStyles(colors, largeText) {
  const scale = largeText ? 1.12 : 1;
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 18,
      paddingVertical: 10,
      gap: 12,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      color: colors.text,
      fontSize: 17 * scale,
      fontWeight: "700",
    },
    content: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 30 },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 26,
    },
    eyebrow: { color: colors.tint, fontSize: 11 * scale, fontWeight: "800" },
    title: {
      color: colors.text,
      fontSize: 25 * scale,
      fontWeight: "800",
      marginTop: 8,
    },
    company: { color: colors.muted, fontSize: 16 * scale, marginTop: 5 },
    metadata: {
      gap: 12,
      marginTop: 19,
      paddingVertical: 15,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.line,
    },
    metadataRow: { flexDirection: "row", alignItems: "center", gap: 9 },
    metadataText: { color: colors.text, fontSize: 13 * scale, flexShrink: 1 },
    section: { marginTop: 21 },
    sectionTitle: {
      color: colors.text,
      fontSize: 16 * scale,
      fontWeight: "800",
      marginBottom: 8,
    },
    bodyText: {
      color: colors.muted,
      fontSize: 14 * scale,
      lineHeight: 21 * scale,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 17 * scale,
      fontWeight: "700",
      marginTop: 12,
    },
    backAction: { marginTop: 12, padding: 10 },
    backActionText: {
      color: colors.tint,
      fontSize: 13 * scale,
      fontWeight: "700",
    },
  });
  return { ...styles, tintColor: colors.tint };
}
