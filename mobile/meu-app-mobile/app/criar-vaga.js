import { Feather } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { useContext, useState } from "react";
import {
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
  const { sessionData, setSessionData } = useContext(SessionContext);
  const { colors, preferences } = useAppPreferences();
  const styles = makeStyles(colors, preferences.large_text);
  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    company_name: sessionData?.profile?.company_name || "",
  }));
  const [saving, setSaving] = useState(false);

  const update = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const publish = async () => {
    if (saving) return;
    if (
      !form.company_name.trim() ||
      form.company_name.trim().length < 2 ||
      form.job_title.trim().length < 3 ||
      form.job_description.trim().length < 10
    ) {
      Alert.alert(
        "Dados incompletos",
        "Informe a empresa, um título e uma descrição com pelo menos 10 caracteres.",
      );
      return;
    }
    const salaryMin = form.salary_min.trim()
      ? Number(form.salary_min.replace(",", "."))
      : undefined;
    const salaryMax = form.salary_max.trim()
      ? Number(form.salary_max.replace(",", "."))
      : undefined;
    if (
      (salaryMin !== undefined &&
        (!Number.isFinite(salaryMin) || salaryMin <= 0)) ||
      (salaryMax !== undefined &&
        (!Number.isFinite(salaryMax) || salaryMax <= 0)) ||
      (salaryMin !== undefined &&
        salaryMax !== undefined &&
        salaryMin > salaryMax)
    ) {
      Alert.alert(
        "Faixa salarial inválida",
        "Informe valores positivos e um mínimo menor ou igual ao máximo.",
      );
      return;
    }

    setSaving(true);
    try {
      await apiFetch("/recruiters/vacancies", {
        method: "POST",
        body: JSON.stringify({
          company_name: form.company_name.trim(),
          company_description: form.company_description.trim() || undefined,
          job_title: form.job_title.trim(),
          company_sector: form.company_sector.trim() || undefined,
          job_description: form.job_description.trim(),
          requirements: form.requirements.trim() || undefined,
          benefits: form.benefits.trim() || undefined,
          location: form.location.trim() || undefined,
          work_model: form.work_model,
          contract_type: form.contract_type,
          experience_level: form.experience_level || undefined,
          work_schedule: form.work_schedule || undefined,
          salary_min: salaryMin,
          salary_max: salaryMax,
        }),
      });
      setSessionData((current) =>
        current
          ? { ...current, recruiterVacanciesUpdatedAt: Date.now() }
          : current,
      );
      Alert.alert(
        "Vaga publicada",
        "A oportunidade foi salva e já está disponível para candidatos.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (error) {
      Alert.alert(
        "Não foi possível publicar",
        error.message || "Verifique sua conexão e tente novamente.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (sessionData?.user?.user_type !== "RECRUITER") {
    return <Redirect href={sessionData?.user ? "/(tabs)/home" : "/"} />;
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
            <Text style={styles.title}>Criar oportunidade</Text>
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
            styles={styles}
            colors={colors}
          />
          <Field
            label="Sobre a empresa"
            value={form.company_description}
            onChangeText={(value) => update("company_description", value)}
            placeholder="Apresentação breve (opcional)"
            multiline
            styles={styles}
            colors={colors}
          />
          <Field
            label="Título da vaga *"
            value={form.job_title}
            onChangeText={(value) => update("job_title", value)}
            placeholder="Ex.: Assistente administrativo"
            styles={styles}
            colors={colors}
          />
          <Field
            label="Área profissional"
            value={form.company_sector}
            onChangeText={(value) => update("company_sector", value)}
            placeholder="Ex.: Tecnologia"
            styles={styles}
            colors={colors}
          />
          <Field
            label="Descrição da oportunidade *"
            value={form.job_description}
            onChangeText={(value) => update("job_description", value)}
            placeholder="Atividades e responsabilidades"
            multiline
            styles={styles}
            colors={colors}
          />
          <Field
            label="Requisitos"
            value={form.requirements}
            onChangeText={(value) => update("requirements", value)}
            placeholder="Requisitos desejados"
            multiline
            styles={styles}
            colors={colors}
          />
          <Field
            label="Benefícios"
            value={form.benefits}
            onChangeText={(value) => update("benefits", value)}
            placeholder="Benefícios oferecidos"
            multiline
            styles={styles}
            colors={colors}
          />
          <Field
            label="Cidade e estado"
            value={form.location}
            onChangeText={(value) => update("location", value)}
            placeholder="Ex.: São Paulo - SP"
            styles={styles}
            colors={colors}
          />
          <ChoiceGroup
            label="Modalidade"
            field="work_model"
            form={form}
            update={update}
            styles={styles}
            colors={colors}
          />
          <ChoiceGroup
            label="Tipo de contrato"
            field="contract_type"
            form={form}
            update={update}
            styles={styles}
            colors={colors}
          />
          <ChoiceGroup
            label="Experiência"
            field="experience_level"
            form={form}
            update={update}
            styles={styles}
            colors={colors}
          />
          <ChoiceGroup
            label="Jornada"
            field="work_schedule"
            form={form}
            update={update}
            styles={styles}
            colors={colors}
          />
          <Text style={styles.label}>Faixa salarial mensal (R$)</Text>
          <View style={styles.salaryRow}>
            <TextInput
              value={form.salary_min}
              onChangeText={(value) =>
                update("salary_min", value.replace(/[^\d.,]/g, ""))
              }
              placeholder="Mínimo"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              style={[styles.input, styles.salaryInput]}
              accessibilityLabel="Salário mínimo"
            />
            <Text style={styles.rangeText}>até</Text>
            <TextInput
              value={form.salary_max}
              onChangeText={(value) =>
                update("salary_max", value.replace(/[^\d.,]/g, ""))
              }
              placeholder="Máximo"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              style={[styles.input, styles.salaryInput]}
              accessibilityLabel="Salário máximo"
            />
          </View>
          <TouchableOpacity
            style={[styles.submitButton, saving && styles.disabled]}
            onPress={publish}
            disabled={saving}
            accessibilityRole="button"
          >
            <Text style={styles.submitText}>
              {saving ? "Publicando…" : "Publicar vaga"}
            </Text>
            {!saving ? (
              <Feather name="send" size={17} color={colors.buttonText} />
            ) : null}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, styles, colors, multiline, ...inputProps }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        placeholderTextColor={colors.muted}
        style={[styles.input, multiline && styles.textArea]}
      />
    </View>
  );
}

function ChoiceGroup({ label, field, form, update, styles, colors }) {
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
    field: { marginBottom: 14 },
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
