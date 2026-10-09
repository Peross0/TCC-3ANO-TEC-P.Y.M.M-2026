import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiFetch, saveToken } from '../lib/api';

const BRAND = {
  blue: '#38B6F5',
  black: '#111111',
  gray: '#777777',
  line: '#E7E9EC',
  background: '#F6F8FA',
  white: '#FFFFFF',
};
function FormField({ label, icon, children }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Feather name={icon} size={18} color={BRAND.gray} />
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
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [curso, setCurso] = useState('');
  const [cpf, setCpf] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    setErrorMessage('');

    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();
    const documento = cpf.replace(/\D/g, '');

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
    if (documento.length !== 11) {
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
          user_type: 'CANDIDATE',
          document_type: 'CPF',
          document_number: documento,
        }),
        token: null,
      });
      await saveToken(data.token);
      router.replace('/carregando');
    } catch (error) {
      if (error.status === 409) {
        setErrorMessage('Este e-mail ou CPF já está cadastrado. Entre com sua conta ou confira os dados.');
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
      <StatusBar barStyle="dark-content" backgroundColor={BRAND.background} />
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

          <Text style={styles.title}>Crie sua conta</Text>
          <Text style={styles.subtitle}>Preencha seus dados para encontrar sua próxima oportunidade.</Text>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Seus dados</Text>
            <Text style={styles.sectionSubtitle}>Os campos com * são obrigatórios.</Text>
            <FormField label="Nome completo *" icon="user">
              <TextInput
                style={styles.input}
                placeholder="Como podemos chamar você?"
                placeholderTextColor="#A0A4A8"
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
                placeholderTextColor="#A0A4A8"
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
                placeholderTextColor="#A0A4A8"
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
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={19} color={BRAND.gray} />
              </TouchableOpacity>
            </FormField>
            <FormField label="CPF *" icon="credit-card">
              <TextInput
                style={styles.input}
                placeholder="000.000.000-00"
                placeholderTextColor="#A0A4A8"
                value={cpf}
                onChangeText={(value) => { setCpf(formatCpf(value)); setErrorMessage(''); }}
                keyboardType="number-pad"
                maxLength={14}
                returnKeyType="next"
              />
            </FormField>
            <FormField label="Telefone (opcional)" icon="phone">
              <TextInput
                style={styles.input}
                placeholder="(00) 00000-0000"
                placeholderTextColor="#A0A4A8"
                value={telefone}
                onChangeText={setTelefone}
                keyboardType="phone-pad"
                autoComplete="tel"
                returnKeyType="next"
              />
            </FormField>
            <FormField label="Curso (opcional)" icon="book-open">
              <TextInput
                style={styles.input}
                placeholder="Ex.: Técnico em Informática"
                placeholderTextColor="#A0A4A8"
                value={curso}
                onChangeText={setCurso}
                returnKeyType="done"
              />
            </FormField>
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

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: BRAND.background },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 30 },
  brandLine: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND.blue,
  },
  brandName: { color: BRAND.black, fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  brandAccent: { color: BRAND.blue },
  backButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 7, marginBottom: 16, paddingVertical: 4 },
  backText: { color: BRAND.gray, fontSize: 14, fontWeight: '600' },
  title: { color: BRAND.black, fontSize: 30, lineHeight: 37, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { color: BRAND.gray, fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 22 },
  formCard: { backgroundColor: BRAND.white, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#EEF0F2' },
  sectionTitle: { color: BRAND.black, fontSize: 19, fontWeight: '800' },
  sectionSubtitle: { color: BRAND.gray, fontSize: 13, lineHeight: 19, marginTop: 5, marginBottom: 14 },
  fieldGroup: { marginBottom: 12 },
  fieldLabel: { color: BRAND.black, fontSize: 13, fontWeight: '700', marginBottom: 7 },
  inputWrapper: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BRAND.line,
    borderRadius: 12,
    paddingHorizontal: 13,
    backgroundColor: BRAND.white,
  },
  input: { flex: 1, minWidth: 0, height: 50, paddingHorizontal: 10, color: BRAND.black, fontSize: 14 },
  errorMessage: {
    color: '#B42318',
    backgroundColor: '#FEF3F2',
    borderWidth: 1,
    borderColor: '#FECDCA',
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
    backgroundColor: BRAND.blue,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  primaryButtonText: { color: BRAND.white, fontSize: 15, fontWeight: '700' },
  disabledButton: { opacity: 0.65 },
  loginLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    paddingTop: 17,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F2',
  },
  loginText: { color: BRAND.gray, fontSize: 13 },
  loginLink: { color: '#168AC7', fontSize: 13, fontWeight: '700' },
  secureNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 22 },
  secureNoteText: { color: BRAND.gray, fontSize: 12 },
});
