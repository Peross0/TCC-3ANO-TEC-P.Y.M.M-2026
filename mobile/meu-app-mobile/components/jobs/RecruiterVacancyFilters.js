import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAppPreferences } from "../../context/PreferencesContext";

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
const QUICK_MODELS = [
  { label: "Todas", value: "" },
  { label: "Recentes", value: "RECENT" },
  { label: "Remoto", value: "REMOTE" },
  { label: "Híbrido", value: "HYBRID" },
  { label: "Presencial", value: "ONSITE" },
];
const QUICK_CONTRACTS = [
  { label: "Todos", value: "" },
  { label: "CLT", value: "CLT" },
  { label: "PJ", value: "PJ" },
  { label: "Estágio", value: "INTERNSHIP" },
  { label: "Freelance", value: "FREELANCE" },
];

function countFilters(filters, searchQuery) {
  return (
    filters.workModels.length +
    filters.contractTypes.length +
    filters.experienceLevels.length +
    filters.workSchedules.length +
    (filters.salaryMin || filters.salaryMax ? 1 : 0) +
    (filters.city.trim() ? 1 : 0) +
    (filters.state.trim() ? 1 : 0) +
    (filters.sector.trim() ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0)
  );
}

export default function RecruiterVacancyFilters({
  filters,
  onChange,
  searchQuery = "",
  onClearSearch,
  sortRecent,
  onSortRecent,
}) {
  const { colors, preferences } = useAppPreferences();
  const styles = makeStyles(colors, preferences.large_text);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [draftFilters, setDraftFilters] = useState(filters);
  const filterCount = countFilters(filters, searchQuery);

  const openAllFilters = () => {
    setDraftFilters({
      ...filters,
      workModels: [...filters.workModels],
      contractTypes: [...filters.contractTypes],
      experienceLevels: [...filters.experienceLevels],
      workSchedules: [...filters.workSchedules],
    });
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

  const applyFilters = () => {
    const minimum = draftFilters.salaryMin.trim();
    const maximum = draftFilters.salaryMax.trim();
    if (
      (minimum && (!Number.isFinite(Number(minimum)) || Number(minimum) < 0)) ||
      (maximum && (!Number.isFinite(Number(maximum)) || Number(maximum) < 0))
    ) {
      Alert.alert(
        "Faixa salarial inválida",
        "Informe valores numéricos positivos.",
      );
      return;
    }
    if (minimum && maximum && Number(minimum) > Number(maximum)) {
      Alert.alert(
        "Faixa salarial inválida",
        "O salário mínimo deve ser menor ou igual ao máximo.",
      );
      return;
    }
    onChange(draftFilters);
    onSortRecent(false);
    setShowAllFilters(false);
  };

  const clearFilters = () => {
    onChange({
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
    onClearSearch?.();
    onSortRecent(false);
    setShowAllFilters(false);
  };

  const selectModel = (value) => {
    if (value === "RECENT") {
      onSortRecent(!sortRecent);
      return;
    }
    onSortRecent(false);
    onChange({ ...filters, workModels: value ? [value] : [] });
  };

  const selectContract = (value) => {
    onChange({ ...filters, contractTypes: value ? [value] : [] });
  };

  const removeTag = (tag) => {
    const next = { ...filters };
    if (
      [
        "workModels",
        "contractTypes",
        "experienceLevels",
        "workSchedules",
      ].includes(tag.field)
    ) {
      next[tag.field] = next[tag.field].filter((value) => value !== tag.value);
    } else if (tag.field === "salary") {
      next.salaryMin = "";
      next.salaryMax = "";
    } else {
      next[tag.field] = "";
    }
    onChange(next);
    if (tag.field === "search") onClearSearch?.();
  };

  const tags = [
    ...filters.workModels.map((value) => ({
      field: "workModels",
      value,
      label:
        WORK_MODEL_OPTIONS.find((option) => option.value === value)?.label ||
        value,
    })),
    ...filters.contractTypes.map((value) => ({
      field: "contractTypes",
      value,
      label:
        CONTRACT_OPTIONS.find((option) => option.value === value)?.label ||
        value,
    })),
    ...filters.experienceLevels.map((value) => ({
      field: "experienceLevels",
      value,
      label:
        EXPERIENCE_OPTIONS.find((option) => option.value === value)?.label ||
        value,
    })),
    ...filters.workSchedules.map((value) => ({
      field: "workSchedules",
      value,
      label:
        SCHEDULE_OPTIONS.find((option) => option.value === value)?.label ||
        value,
    })),
    ...(filters.salaryMin || filters.salaryMax
      ? [
          {
            field: "salary",
            label: `Salário: ${filters.salaryMin || "0"}–${filters.salaryMax || "sem limite"}`,
          },
        ]
      : []),
    ...(filters.city.trim()
      ? [{ field: "city", label: `Cidade: ${filters.city}` }]
      : []),
    ...(filters.state.trim()
      ? [{ field: "state", label: `Estado: ${filters.state}` }]
      : []),
    ...(filters.sector.trim()
      ? [{ field: "sector", label: `Área: ${filters.sector}` }]
      : []),
    ...(searchQuery.trim()
      ? [{ field: "search", label: `Busca: ${searchQuery.trim()}` }]
      : []),
  ];

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickFilters}
      >
        {QUICK_MODELS.map((filter) => {
          const selected =
            filter.value === "RECENT"
              ? sortRecent
              : filter.value === ""
                ? filters.workModels.length === 0 && !sortRecent
                : filters.workModels.length === 1 &&
                  filters.workModels.includes(filter.value);
          return (
            <FilterChip
              key={filter.value || "all-models"}
              label={filter.label}
              selected={selected}
              onPress={() => selectModel(filter.value)}
              styles={styles}
            />
          );
        })}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickFilters}
      >
        {QUICK_CONTRACTS.map((filter) => {
          const selected =
            filter.value === ""
              ? filters.contractTypes.length === 0
              : filters.contractTypes.length === 1 &&
                filters.contractTypes.includes(filter.value);
          return (
            <FilterChip
              key={filter.value || "all-contracts"}
              label={
                filter.label === "Todos" ? "Todos os contratos" : filter.label
              }
              selected={selected}
              onPress={() => selectContract(filter.value)}
              styles={styles}
            />
          );
        })}
      </ScrollView>

      <View style={styles.allFiltersRow}>
        <TouchableOpacity
          onPress={openAllFilters}
          style={styles.allFiltersButton}
          accessibilityRole="button"
        >
          <Feather name="sliders" size={17} color={colors.tint} />
          <Text style={styles.allFiltersText}>Todos os filtros</Text>
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{filterCount}</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.filterCaption}>
          {filterCount} {filterCount === 1 ? "filtro" : "filtros"}
        </Text>
      </View>

      {tags.length ? (
        <View style={styles.activeTags}>
          {tags.map((tag, index) => (
            <TouchableOpacity
              key={`${tag.field}-${tag.value || index}`}
              onPress={() => removeTag(tag)}
              style={styles.activeTag}
              accessibilityLabel={`Remover filtro ${tag.label}`}
            >
              <Text style={styles.activeTagText}>{tag.label}</Text>
              <Feather name="x" size={13} color={colors.tint} />
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      <Modal
        visible={showAllFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAllFilters(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeadingCopy}>
                <Text style={styles.modalTitle}>Todos os filtros</Text>
                <Text style={styles.modalSubtitle}>
                  Combine critérios para encontrar uma oportunidade.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAllFilters(false)}
                style={styles.closeButton}
                accessibilityLabel="Fechar filtros"
              >
                <Feather name="x" size={21} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <FilterOptionGroup
                title="Modalidade"
                options={WORK_MODEL_OPTIONS}
                selected={draftFilters.workModels}
                onToggle={(value) => toggleDraftOption("workModels", value)}
                styles={styles}
                colors={colors}
              />
              <FilterOptionGroup
                title="Tipo de contrato"
                options={CONTRACT_OPTIONS}
                selected={draftFilters.contractTypes}
                onToggle={(value) => toggleDraftOption("contractTypes", value)}
                styles={styles}
                colors={colors}
              />
              <FilterOptionGroup
                title="Experiência"
                options={EXPERIENCE_OPTIONS}
                selected={draftFilters.experienceLevels}
                onToggle={(value) =>
                  toggleDraftOption("experienceLevels", value)
                }
                styles={styles}
                colors={colors}
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
                    style={[styles.filterTextInput, styles.locationInput]}
                    accessibilityLabel="Salário mínimo"
                  />
                  <Text style={styles.rangeSeparator}>até</Text>
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
                    style={[styles.filterTextInput, styles.locationInput]}
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
                <Text style={styles.filterSectionTitle}>Área profissional</Text>
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
                onToggle={(value) => toggleDraftOption("workSchedules", value)}
                styles={styles}
                colors={colors}
              />
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={clearFilters}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Limpar filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyFilters}
                style={styles.applyButton}
              >
                <Text style={styles.applyButtonText}>Aplicar filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function FilterChip({ label, selected, onPress, styles }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.quickChip, selected && styles.quickChipSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text
        style={[styles.quickChipText, selected && styles.quickChipTextSelected]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function FilterOptionGroup({
  title,
  options,
  selected,
  onToggle,
  styles,
  colors,
}) {
  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>{title}</Text>
      <View style={styles.optionList}>
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onToggle(option.value)}
              style={[styles.option, isSelected && styles.optionSelected]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
            >
              <Feather
                name={isSelected ? "check-square" : "square"}
                size={17}
                color={isSelected ? colors.tint : colors.muted}
              />
              <Text style={styles.optionText}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function makeStyles(colors, largeText) {
  const scale = largeText ? 1.1 : 1;
  return StyleSheet.create({
    quickFilters: { flexDirection: "row", gap: 7, paddingBottom: 8 },
    quickChip: {
      minHeight: 34,
      justifyContent: "center",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
    },
    quickChipSelected: {
      backgroundColor: colors.tint,
      borderColor: colors.tint,
    },
    quickChipText: {
      color: colors.muted,
      fontSize: 11 * scale,
      fontWeight: "600",
    },
    quickChipTextSelected: { color: colors.buttonText, fontWeight: "800" },
    allFiltersRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      marginTop: 2,
      marginBottom: 8,
    },
    allFiltersButton: {
      minHeight: 40,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 11,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
    },
    allFiltersText: {
      color: colors.text,
      fontSize: 12 * scale,
      fontWeight: "700",
    },
    filterBadge: {
      minWidth: 19,
      height: 19,
      paddingHorizontal: 4,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 10,
      backgroundColor: colors.primaryWash,
    },
    filterBadgeText: { color: colors.tint, fontSize: 10, fontWeight: "800" },
    filterCaption: { color: colors.muted, fontSize: 11 * scale },
    activeTags: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 7,
      marginBottom: 12,
    },
    activeTag: {
      minHeight: 29,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 9,
      borderRadius: 15,
      backgroundColor: colors.primaryWash,
    },
    activeTagText: {
      color: colors.tint,
      fontSize: 10 * scale,
      fontWeight: "600",
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.55)",
    },
    modalCard: {
      maxHeight: "92%",
      paddingTop: 20,
      paddingHorizontal: 18,
      paddingBottom: 12,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 10,
    },
    modalHeadingCopy: { flex: 1 },
    modalTitle: { color: colors.text, fontSize: 18 * scale, fontWeight: "800" },
    modalSubtitle: { color: colors.muted, fontSize: 12 * scale, marginTop: 3 },
    closeButton: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
    },
    modalScroll: { flexShrink: 1 },
    modalContent: { paddingBottom: 14 },
    filterSection: { marginTop: 12 },
    filterSectionTitle: {
      color: colors.text,
      fontSize: 13 * scale,
      fontWeight: "800",
      marginBottom: 8,
    },
    optionList: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
    option: {
      minHeight: 36,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 9,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
    },
    optionSelected: {
      borderColor: colors.tint,
      backgroundColor: colors.primaryWash,
    },
    optionText: { color: colors.text, fontSize: 11 * scale, fontWeight: "600" },
    filterInputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    filterTextInput: {
      minHeight: 42,
      paddingHorizontal: 11,
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: 8,
      color: colors.text,
      backgroundColor: colors.surface,
      fontSize: 13 * scale,
    },
    locationInput: { flex: 1, minWidth: 0 },
    stateInput: { width: 92 },
    rangeSeparator: { color: colors.muted, fontSize: 11 * scale },
    modalActions: {
      flexDirection: "row",
      gap: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.line,
    },
    clearButton: {
      flex: 1,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 9,
      borderWidth: 1,
      borderColor: colors.line,
    },
    clearButtonText: {
      color: colors.text,
      fontSize: 12 * scale,
      fontWeight: "700",
    },
    applyButton: {
      flex: 1,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 9,
      backgroundColor: colors.tint,
    },
    applyButtonText: {
      color: colors.buttonText,
      fontSize: 12 * scale,
      fontWeight: "800",
    },
  });
}
