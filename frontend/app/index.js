import React, { useState } from 'react';
import {
  Alert,
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
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export default function LoginScreen() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const clearFields = () => {
    setName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
  };

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (isRegistering && !name.trim()) {
      Alert.alert('Nome obrigatório', 'Digite seu nome completo para continuar.');
      return;
    }
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      Alert.alert('E-mail inválido', 'Digite um e-mail válido para continuar.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Senha inválida', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = isRegistering ? 'cadastro' : 'login';
      const body = isRegistering
        ? { nome: name.trim(), email: normalizedEmail, senha: password, tipo_usuario: 'empresa' }
        : { email: normalizedEmail, senha: password };
      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();

        if (!response.ok || !data.sucesso) {
        throw new Error(data.mensagem || 'Não foi possível concluir a operação.');
      }

      if (isRegistering) {
        Alert.alert('Cadastro realizado', 'Sua conta foi criada com sucesso!', [
          { text: 'Entrar', onPress: () => { setIsRegistering(false); setName(''); } },
        ]);
        setPassword('');
        return;
      }

      if (data.usuario.tipo_usuario !== 'empresa') {
        throw new Error('Esta conta é de candidato. Use o aplicativo mobile para entrar.');
      }

      router.replace({
        pathname: '/home',
        params: { nome: data.usuario.nome, email: data.usuario.email },
      });
    } catch (error) {
      const message = error instanceof TypeError
        ? 'Não foi possível conectar ao servidor. Inicie o backend na porta 3000.'
        : error.message;
      Alert.alert('Não foi possível entrar', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering((currentMode) => !currentMode);
    clearFields();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.backgroundShapeTop} />
      <View style={styles.backgroundShapeBottom} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.brandBlock}>
            <View style={styles.brandMark}><Feather name="link-2" size={25} color="#FFFFFF" /></View>
            <Text style={styles.brandName}>Conecta Fácil</Text>
            <Text style={styles.brandCaption}>Área exclusiva para empresas</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>{isRegistering ? 'Crie sua conta' : 'Bem-vindo de volta'}</Text>
            <Text style={styles.subtitle}>
              {isRegistering ? 'Crie o acesso da sua empresa para encontrar novos talentos.' : 'Entre para gerenciar sua empresa e suas oportunidades.'}
            </Text>

            {isRegistering && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nome do responsável</Text>
                <View style={styles.inputRow}>
                  <Feather name="user" size={19} color="#718096" />
                  <TextInput style={styles.input} placeholder="Nome do responsável" placeholderTextColor="#A0AEC0" value={name} onChangeText={setName} autoCapitalize="words" />
                </View>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-mail</Text>
              <View style={styles.inputRow}>
                <Feather name="mail" size={19} color="#718096" />
                <TextInput style={styles.input} placeholder="voce@exemplo.com" placeholderTextColor="#A0AEC0" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelLine}>
                <Text style={styles.label}>Senha</Text>
                {!isRegistering && <Pressable onPress={() => Alert.alert('Recuperar senha', 'Em breve você poderá redefinir sua senha por e-mail.')}><Text style={styles.forgotPassword}>Esqueci minha senha</Text></Pressable>}
              </View>
              <View style={styles.inputRow}>
                <Feather name="lock" size={19} color="#718096" />
                <TextInput style={styles.input} placeholder="Digite sua senha" placeholderTextColor="#A0AEC0" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
                <Pressable onPress={() => setShowPassword((visible) => !visible)} hitSlop={10} accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={19} color="#718096" />
                </Pressable>
              </View>
            </View>

            <Pressable style={({ pressed }) => [styles.submitButton, pressed && styles.pressedButton, isSubmitting && styles.disabledButton]} onPress={handleSubmit} disabled={isSubmitting} accessibilityRole="button">
              <Text style={styles.submitText}>{isSubmitting ? 'Aguarde...' : (isRegistering ? 'Criar minha conta' : 'Entrar')}</Text>
              {!isSubmitting && <Feather name="arrow-right" size={19} color="#FFFFFF" />}
            </Pressable>

            <View style={styles.dividerRow}><View style={styles.divider} /><Text style={styles.dividerText}>ou</Text><View style={styles.divider} /></View>

            <Pressable onPress={toggleMode} style={styles.switchButton} accessibilityRole="button">
              <Text style={styles.switchText}>{isRegistering ? 'Já possui uma conta? ' : 'Ainda não possui uma conta? '}</Text>
              <Text style={styles.switchLink}>{isRegistering ? 'Entrar' : 'Cadastre-se'}</Text>
            </Pressable>
          </View>

          <Text style={styles.terms}>Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: '#102A43' },
  backgroundShapeTop: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: '#1E4E79', top: -105, right: -80, opacity: 0.8 },
  backgroundShapeBottom: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: '#0B1F33', bottom: -95, left: -75, opacity: 0.9 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 34 },
  brandBlock: { alignItems: 'center', marginBottom: 24 },
  brandMark: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#2F80ED', justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: '#000000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  brandName: { color: '#FFFFFF', fontSize: 27, fontWeight: '800' },
  brandCaption: { color: '#B8D4ED', fontSize: 14, marginTop: 5 },
  card: { width: '100%', maxWidth: 470, alignSelf: 'center', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 26, shadowColor: '#000000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.22, shadowRadius: 22, elevation: 10 },
  title: { color: '#102A43', fontSize: 27, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: '#627D98', fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  fieldGroup: { marginBottom: 17 },
  labelLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  label: { color: '#243B53', fontSize: 13, fontWeight: '700', marginBottom: 7 },
  forgotPassword: { color: '#2F80ED', fontSize: 12, fontWeight: '700' },
  inputRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D9E2EC', borderRadius: 13, paddingHorizontal: 15, backgroundColor: '#F8FAFC' },
  input: { flex: 1, height: 52, paddingHorizontal: 11, color: '#102A43', fontSize: 15 },
  submitButton: { height: 54, borderRadius: 13, backgroundColor: '#2F80ED', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 4, shadowColor: '#2F80ED', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 10, elevation: 4 },
  pressedButton: { opacity: 0.84, transform: [{ scale: 0.99 }] },
  disabledButton: { opacity: 0.6 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 22 },
  divider: { flex: 1, height: 1, backgroundColor: '#E6EDF3' },
  dividerText: { color: '#9FB3C8', fontSize: 12 },
  switchButton: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 4 },
  switchText: { color: '#627D98', fontSize: 13 },
  switchLink: { color: '#2F80ED', fontSize: 13, fontWeight: '800' },
  terms: { maxWidth: 390, alignSelf: 'center', color: '#9FB3C8', fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 20 },
});
