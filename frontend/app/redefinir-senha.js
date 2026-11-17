import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { apiFetch } from '../lib/api';
import { colors } from '../lib/theme';

export default function RedefinirSenhaScreen() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);

  const requestCode = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Informe um e-mail válido.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail }),
      });
      setEmail(normalizedEmail);
      setCode('');
      setPassword('');
      setConfirmPassword('');
      setCodeSent(true);
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível enviar o código. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!/^\d{6}$/.test(code.trim())) {
      setError('Informe o código de 6 números recebido por e-mail.');
      return;
    }
    if (password.length < 8 || password.length > 128) {
      setError('A senha deve ter entre 8 e 128 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
          password,
          confirm_password: confirmPassword,
        }),
      });
      setCode('');
      setPassword('');
      setConfirmPassword('');
      setCompleted(true);
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível redefinir a senha. Confira o código e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.icon}><Feather name={completed ? 'check' : 'lock'} size={22} color={colors.primaryDark} /></View>
            <Text style={styles.title}>{completed ? 'Senha atualizada' : 'Redefinir senha'}</Text>
            <Text style={styles.subtitle}>
              {completed
                ? 'Sua senha foi alterada. Agora você já pode acessar sua conta.'
                : codeSent
                  ? 'Informe o código enviado ao e-mail cadastrado e escolha uma nova senha.'
                  : 'Informe o e-mail cadastrado para receber um código de verificação.'}
            </Text>

            {!completed ? (
              <>
                <Text style={styles.label}>E-mail cadastrado</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    setCodeSent(false);
                    setCode('');
                    setError('');
                  }}
                  placeholder="seuemail@exemplo.com"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  editable={!isSubmitting}
                />
                {codeSent ? (
                  <>
                    <Text style={styles.notice} accessibilityLiveRegion="polite">
                      Se o e-mail estiver cadastrado, você receberá um código válido por 30 minutos.
                    </Text>
                    <Text style={styles.label}>Código de verificação</Text>
                    <TextInput
                      style={styles.input}
                      value={code}
                      onChangeText={(value) => { setCode(value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                      placeholder="Código com 6 números"
                      placeholderTextColor={colors.muted}
                      keyboardType="number-pad"
                      autoComplete="one-time-code"
                      maxLength={6}
                      returnKeyType="next"
                    />
                    <Text style={styles.label}>Nova senha</Text>
                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={(value) => { setPassword(value); setError(''); }}
                      placeholder="Mínimo de 8 caracteres"
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
                      value={confirmPassword}
                      onChangeText={(value) => { setConfirmPassword(value); setError(''); }}
                      placeholder="Digite novamente"
                      placeholderTextColor={colors.muted}
                      secureTextEntry
                      autoCapitalize="none"
                      autoComplete="new-password"
                      maxLength={128}
                      onSubmitEditing={handleSubmit}
                      returnKeyType="done"
                    />
                  </>
                ) : null}
                {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
                <Pressable
                  style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, isSubmitting && styles.buttonDisabled]}
                  onPress={codeSent ? handleSubmit : requestCode}
                  disabled={isSubmitting}
                  accessibilityRole="button"
                >
                  <Text style={styles.buttonText}>
                    {isSubmitting ? 'Aguarde...' : codeSent ? 'Redefinir senha' : 'Enviar código'}
                  </Text>
                </Pressable>
                {codeSent ? (
                  <Pressable style={styles.resendButton} onPress={requestCode} disabled={isSubmitting} accessibilityRole="button">
                    <Text style={styles.resendText}>Enviar outro código</Text>
                  </Pressable>
                ) : null}
                <Pressable style={styles.backButton} onPress={() => router.replace('/login')} accessibilityRole="button">
                  <Text style={styles.resendText}>Voltar ao login</Text>
                </Pressable>
              </>
            ) : (
              <Pressable style={styles.button} onPress={() => router.replace('/login')} accessibilityRole="button">
                <Text style={styles.buttonText}>Ir para o login</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.paper },
  content: { flexGrow: 1, justifyContent: 'center', padding: 22 },
  card: { width: '100%', maxWidth: 480, alignSelf: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 18, borderWidth: 1, padding: 24 },
  icon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSoft, borderRadius: 14, marginBottom: 17 },
  title: { color: colors.ink, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 20 },
  label: { color: colors.ink, fontSize: 13, fontWeight: '700', marginBottom: 7, marginTop: 12 },
  input: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 10, borderWidth: 1, color: colors.ink, fontSize: 14, minHeight: 48, paddingHorizontal: 13 },
  notice: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 10 },
  error: { color: colors.danger, fontSize: 12, lineHeight: 18, marginTop: 14 },
  button: { minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: 10, marginTop: 20, paddingHorizontal: 16 },
  buttonPressed: { opacity: 0.88 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.onPrimary, fontSize: 14, fontWeight: '700' },
  resendButton: { alignItems: 'center', paddingVertical: 13 },
  backButton: { alignItems: 'center', paddingVertical: 8 },
  resendText: { color: colors.primaryDark, fontSize: 13, fontWeight: '700' },
});
