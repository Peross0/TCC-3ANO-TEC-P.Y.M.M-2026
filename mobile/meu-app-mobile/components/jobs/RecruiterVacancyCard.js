import { Feather } from "@expo/vector-icons";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAppPreferences } from "../../context/PreferencesContext";
import { formatBrasiliaDateTime, parseApiDate } from "../../lib/dateTime";

const WORK_MODELS = {
  ONSITE: "Presencial",
  HYBRID: "Híbrido",
  REMOTE: "Remoto",
};

function formatSalary(vacancy) {
  const { salary_min: minimum, salary_max: maximum } = vacancy;
  if (!minimum && !maximum) return "Salário não informado";
  const format = (value) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(Number(value));
  if (minimum && maximum) return `${format(minimum)} a ${format(maximum)}`;
  return format(minimum || maximum);
}

function formatDate(value) {
  const date = parseApiDate(value);
  return date ? formatBrasiliaDateTime(date) : "Data indisponível";
}

export default function RecruiterVacancyCard({
  vacancy,
  onPress,
  onEdit,
  onToggleStatus,
  canEdit = vacancy.status !== "OPEN",
  isUpdating = false,
  compact = false,
}) {
  const { colors, preferences } = useAppPreferences();
  const styles = makeStyles(colors, preferences.large_text);
  const isPublic = Boolean(onPress);
  const Card = isPublic ? TouchableOpacity : View;
  const cardProps = isPublic ? { onPress, activeOpacity: 0.78 } : {};

  return (
    <Card style={styles.card} {...cardProps}>
      <View style={styles.topline}>
        <View style={styles.heading}>
          <Text style={styles.title} numberOfLines={2}>
            {vacancy.job_title || "Vaga sem título"}
          </Text>
          <Text style={styles.company} numberOfLines={1}>
            {vacancy.company_name || "Empresa"}
          </Text>
        </View>
        {isPublic ? (
          <Feather name="arrow-up-right" size={18} color={colors.tint} />
        ) : (
          <View
            style={[
              styles.statusBadge,
              vacancy.status === "OPEN" ? styles.openBadge : styles.closedBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                vacancy.status === "OPEN" ? styles.openText : styles.closedText,
              ]}
            >
              {vacancy.status === "OPEN" ? "Ativa" : "Encerrada"}
            </Text>
          </View>
        )}
      </View>

      {isPublic ? (
        <>
          {!compact && vacancy.job_description ? (
            <Text style={styles.description} numberOfLines={3}>
              {vacancy.job_description}
            </Text>
          ) : null}
          <View style={styles.metadata}>
            {vacancy.location ? (
              <Metadata
                icon="map-pin"
                text={vacancy.location}
                styles={styles}
              />
            ) : null}
            {vacancy.work_model ? (
              <Metadata
                icon="briefcase"
                text={WORK_MODELS[vacancy.work_model] || vacancy.work_model}
                styles={styles}
              />
            ) : null}
          </View>
          <View style={styles.bottomline}>
            <Text style={styles.salary}>{formatSalary(vacancy)}</Text>
            <Text style={styles.date}>{formatDate(vacancy.created_at)}</Text>
          </View>
        </>
      ) : (
        <>
          {!compact ? (
            <View style={styles.metadata}>
              {vacancy.location ? (
                <Metadata
                  icon="map-pin"
                  text={vacancy.location}
                  styles={styles}
                />
              ) : null}
              {vacancy.work_model ? (
                <Metadata
                  icon="briefcase"
                  text={WORK_MODELS[vacancy.work_model] || vacancy.work_model}
                  styles={styles}
                />
              ) : null}
            </View>
          ) : null}
          <View style={styles.bottomline}>
            <View style={styles.ownMetadata}>
              <Metadata
                icon="calendar"
                text={formatDate(vacancy.created_at)}
                styles={styles}
              />
              <Metadata
                icon="users"
                text={`${Number(vacancy.applicant_count || 0)} candidatos`}
                styles={styles}
              />
            </View>
          </View>
          {onEdit || onToggleStatus ? (
            <View style={styles.manageActions}>
              {onEdit ? (
                <TouchableOpacity
                  onPress={onEdit}
                  disabled={!canEdit || isUpdating}
                  style={[
                    styles.manageButton,
                    !canEdit && styles.manageButtonDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Editar vaga"
                  accessibilityHint={
                    !canEdit ? "Desative a vaga antes de editar." : undefined
                  }
                  accessibilityState={{ disabled: !canEdit || isUpdating }}
                >
                  <Feather
                    name="edit-2"
                    size={14}
                    color={canEdit ? colors.tint : colors.muted}
                  />
                  <Text
                    style={[
                      styles.manageButtonText,
                      !canEdit && styles.manageButtonTextDisabled,
                    ]}
                  >
                    Editar
                  </Text>
                </TouchableOpacity>
              ) : null}
              {onToggleStatus ? (
                <TouchableOpacity
                  onPress={onToggleStatus}
                  disabled={isUpdating}
                  style={[
                    styles.manageButton,
                    vacancy.status === "OPEN"
                      ? styles.deactivateButton
                      : styles.reactivateButton,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={
                    vacancy.status === "OPEN"
                      ? "Desativar vaga"
                      : "Reativar vaga"
                  }
                  accessibilityState={{ disabled: isUpdating }}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color={colors.tint} />
                  ) : (
                    <Feather
                      name={
                        vacancy.status === "OPEN"
                          ? "pause-circle"
                          : "play-circle"
                      }
                      size={15}
                      color={
                        vacancy.status === "OPEN" ? colors.error : colors.tint
                      }
                    />
                  )}
                  <Text style={styles.manageButtonText}>
                    {vacancy.status === "OPEN" ? "Desativar" : "Reativar"}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
          {onEdit && !canEdit ? (
            <Text style={styles.editHint}>
              Desative a publicação para editar.
            </Text>
          ) : null}
        </>
      )}
    </Card>
  );
}

function Metadata({ icon, text, styles }) {
  return (
    <View style={styles.metadataItem}>
      <Feather name={icon} size={13} color={styles.iconColor} />
      <Text style={styles.metadataText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

function makeStyles(colors, largeText) {
  const scale = largeText ? 1.12 : 1;
  const styles = StyleSheet.create({
    card: {
      padding: 15,
      marginBottom: 11,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
    },
    topline: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
    heading: { flex: 1 },
    title: { color: colors.text, fontSize: 16 * scale, fontWeight: "800" },
    company: { color: colors.muted, fontSize: 13 * scale, marginTop: 4 },
    description: {
      color: colors.muted,
      fontSize: 13 * scale,
      lineHeight: 19 * scale,
      marginTop: 12,
    },
    metadata: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 12,
    },
    metadataItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      maxWidth: "100%",
    },
    metadataText: { color: colors.muted, fontSize: 12 * scale, flexShrink: 1 },
    bottomline: {
      borderTopWidth: 1,
      borderTopColor: colors.line,
      marginTop: 13,
      paddingTop: 11,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    salary: {
      color: colors.primaryDark,
      fontSize: 12 * scale,
      fontWeight: "700",
      flexShrink: 1,
    },
    date: {
      color: colors.muted,
      fontSize: 10 * scale,
      textAlign: "right",
      flexShrink: 1,
    },
    ownMetadata: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
    manageActions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 11,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.line,
    },
    manageButton: {
      flex: 1,
      minHeight: 40,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: 8,
      backgroundColor: colors.surface,
      paddingHorizontal: 8,
    },
    manageButtonDisabled: { backgroundColor: colors.background },
    manageButtonText: {
      color: colors.text,
      fontSize: 12 * scale,
      fontWeight: "700",
    },
    manageButtonTextDisabled: { color: colors.muted },
    deactivateButton: {
      borderColor: colors.errorBorder,
      backgroundColor: colors.errorWash,
    },
    reactivateButton: {
      borderColor: colors.tint,
      backgroundColor: colors.primaryWash,
    },
    editHint: { color: colors.muted, fontSize: 11 * scale, marginTop: 7 },
    statusBadge: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 5 },
    openBadge: { backgroundColor: colors.accentWash },
    closedBadge: { backgroundColor: colors.errorWash },
    statusText: { fontSize: 11 * scale, fontWeight: "700" },
    openText: { color: colors.tint },
    closedText: { color: colors.error },
  });
  return { ...styles, iconColor: colors.muted };
}
