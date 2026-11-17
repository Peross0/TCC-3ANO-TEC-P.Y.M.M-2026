import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
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
import { apiFetch, saveToken } from '../lib/api';

export default function RedefinirSenhaScreen() {
  const router = useRouter();
  const { colors } = useAppPreferences();
  const styles = makeStyles(colors);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (isSuccess) {
      router.back();
      return;
    }
    if (password.length < 8 || password.length > 128) {
      setErrorMessage('A nova senha deve ter entre 8 e 128 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Confira os campos de nova senha e confirmação.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const result = await apiFetch('/auth/change-password-with-session', {
        method: 'POST',
        body: JSON.stringify({
          new_password: password,
          confirm_password: confirmPassword,
        }),
      });
      if (!result.token) {
        throw new Error('O servidor não retornou uma nova sessão. Entre novamente para continuar.');
      }
      await saveToken(result.token);
      setPassword('');
      setConfirmPassword('');
      setSuccessMessage(result.message || 'Sua senha foi alterada com sucesso.');
      setIsSuccess(true);
      if (Platform.OS !== 'web') {
        Alert.alert('Senha alterada', result.message || 'Sua senha foi alterada com sucesso.');
      }
    } catch (error) {
      setErrorMessage(error.message || 'Não foi possível alterar a senha. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.icon}><Feather name="lock" size={24} color={colors.tint} /></View>
            <Text style={styles.title}>Alterar senha</Text>
            <Text style={styles.subtitle}>
              Defina uma nova senha para sua conta.
            </Text>

            <Text style={styles.label}>Nova senha</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
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
              <Text style={styles.errorMessage} accessibilityRole="alert">
                {errorMessage}
              </Text>
            )}
            {!!successMessage && (
              <Text style={styles.successMessage} accessibilityLiveRegion="polite">
                {successMessage}
              </Text>
            )}
            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.disabledButton]}
              onPress={isSuccess ? () => router.back() : handleSubmit}
              disabled={isSubmitting}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Salvando...' : isSuccess ? 'Concluir' : 'Alterar senha'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityRole="button">
              <Text style={styles.backText}>Voltar</Text>
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
    buttonText: { color: colors.surface, fontSize: 14, fontWeight: '700' },
    backButton: { alignItems: 'center', paddingVertical: 14 },
    backText: { color: colors.tint, fontSize: 13, fontWeight: '700' },
    errorMessage: { color: colors.danger || '#B42318', fontSize: 13, lineHeight: 19, marginTop: 12 },
    successMessage: { color: colors.success || '#16803C', fontSize: 13, lineHeight: 19, marginTop: 12 },
  });
}
