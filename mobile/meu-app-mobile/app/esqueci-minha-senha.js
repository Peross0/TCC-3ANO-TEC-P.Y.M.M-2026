import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
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
import { useAppPreferences } from '../context/PreferencesContext';
import { apiFetch, getToken, saveToken } from '../lib/api';

export default function EsqueciMinhaSenhaScreen() {
  const router = useRouter();
  const { origem } = useLocalSearchParams();
  const { colors, isDark } = useAppPreferences();
  const styles = makeStyles(colors);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting || success) return;
    setSuccess(false);
    if (!email.trim() || !password || !confirmPassword) {
      setErrorMessage('Preencha todos os campos.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Informe um e-mail válido.');
      return;
    }
    if (password.length < 8 || password.length > 128) {
      setErrorMessage('A nova senha deve ter entre 8 e 128 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const body = JSON.stringify({
        email: email.trim().toLowerCase(),
        new_password: password,
        confirm_password: confirmPassword,
      });
      let result;
      if (origem === 'configuracoes') {
        const token = await getToken();
        if (!token) {
          setErrorMessage('Sua sessão não está disponível. Entre novamente para alterar a senha.');
          return;
        }
        result = await apiFetch('/auth/change-password-with-session', { method: 'POST', token, body });
      } else {
        result = await apiFetch('/auth/reset-password', { method: 'POST', token: null, body });
      }
      setPassword('');
      setConfirmPassword('');
      if (origem === 'configuracoes') {
        if (!result.token) {
          setErrorMessage('A senha foi alterada, mas o servidor não retornou uma nova sessão. Entre novamente.');
          return;
        }
        try {
          await saveToken(result.token);
        } catch {
          setErrorMessage('A senha foi alterada, mas não foi possível salvar a nova sessão. Entre novamente.');
          return;
        }
      }
      setSuccess(true);
    } catch (error) {
      setErrorMessage(origem === 'configuracoes' && error.status === 401
        ? 'A sessão expirou ou não é válida. Entre na conta para alterar a senha.'
        : error.message || 'Não foi possível alterar a senha. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.icon}><Feather name="lock" size={24} color={colors.tint} /></View>
            <Text style={styles.title}>Esqueci minha senha</Text>
            <Text style={styles.subtitle}>{origem === 'configuracoes' ? 'Use sua sessão ativa para alterar a senha.' : 'Informe o e-mail cadastrado e escolha uma nova senha.'}</Text>

            <Text style={styles.label}>E-mail cadastrado</Text>
            <TextInput
              style={styles.input}
              accessibilityLabel="E-mail cadastrado"
              value={email}
              onChangeText={setEmail}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor={colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
            />

            <Text style={styles.label}>Nova senha</Text>
            <TextInput
              style={styles.input}
              accessibilityLabel="Nova senha"
              value={password}
              onChangeText={setPassword}
              placeholder="Digite a nova senha"
              placeholderTextColor={colors.muted}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              maxLength={128}
              returnKeyType="next"
            />

            <Text style={styles.label}>Confirmar nova senha</Text>
            <TextInput
              style={styles.input}
              accessibilityLabel="Confirmar nova senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Digite novamente"
              placeholderTextColor={colors.muted}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              maxLength={128}
              onSubmitEditing={handleSubmit}
              returnKeyType="done"
            />

            {!!errorMessage && (
              <Text style={styles.errorMessage} accessibilityRole="alert">{errorMessage}</Text>
            )}
            {success && (
              <Text style={styles.successMessage} accessibilityLiveRegion="polite">
                Senha alterada com sucesso.
              </Text>
            )}

            <TouchableOpacity style={[styles.button, (isSubmitting || success) && styles.disabledButton]} onPress={handleSubmit} disabled={isSubmitting || success} accessibilityRole="button">
              <Text style={styles.buttonText}>{isSubmitting ? 'Salvando...' : 'Redefinir senha'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={() => origem === 'configuracoes' ? router.back() : router.replace('/')} accessibilityRole="button">
              <Text style={styles.backText}>{origem === 'configuracoes' ? 'Voltar às configurações' : 'Voltar para o login'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    flex: { flex: 1 },
    container: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, justifyContent: 'center', padding: 22 },
    card: { width: '100%', maxWidth: 480, alignSelf: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 20, borderWidth: 1, padding: 24 },
    icon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryWash, borderRadius: 16, marginBottom: 18 },
    title: { color: colors.text, fontSize: 24, fontWeight: '800' },
    subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 18 },
    label: { color: colors.text, fontSize: 13, fontWeight: '700', marginBottom: 7, marginTop: 14 },
    input: { backgroundColor: colors.background, borderColor: colors.line, borderRadius: 11, borderWidth: 1, color: colors.text, fontSize: 14, minHeight: 48, paddingHorizontal: 13 },
    button: { minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tint, borderRadius: 11, marginTop: 22, paddingHorizontal: 16 },
    disabledButton: { opacity: 0.65 },
    buttonText: { color: colors.buttonText, fontSize: 14, fontWeight: '700' },
    backButton: { alignItems: 'center', paddingVertical: 14 },
    backText: { color: colors.tint, fontSize: 13, fontWeight: '700' },
    errorMessage: { color: colors.error, fontSize: 13, lineHeight: 19, marginTop: 12 },
    successMessage: { color: colors.tint, fontSize: 13, lineHeight: 19, marginTop: 12 },
  });
}
