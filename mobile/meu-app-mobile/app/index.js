import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
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

const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      Alert.alert('E-mail inválido', 'Informe um e-mail válido para continuar.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Senha inválida', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, senha: password }),
      });
      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        throw new Error(data.mensagem || 'Não foi possível entrar.');
      }
      if (data.usuario.tipo_usuario !== 'estudante') {
        throw new Error('Esta conta é de empresa. Use a versão web para entrar.');
      }

      router.replace({ pathname: '/(tabs)/home', params: { role: 'candidato', nome: data.usuario.nome, email: data.usuario.email } });
    } catch (error) {
      const message = error instanceof TypeError
        ? 'Não foi possível conectar ao servidor. Inicie o backend na porta 3000.'
        : error.message;
      Alert.alert('Não foi possível entrar', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FAFC" />
      <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.topSection}>
            <Image source={require('./assets/logo.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="Logo Conecta Fácil" />
            <Text style={styles.eyebrow}>CONECTA FÁCIL</Text>
            <Text style={styles.mainTitle}>Encontre seu estágio ideal</Text>
          </View>

          <View style={styles.formSection}>
            <View style={styles.headerTextGroup}>
              <Text style={styles.welcomeTitle}>Seja bem-vindo</Text>
              <Text style={styles.welcomeSubtitle}>Entre na sua conta de candidato</Text>
            </View>

            <View style={styles.inputWrapper}>
              <Feather name="mail" size={19} color="#718096" />
              <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor="#A0AEC0" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} accessibilityLabel="E-mail" />
            </View>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={19} color="#718096" />
              <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#A0AEC0" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} accessibilityLabel="Senha" />
              <TouchableOpacity onPress={() => setShowPassword((visible) => !visible)} accessibilityRole="button" accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'} hitSlop={10}>
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={19} color="#718096" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPasswordButton} onPress={() => Alert.alert('Recuperar senha', 'Em breve você poderá redefinir sua senha por e-mail.')} accessibilityRole="button">
              <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.submitButton, isSubmitting && styles.disabledButton]} activeOpacity={0.85} onPress={handleLogin} disabled={isSubmitting} accessibilityRole="button">
              <Text style={styles.submitButtonText}>{isSubmitting ? 'Aguarde...' : 'Entrar'}</Text>
            </TouchableOpacity>
            <View style={styles.registerGroup}>
              <Text style={styles.registerText}>Não tem conta? </Text>
              <TouchableOpacity onPress={() => Alert.alert('Criar conta', 'O cadastro estará disponível em breve.')} accessibilityRole="button">
                <Text style={styles.registerLink}>Criar conta</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerSection}>
            <Text style={styles.footerText}>
              Ao entrar ou criar uma conta você concorda com os{' '}
              <Text style={styles.footerLink} onPress={() => setModalVisible(true)}>Termos de Uso</Text>{' '}e{' '}
              <Text style={styles.footerLink} onPress={() => setModalVisible(true)}>Política de Privacidade</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal animationType="slide" transparent={false} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.fullScreenModal}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton} accessibilityRole="button" accessibilityLabel="Voltar">
              <Feather name="arrow-left" size={24} color="#1A202C" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.blankModalContent}>
            <Text style={styles.modalTitle}>Termos e privacidade</Text>
            <Text style={styles.modalText}>As informações desta seção serão disponibilizadas em breve.</Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: { flex: 1 },
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 18, paddingBottom: 20, justifyContent: 'space-between' },
  topSection: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 76, height: 76, marginBottom: 2 },
  eyebrow: { color: '#2F80ED', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 7 },
  mainTitle: { fontSize: 18, fontWeight: '600', color: '#4A5568', textAlign: 'center', marginBottom: 22 },
  formSection: { width: '100%', marginBottom: 18 },
  headerTextGroup: { marginBottom: 22 },
  welcomeTitle: { fontSize: 28, fontWeight: '800', color: '#1A202C' },
  welcomeSubtitle: { fontSize: 16, color: '#718096', marginTop: 4 },
  inputWrapper: { width: '100%', minHeight: 56, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#DCE5EE', borderRadius: 14, paddingHorizontal: 16, marginBottom: 13, backgroundColor: '#FFFFFF' },
  input: { flex: 1, height: 54, paddingHorizontal: 12, fontSize: 16, color: '#1A202C' },
  forgotPasswordButton: { alignSelf: 'flex-end', marginTop: 2, marginBottom: 24 },
  forgotPasswordText: { color: '#2F80ED', fontSize: 15, fontWeight: '500' },
  submitButton: { width: '100%', height: 54, backgroundColor: '#2F80ED', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  disabledButton: { opacity: 0.6 },
  submitButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  registerGroup: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  registerText: { color: '#718096', fontSize: 15 },
  registerLink: { color: '#2F80ED', fontSize: 15, fontWeight: '600' },
  footerSection: { paddingHorizontal: 12 },
  footerText: { fontSize: 11, color: '#8A98A8', textAlign: 'center', lineHeight: 16 },
  footerLink: { color: '#2F80ED' },
  fullScreenModal: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: { paddingHorizontal: 20, paddingVertical: 16 },
  closeButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  blankModalContent: { paddingHorizontal: 24, paddingBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#1A202C', marginBottom: 12 },
  modalText: { fontSize: 16, lineHeight: 24, color: '#4A5568' },
});
