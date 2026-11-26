import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppPreferences } from '../context/PreferencesContext';
import { apiFetch, saveToken } from '../lib/api';
import { isValidCnpj } from '../lib/cnpj';

const makeBrand = (colors) => ({
  blue: colors.tint,
  black: colors.text,
  gray: colors.muted,
  line: colors.line,
  background: colors.background,
  white: colors.buttonText,
});

function FormField({ label, icon, children }) {
  const { colors } = useAppPreferences();
  const styles = makeStyles(colors);
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Feather name={icon} size={18} color={colors.muted} />
        {children}
      </View>
    </View>
  );
}

function formatCpf(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export default function RegisterScreen() {
  const { tipo } = useLocalSearchParams();
  const [accountType, setAccountType] = useState(() => (tipo === 'recrutador' ? 'RECRUITER' : 'CANDIDATE'));
  const isRecruiter = accountType === 'RECRUITER';
  const { colors, isDark } = useAppPreferences();
  const BRAND = makeBrand(colors);
  const styles = makeStyles(colors);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [curso, setCurso] = useState('');
  const [cpf, setCpf] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const selectAccountType = (type) => {
    setAccountType(type);
    setCpf('');
    setEmpresa('');
    setTelefone('');
    setCurso('');
    setErrorMessage('');
  };

  const handleRegister = async () => {
    if (isSubmitting) return;
    setErrorMessage('');

    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();
    const documento = isRecruiter ? cpf.toUpperCase().replace(/[.\/\-\s]/g, '') : cpf.replace(/\D/g, '');

    if (isRecruiter && empresa.trim().length < 2) {
      setErrorMessage('Informe o nome da empresa.');
      return;
    }
    if (nomeLimpo.length < 2) {
      setErrorMessage('Informe seu nome completo.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      setErrorMessage('Informe um e-mail válido.');
      return;
    }
    if (senha.length < 8) {
      setErrorMessage('A senha deve conter no mínimo 8 caracteres.');
      return;
    }
    if (isRecruiter && senha !== confirmacao) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }
    if (isRecruiter && !telefone.trim()) {
      setErrorMessage('Informe o telefone.');
      return;
    }
    if (isRecruiter && cpf.trim() && !isValidCnpj(cpf)) {
      setErrorMessage('Informe um CNPJ válido ou deixe o campo em branco.');
      return;
    }
    if (!isRecruiter && documento.length !== 11) {
      setErrorMessage('Informe um CPF com 11 números.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: nomeLimpo,
          email: emailLimpo,
          password: senha,
          phone: telefone.trim() || undefined,
          course: curso.trim() || undefined,
          company_name: isRecruiter ? empresa.trim() : undefined,
          user_type: isRecruiter ? 'RECRUITER' : 'CANDIDATE',
          ...(isRecruiter && !documento
            ? {}
            : { document_type: isRecruiter ? 'CNPJ' : 'CPF', document_number: documento }),
        }),
        token: null,
      });
      await saveToken(data.token);
      router.replace('/carregando');
    } catch (error) {
      if (error.status === 409) {
        setErrorMessage(`Este e-mail ou ${isRecruiter ? 'CNPJ' : 'CPF'} já está cadastrado. Entre com sua conta ou confira os dados.`);
      } else if (error instanceof TypeError) {
        setErrorMessage('Não foi possível conectar ao servidor. Confira se o backend está ativo.');
      } else {
        setErrorMessage(error.message || 'Não foi possível criar sua conta. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={BRAND.background} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandLine}>
            <View style={styles.brandIcon}>
              <Feather name="link" size={19} color={BRAND.white} />
            </View>
            <Text style={styles.brandName}>Conecta<Text style={styles.brandAccent}>Fácil</Text></Text>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Feather name="arrow-left" size={19} color={BRAND.black} />
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{isRecruiter ? 'Cadastre sua empresa' : 'Crie sua conta'}</Text>
          <Text style={styles.subtitle}>{isRecruiter ? 'Crie seu acesso para gerenciar oportunidades.' : 'Preencha seus dados para encontrar sua próxima oportunidade.'}</Text>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Como você deseja utilizar o Conecta Fácil?</Text>
            <View style={styles.accountChoices}>
              <TouchableOpacity style={[styles.accountChoice, accountType === 'CANDIDATE' && styles.accountChoiceActive]} onPress={() => selectAccountType('CANDIDATE')} accessibilityRole="radio" accessibilityState={{ selected: accountType === 'CANDIDATE' }}>
                <View style={styles.accountChoiceIcon}><Feather name="user" size={17} color={colors.tint} /></View>
                <Text style={styles.accountChoiceTitle}>Candidato</Text>
                <Text style={styles.accountChoiceDescription}>Estou procurando oportunidades de emprego, estágio ou primeiro trabalho.</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.accountChoice, accountType === 'RECRUITER' && styles.accountChoiceActive]} onPress={() => selectAccountType('RECRUITER')} accessibilityRole="radio" accessibilityState={{ selected: accountType === 'RECRUITER' }}>
                <View style={styles.accountChoiceIcon}><Feather name="briefcase" size={17} color={colors.tint} /></View>
                <Text style={styles.accountChoiceTitle}>Empresário</Text>
                <Text style={styles.accountChoiceDescription}>Quero divulgar oportunidades e encontrar profissionais.</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionTitle}>Seus dados</Text>
            <Text style={styles.sectionSubtitle}>Os campos com * são obrigatórios.</Text>
            {isRecruiter && <FormField label="Nome da empresa *" icon="briefcase">
              <TextInput style={styles.input} placeholder="Nome da empresa" placeholderTextColor={colors.placeholder} value={empresa} onChangeText={setEmpresa} autoCapitalize="words" maxLength={255} />
            </FormField>}
            <FormField label={isRecruiter ? 'Nome do responsável *' : 'Nome completo *'} icon="user">
              <TextInput
                style={styles.input}
                placeholder="Como podemos chamar você?"
                placeholderTextColor={colors.placeholder}
                value={nome}
                onChangeText={(value) => { setNome(value); setErrorMessage(''); }}
                autoComplete="name"
                returnKeyType="next"
              />
            </FormField>
            <FormField label="E-mail *" icon="mail">
              <TextInput
                style={styles.input}
                placeholder="seuemail@exemplo.com"
                placeholderTextColor={colors.placeholder}
                value={email}
                onChangeText={(value) => { setEmail(value); setErrorMessage(''); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
              />
            </FormField>
            <FormField label="Senha *" icon="lock">
              <TextInput
                style={styles.input}
                placeholder="Mínimo de 8 caracteres"
                placeholderTextColor={colors.placeholder}
                value={senha}
                onChangeText={(value) => { setSenha(value); setErrorMessage(''); }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="new-password"
                returnKeyType="next"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((visible) => !visible)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={19} color={colors.muted} />
              </TouchableOpacity>
            </FormField>
            {isRecruiter && <FormField label="Confirmar senha *" icon="lock">
              <TextInput style={styles.input} placeholder="Digite a senha novamente" placeholderTextColor={colors.placeholder} value={confirmacao} onChangeText={setConfirmacao} secureTextEntry autoCapitalize="none" autoComplete="new-password" />
            </FormField>}
            <FormField label={isRecruiter ? 'CNPJ (opcional)' : 'CPF *'} icon="credit-card">
              <TextInput
                style={styles.input}
                placeholder={isRecruiter ? '00.000.000/0000-00' : '000.000.000-00'}
                placeholderTextColor={colors.placeholder}
                value={cpf}
                onChangeText={(value) => { setCpf(isRecruiter ? value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 14) : formatCpf(value)); setErrorMessage(''); }}
                keyboardType={isRecruiter ? 'default' : 'number-pad'}
                autoCapitalize={isRecruiter ? 'characters' : 'none'}
                maxLength={isRecruiter ? 18 : 14}
                returnKeyType="next"
              />
            </FormField>
            <FormField label={isRecruiter ? 'Telefone *' : 'Telefone (opcional)'} icon="phone">
              <TextInput
                style={styles.input}
                placeholder="(00) 00000-0000"
                placeholderTextColor={colors.placeholder}
                value={telefone}
                onChangeText={setTelefone}
                keyboardType="phone-pad"
                maxLength={20}
                autoComplete="tel"
                returnKeyType="next"
              />
            </FormField>
            {!isRecruiter && <FormField label="Curso (opcional)" icon="book-open">
              <TextInput
                style={styles.input}
                placeholder="Ex.: Técnico em Informática"
                placeholderTextColor={colors.placeholder}
                value={curso}
                onChangeText={setCurso}
                returnKeyType="done"
              />
            </FormField>}
            {!!errorMessage && <Text style={styles.errorMessage} accessibilityRole="alert">{errorMessage}</Text>}
            <TouchableOpacity
              style={[styles.primaryButton, isSubmitting && styles.disabledButton]}
              onPress={handleRegister}
              disabled={isSubmitting}
              accessibilityRole="button"
            >
              {isSubmitting
                ? <ActivityIndicator color={BRAND.white} />
                : <Text style={styles.primaryButtonText}>Criar conta</Text>}
              {!isSubmitting && <Feather name="arrow-right" size={18} color={BRAND.white} />}
            </TouchableOpacity>
            <View style={styles.loginLine}>
              <Text style={styles.loginText}>Já tem uma conta? </Text>
              <TouchableOpacity onPress={() => router.back()} accessibilityRole="button">
                <Text style={styles.loginLink}>Faça login</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.secureNote}>
            <Feather name="lock" size={14} color={BRAND.gray} />
            <Text style={styles.secureNoteText}>Seus dados estão protegidos</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 30 },
  brandLine: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tint,
  },
  brandName: { color: colors.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  brandAccent: { color: colors.tint },
  backButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 7, marginBottom: 16, paddingVertical: 4 },
  backText: { color: colors.muted, fontSize: 14, fontWeight: '600' },
  title: { color: colors.text, fontSize: 30, lineHeight: 37, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 22 },
  formCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.line },
  sectionTitle: { color: colors.text, fontSize: 19, fontWeight: '800' },
  accountChoices: { gap: 9, marginTop: 13, marginBottom: 19 },
  accountChoice: { minHeight: 82, position: 'relative', paddingLeft: 52, paddingRight: 12, paddingVertical: 11, borderWidth: 1, borderColor: colors.line, borderRadius: 12, backgroundColor: colors.surface },
  accountChoiceActive: { borderColor: colors.tint, backgroundColor: colors.accentWash },
  accountChoiceIcon: { position: 'absolute', left: 12, top: 13, width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: colors.primaryWash },
  accountChoiceTitle: { color: colors.text, fontSize: 13, fontWeight: '800' },
  accountChoiceDescription: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 4 },
  sectionSubtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 5, marginBottom: 14 },
  fieldGroup: { marginBottom: 12 },
  fieldLabel: { color: colors.text, fontSize: 13, fontWeight: '700', marginBottom: 7 },
  inputWrapper: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 13,
    backgroundColor: colors.surface,
  },
  input: { flex: 1, minWidth: 0, height: 50, paddingHorizontal: 10, color: colors.text, fontSize: 14 },
  errorMessage: {
    color: colors.error,
    backgroundColor: colors.errorWash,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: 10,
    padding: 11,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  primaryButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: colors.tint,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  primaryButtonText: { color: colors.buttonText, fontSize: 15, fontWeight: '700' },
  disabledButton: { opacity: 0.65 },
  loginLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    paddingTop: 17,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  loginText: { color: colors.muted, fontSize: 13 },
  loginLink: { color: colors.tint, fontSize: 13, fontWeight: '700' },
  secureNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 22 },
  secureNoteText: { color: colors.muted, fontSize: 12 },
});
