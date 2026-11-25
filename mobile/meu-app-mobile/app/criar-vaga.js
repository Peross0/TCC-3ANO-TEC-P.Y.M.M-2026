import { Feather } from "@expo/vector-icons";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppPreferences } from "../context/PreferencesContext";
import { SessionContext } from "../context/SessionContext";
import { apiFetch } from "../lib/api";

const CHOICES = {
  work_model: [
    ["ONSITE", "Presencial"],
    ["REMOTE", "Remoto"],
    ["HYBRID", "Híbrido"],
  ],
  contract_type: [
    ["CLT", "CLT"],
    ["PJ", "PJ"],
    ["INTERNSHIP", "Estágio"],
    ["APPRENTICE", "Aprendiz"],
    ["FREELANCE", "Freelance"],
    ["TEMPORARY", "Temporário"],
  ],
  experience_level: [
    ["", "Não informar"],
    ["FIRST_JOB", "Primeiro emprego"],
    ["NO_EXPERIENCE", "Sem experiência"],
    ["EXPERIENCED", "Com experiência"],
  ],
  work_schedule: [
    ["", "Não informar"],
    ["PART_TIME", "Meio período"],
    ["FULL_TIME", "Integral"],
    ["FLEXIBLE", "Flexível"],
  ],
};

const INITIAL_FORM = {
  company_name: "",
  company_description: "",
  job_title: "",
  company_sector: "",
  job_description: "",
  requirements: "",
  benefits: "",
  location: "",
  work_model: "ONSITE",
  contract_type: "CLT",
  experience_level: "",
  work_schedule: "",
  salary_min: "",
  salary_max: "",
};

