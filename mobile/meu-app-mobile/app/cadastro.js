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
import { apiFetch } from '../lib/api';

const colors = Colors.light;

export default function RegisterScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  const [curso, setCurso] = useState('');
  const [cpf, setCpf] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleRegister = async () => {
    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();

    if (!nomeLimpo) {
      Alert.alert('Campo obrigatório', 'Por favor, informe seu nome.');
      return;
    }
    if (!emailLimpo || !emailLimpo.includes('@')) {
      Alert.alert('E-mail inválido', 'Informe um e-mail válido.');
      return;
    }
    if (senha.length < 8) {
      Alert.alert('Senha fraca', 'A senha deve conter no mínimo 8 caracteres.');
      return;
    }
    const documento = cpf.replace(/\D/g, '');
    if (documento.length !== 11) {
      Alert.alert('CPF inválido', 'Informe um CPF válido com 11 números.');
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
          user_type: 'CANDIDATE',
          document_type: 'CPF',
          document_number: documento,
        }),
      });

      Alert.alert(
        'Conta criada!',
        data.message || 'Cadastro realizado com sucesso. Agora faça login.',
        [{ text: 'Ir para Login', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Erro na requisição:', error);
      Alert.alert(
        'Erro de Conexão',
        error instanceof TypeError
          ? 'Não foi possível conectar ao servidor. Verifique a rede e se o backend está ativo.'
          : error.message
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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>Informe seus dados para se cadastrar</Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputWrapper}>
              <Feather name="user" size={19} color={colors.muted} />
              <TextInput
                style={styles.input}
                placeholder="Nome completo *"
                placeholderTextColor={colors.muted}
                value={nome}
                onChangeText={setNome}
              />
            </View>

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

            <View style={styles.inputWrapper}>
              <Feather name="phone" size={19} color={colors.muted} />
              <TextInput
                style={styles.input}
                placeholder="Telefone (opcional)"
                placeholderTextColor={colors.muted}
                value={telefone}
                onChangeText={setTelefone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Feather name="credit-card" size={19} color={colors.muted} />
              <TextInput
                style={styles.input}
                placeholder="CPF *"
                placeholderTextColor={colors.muted}
                value={cpf}
                onChangeText={setCpf}
                keyboardType="number-pad"
                maxLength={14}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Feather name="book" size={19} color={colors.muted} />
              <TextInput
                style={styles.input}
                placeholder="Curso (opcional)"
                placeholderTextColor={colors.muted}
                value={curso}
                onChangeText={setCurso}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.disabledButton]}
              onPress={handleRegister}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Cadastrando...' : 'Finalizar Cadastro'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  keyboardAvoidingView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 20 },
  headerGroup: { marginBottom: 24 },
  backButton: { width: 40, height: 40, justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 16, color: colors.muted, marginTop: 4 },
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
    marginBottom: 13,
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
    marginTop: 12,
  },
  disabledButton: { opacity: 0.6 },
  submitButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});