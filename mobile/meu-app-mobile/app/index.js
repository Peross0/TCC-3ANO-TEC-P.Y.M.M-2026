import React, { useState } from 'react';
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
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/theme';

const colors = Colors.light;

// Substitua pelo mesmo IP utilizado no cadastro.js
const API_URL = 'http://192.168.101.144:3000/api';export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    const emailLimpo = email.trim().toLowerCase();

    if (!emailLimpo || !emailLimpo.includes('@')) {
      Alert.alert('E-mail inválido', 'Informe um e-mail válido.');
      return;
    }
    if (!senha) {
      Alert.alert('Campo obrigatório', 'Por favor, informe sua senha.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Faz o POST correto para http://SEU_IP:3000/api/login
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailLimpo,
          senha: senha,
        }),
      });

      const data = await response.json();

      if (response.ok && data.sucesso) {
        Alert.alert('Sucesso', 'Login realizado com sucesso!');
        // router.push('/home'); // Altere para a sua rota principal após o login
      } else {
        Alert.alert('Erro no login', data.mensagem || 'E-mail ou senha incorretos.');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      Alert.alert(
        'Erro de Conexão',
        'Verifique se o servidor backend está rodando e acessível no endereço da API.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerGroup}>
            <Text style={styles.title}>Conecta Fácil</Text>
            <Text style={styles.subtitle}>Faça login para acessar sua conta</Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputWrapper}>
              <Feather name="mail" size={19} color={colors.muted} />
              <TextInput
                style={styles.input}
                placeholder="E-mail *"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Feather name="lock" size={19} color={colors.muted} />
              <TextInput
                style={styles.input}
                placeholder="Senha *"
                placeholderTextColor={colors.muted}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={10}>
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={19} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </Text>
            </TouchableOpacity>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Ainda não tem uma conta? </Text>
              <TouchableOpacity onPress={() => router.push('/cadastro')}>
                <Text style={styles.registerLink}>Cadastre-se</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  keyboardAvoidingView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 },
  headerGroup: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 16, color: colors.muted, marginTop: 6 },
  formSection: { width: '100%' },
  inputWrapper: {
    width: '100%',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  input: { flex: 1, height: 54, paddingHorizontal: 12, fontSize: 16, color: colors.text },
  submitButton: {
    width: '100%',
    height: 54,
    backgroundColor: colors.primaryDark,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: { opacity: 0.6 },
  submitButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: { fontSize: 15, color: colors.muted },
  registerLink: { fontSize: 15, fontWeight: '700', color: colors.primaryDark },
});