export default function CreateVacancyScreen() {
  const router = useRouter();
  const { vacancyId: routeVacancyId } = useLocalSearchParams();
  const vacancyId = Array.isArray(routeVacancyId)
    ? routeVacancyId[0]
    : routeVacancyId;
  const isEditing = Boolean(vacancyId);
  const { sessionData, setSessionData } = useContext(SessionContext);
  const { colors, preferences } = useAppPreferences();
  const styles = makeStyles(colors, preferences.large_text);
  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    company_name:
      sessionData?.profile?.company_name ||
      sessionData?.user?.company_name ||
      "",
  }));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [publishError, setPublishError] = useState("");
  const [loadingVacancy, setLoadingVacancy] = useState(isEditing);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!vacancyId) return undefined;
    let active = true;
    apiFetch(`/recruiters/vacancies/${encodeURIComponent(vacancyId)}`)
      .then(({ vacancy }) => {
        if (!active) return;
        if (vacancy.status === "OPEN") {
          setLoadError("Desative a vaga antes de editar suas informações.");
          return;
        }
        setForm({
          ...INITIAL_FORM,
          company_name: vacancy.company_name || "",
          company_description: vacancy.company_description || "",
          job_title: vacancy.job_title || "",
          company_sector: vacancy.company_sector || "",
          job_description: vacancy.job_description || "",
          requirements: vacancy.requirements || "",
          benefits: vacancy.benefits || "",
          location: vacancy.location || "",
          work_model: vacancy.work_model || "ONSITE",
          contract_type: vacancy.contract_type || "CLT",
          experience_level: vacancy.experience_level || "",
          work_schedule: vacancy.work_schedule || "",
          salary_min: vacancy.salary_min ? String(vacancy.salary_min) : "",
          salary_max: vacancy.salary_max ? String(vacancy.salary_max) : "",
        });
      })
      .catch((error) => {
        if (active)
          setLoadError(error.message || "Não foi possível carregar esta vaga.");
      })
      .finally(() => {
        if (active) setLoadingVacancy(false);
      });
    return () => {
      active = false;
    };
  }, [vacancyId]);

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const publish = async () => {
    if (saving) return;
    const validationErrors = {};
    const companyName = form.company_name.trim();
    const companyDescription = form.company_description.trim();
    const jobTitle = form.job_title.trim();
    const jobDescription = form.job_description.trim();
    const requirements = form.requirements.trim();

    if (companyName.length < 2)
      validationErrors.company_name = "Informe o nome da empresa.";
    else if (companyName.length > 255)
      validationErrors.company_name = "Use no máximo 255 caracteres.";
    if (!isEditing && !companyDescription)
      validationErrors.company_description =
        "Informe uma breve apresentação da empresa.";
    else if (!isEditing && companyDescription.length > 1000)
      validationErrors.company_description = "Use no máximo 1000 caracteres.";
    if (jobTitle.length < 3)
      validationErrors.job_title = "O título deve ter pelo menos 3 caracteres.";
    else if (jobTitle.length > 255)
      validationErrors.job_title = "Use no máximo 255 caracteres.";
    if (jobDescription.length < 10)
      validationErrors.job_description =
        "A descrição deve ter pelo menos 10 caracteres.";
    if (!isEditing && !requirements)
      validationErrors.requirements = "Informe os requisitos da vaga.";
    else if (requirements.length > 1000)
      validationErrors.requirements = "Use no máximo 1000 caracteres.";
    if (form.company_sector.trim().length > 100)
      validationErrors.company_sector = "Use no máximo 100 caracteres.";
    if (form.benefits.trim().length > 1000)
      validationErrors.benefits = "Use no máximo 1000 caracteres.";
    if (form.location.trim().length > 255)
      validationErrors.location = "Use no máximo 255 caracteres.";
    for (const field of Object.keys(CHOICES)) {
      if (!CHOICES[field].some(([value]) => value === form[field])) {
        validationErrors[field] = "Selecione uma opção válida.";
      }
    }

    const salaryMin = form.salary_min.trim()
      ? Number(form.salary_min.replace(",", "."))
      : undefined;
    const salaryMax = form.salary_max.trim()
      ? Number(form.salary_max.replace(",", "."))
      : undefined;
    if (
      salaryMin !== undefined &&
      (!Number.isFinite(salaryMin) || salaryMin <= 0)
    ) {
      validationErrors.salary_min = "Informe um valor maior que zero.";
    }
    if (
      salaryMax !== undefined &&
      (!Number.isFinite(salaryMax) || salaryMax <= 0)
    ) {
      validationErrors.salary_max = "Informe um valor maior que zero.";
    }
    if (
      salaryMin !== undefined &&
      salaryMax !== undefined &&
      salaryMin > salaryMax
    ) {
      validationErrors.salary_min =
        "O mínimo deve ser menor ou igual ao máximo.";
    }
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      return;
    }

    const payload = {
      job_title: jobTitle,
      company_name: companyName,
      company_sector: form.company_sector.trim(),
      job_description: jobDescription,
      requirements: isEditing ? requirements : requirements || undefined,
      benefits: form.benefits.trim(),
      location: form.location.trim(),
      work_model: form.work_model,
      contract_type: form.contract_type,
      experience_level: form.experience_level || null,
      work_schedule: form.work_schedule || null,
      salary_min: isEditing ? (salaryMin ?? null) : salaryMin,
      salary_max: isEditing ? (salaryMax ?? null) : salaryMax,
    };

    setSaving(true);
    setPublishError("");
    try {
      await apiFetch(
        isEditing
          ? `/recruiters/vacancies/${encodeURIComponent(vacancyId)}`
          : "/recruiters/vacancies",
        {
          method: isEditing ? "PUT" : "POST",
          body: JSON.stringify(
            isEditing
              ? payload
              : { ...payload, company_description: companyDescription },
          ),
        },
      );
      setSessionData((current) =>
        current
          ? { ...current, recruiterVacanciesUpdatedAt: Date.now() }
          : current,
      );
      Alert.alert(
        isEditing ? "Vaga atualizada" : "Vaga publicada",
        isEditing
          ? "As alterações foram salvas com sucesso."
          : "A oportunidade foi salva e já está disponível para candidatos.",
        [
          {
            text: "Ver minhas vagas",
            onPress: () => router.navigate("/(tabs)/gerenciar-vagas"),
          },
          { text: "Continuar", style: "cancel" },
        ],
      );
    } catch (error) {
      setPublishError(
        error.message || "Verifique sua conexão e tente novamente.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (sessionData?.user?.user_type !== "RECRUITER") {
    return <Redirect href={sessionData?.user ? "/(tabs)/home" : "/"} />;
  }

  if (loadingVacancy) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={styles.feedbackText}>Carregando dados da vaga...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loadError) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingState}>
          <Feather name="alert-circle" size={28} color={colors.error} />
          <Text style={styles.feedbackText}>{loadError}</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.retryText}>Voltar para gerenciar vagas</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.safeArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Feather name="arrow-left" size={21} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>
              {isEditing ? "Editar vaga" : "Criar vaga"}
            </Text>
            <Text style={styles.subtitle}>
              Os dados serão publicados para candidatos.
            </Text>
          </View>
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Field
            label="Empresa *"
            value={form.company_name}
            onChangeText={(value) => update("company_name", value)}
            placeholder="Nome da empresa"
            error={errors.company_name}
            maxLength={255}
            styles={styles}
            colors={colors}
          />
          {!isEditing ? (
            <Field
              label="Sobre a empresa *"
              value={form.company_description}
              onChangeText={(value) => update("company_description", value)}
              placeholder="Apresentação breve da empresa"
              error={errors.company_description}
              maxLength={1000}
              multiline
              styles={styles}
              colors={colors}
            />
          ) : null}
          <Field
            label="Título da vaga *"
            value={form.job_title}
            onChangeText={(value) => update("job_title", value)}
            placeholder="Ex.: Assistente administrativo"
            error={errors.job_title}
            maxLength={255}
            styles={styles}
            colors={colors}
          />
          <Field
            label="Área profissional"
            value={form.company_sector}
            onChangeText={(value) => update("company_sector", value)}
            placeholder="Ex.: Tecnologia"
            error={errors.company_sector}
            maxLength={100}
            styles={styles}
            colors={colors}
          />
          <Field
            label="Descrição da oportunidade *"
            value={form.job_description}
            onChangeText={(value) => update("job_description", value)}
            placeholder="Atividades e responsabilidades"
            error={errors.job_description}
            multiline
            styles={styles}
            colors={colors}
          />
          <Field
            label="Requisitos *"
            value={form.requirements}
            onChangeText={(value) => update("requirements", value)}
            placeholder="Requisitos desejados"
            error={errors.requirements}
            maxLength={1000}
            multiline
            styles={styles}
            colors={colors}
          />
          <Field
            label="Benefícios"
            value={form.benefits}
            onChangeText={(value) => update("benefits", value)}
            placeholder="Benefícios oferecidos"
            error={errors.benefits}
            maxLength={1000}
            multiline
            styles={styles}
            colors={colors}
          />
          <Field
            label="Cidade e estado"
            value={form.location}
            onChangeText={(value) => update("location", value)}
            placeholder="Ex.: São Paulo - SP"
            error={errors.location}
            maxLength={255}
            styles={styles}
            colors={colors}
          />
          <ChoiceGroup
            label="Modalidade"
            field="work_model"
            form={form}
            update={update}
            error={errors.work_model}
            styles={styles}
            colors={colors}
          />
          <ChoiceGroup
            label="Tipo de contrato"
            field="contract_type"
            form={form}
            update={update}
            error={errors.contract_type}
            styles={styles}
            colors={colors}
          />
          <ChoiceGroup
            label="Experiência"
            field="experience_level"
            form={form}
            update={update}
            error={errors.experience_level}
            styles={styles}
            colors={colors}
          />
          <ChoiceGroup
            label="Jornada"
            field="work_schedule"
            form={form}
            update={update}
            error={errors.work_schedule}
            styles={styles}
            colors={colors}
          />
          <View style={styles.field}>
            <Text style={styles.label}>Faixa salarial mensal (R$)</Text>
            <View style={styles.salaryRow}>
              <View style={styles.salaryField}>
                <TextInput
                  value={form.salary_min}
                  onChangeText={(value) =>
                    update("salary_min", value.replace(/[^\d.,]/g, ""))
                  }
                  placeholder="Mínimo"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  style={[
                    styles.input,
                    styles.salaryInput,
                    errors.salary_min && styles.inputError,
                  ]}
                  accessibilityLabel="Salário mínimo"
                />
                {errors.salary_min ? (
                  <Text style={styles.errorText}>{errors.salary_min}</Text>
                ) : null}
              </View>
              <Text style={styles.rangeText}>até</Text>
              <View style={styles.salaryField}>
                <TextInput
                  value={form.salary_max}
                  onChangeText={(value) =>
                    update("salary_max", value.replace(/[^\d.,]/g, ""))
                  }
                  placeholder="Máximo"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  style={[
                    styles.input,
                    styles.salaryInput,
                    errors.salary_max && styles.inputError,
                  ]}
                  accessibilityLabel="Salário máximo"
                />
                {errors.salary_max ? (
                  <Text style={styles.errorText}>{errors.salary_max}</Text>
                ) : null}
              </View>
            </View>
          </View>
          {publishError ? (
            <Text style={styles.publishError}>{publishError}</Text>
          ) : null}
          <TouchableOpacity
            style={[styles.submitButton, saving && styles.disabled]}
            onPress={publish}
            disabled={saving}
            accessibilityRole="button"
          >
            <Text style={styles.submitText}>
              {saving
                ? isEditing
                  ? "Salvando..."
                  : "Publicando..."
                : isEditing
                  ? "Salvar alterações"
                  : "Publicar vaga"}
            </Text>
            {saving ? (
              <ActivityIndicator size="small" color={colors.buttonText} />
            ) : (
              <Feather name="send" size={17} color={colors.buttonText} />
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, styles, colors, multiline, error, ...inputProps }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        placeholderTextColor={colors.muted}
        style={[
          styles.input,
          multiline && styles.textArea,
          error && styles.inputError,
        ]}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function ChoiceGroup({ label, field, form, update, error, styles, colors }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.choices}>
        {CHOICES[field].map(([value, title]) => {
          const selected = form[field] === value;
          return (
            <TouchableOpacity
              key={value || "none"}
              onPress={() => update(field, value)}
              style={[styles.choice, selected && styles.choiceSelected]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <Text
                style={[
                  styles.choiceText,
                  selected && styles.choiceTextSelected,
                ]}
              >
                {title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function makeStyles(colors, largeText) {
  const scale = largeText ? 1.12 : 1;
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.line,
      backgroundColor: colors.surface,
    },
    backButton: {
      width: 42,
      height: 42,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },
    headerCopy: { flex: 1 },
    title: { color: colors.text, fontSize: 19 * scale, fontWeight: "800" },
    subtitle: { color: colors.muted, fontSize: 12 * scale, marginTop: 3 },
    content: {
      width: "100%",
      maxWidth: 640,
      alignSelf: "center",
      padding: 18,
      paddingBottom: 36,
    },
    loadingState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      gap: 12,
    },
    feedbackText: {
      color: colors.text,
      fontSize: 14 * scale,
      textAlign: "center",
      lineHeight: 20 * scale,
    },
    retryText: { color: colors.tint, fontSize: 13 * scale, fontWeight: "700" },
    field: { marginBottom: 14 },
    salaryField: { flex: 1, minWidth: 0 },
    label: {
      color: colors.text,
      fontSize: 13 * scale,
      fontWeight: "700",
      marginBottom: 7,
    },
    input: {
      minHeight: 46,
      width: "100%",
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: 11,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.text,
      backgroundColor: colors.surface,
      fontSize: 14 * scale,
    },
    textArea: { minHeight: 96, paddingTop: 12 },
    choices: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    choice: {
      maxWidth: "100%",
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      borderRadius: 18,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    choiceSelected: {
      borderColor: colors.tint,
      backgroundColor: colors.primaryWash,
    },
    choiceText: {
      color: colors.muted,
      fontSize: 12 * scale,
      fontWeight: "600",
    },
    choiceTextSelected: { color: colors.tint },
    salaryRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    salaryInput: { flex: 1, minWidth: 0 },
    inputError: { borderColor: colors.error },
    errorText: { color: colors.error, fontSize: 12 * scale, marginTop: 5 },
    publishError: {
      color: colors.error,
      fontSize: 13 * scale,
      lineHeight: 18 * scale,
      padding: 11,
      borderRadius: 9,
      backgroundColor: colors.errorWash,
      marginTop: 10,
    },
    rangeText: { color: colors.muted, fontSize: 12 * scale },
    submitButton: {
      minHeight: 50,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
      marginTop: 12,
      borderRadius: 12,
      backgroundColor: colors.tint,
    },
    submitText: {
      color: colors.buttonText,
      fontSize: 14 * scale,
      fontWeight: "800",
    },
    disabled: { opacity: 0.6 },
  });
}
