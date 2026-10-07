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
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { apiFetch, saveSession } from '../lib/api';
import { colors } from '../lib/theme';

export default function LoginScreen() {
  const params = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isWide = width >= 860;
  const [isRegistering, setIsRegistering] = useState(params.cadastro === '1');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationPending, setVerificationPending] = useState(false);

  const clearFields = () => {
    setName('');
    setEmail('');
    setPassword('');
    setDocumentNumber('');
    setVerificationCode('');
    setVerificationPending(false);
    setShowPassword(false);
  };

  const isValidCnpj = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false;
    return true;
  };

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (isRegistering && !name.trim()) {
      Alert.alert('Nome obrigatório', 'Digite seu nome completo para continuar.');
      return;
    }
    if (isRegistering && !isValidCnpj(documentNumber)) {
      Alert.alert('CNPJ inválido', 'Digite um CNPJ válido com 14 números.');
      return;
    }
    if (!normalizedEmail) {
      Alert.alert('E-mail obrigatório', 'Digite seu e-mail para continuar.');
      return;
    }
    if (!normalizedEmail.includes('@')) {
      Alert.alert('E-mail inválido', 'Digite um e-mail válido para continuar.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Senha obrigatória', 'Digite sua senha para continuar.');
      return;
    }
    if (password.trim().length < 8) {
      Alert.alert('Senha inválida', 'A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRegistering) {
        const data = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            full_name: name.trim(),
            email: normalizedEmail,
            password,
            user_type: 'RECRUITER',
            document_type: 'CNPJ',
            document_number: documentNumber.replace(/\D/g, ''),
          }),
        });

        Alert.alert('Cadastro realizado', data.message || 'Seu cadastro foi concluído com sucesso.');
        setVerificationPending(false);
        setIsRegistering(false);
        setName('');
        setPassword('');
        setDocumentNumber('');
        setEmail(normalizedEmail);
        return;
      }

      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      if (data.user.user_type !== 'RECRUITER') throw new Error('Esta conta não possui acesso de recrutador.');
      await saveSession(data.token, data.user);
      router.replace({ pathname: '/home', params: { nome: data.user.full_name, email: data.user.email } });
    } catch (error) {
      const message = error instanceof TypeError
        ? 'Não foi possível conectar ao servidor. Inicie o backend na porta 3000.'
        : error.message;
      Alert.alert(isRegistering ? 'Não foi possível cadastrar' : 'Não foi possível entrar', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (verificationCode.trim().length !== 6) {
      Alert.alert('Código inválido', 'Digite o código de 6 números recebido por e-mail.');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiFetch('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: verificationCode.trim() }),
      });
      Alert.alert('E-mail verificado', 'Agora você já pode entrar na sua conta.');
      setVerificationPending(false);
      setIsRegistering(false);
      setPassword('');
      setVerificationCode('');
    } catch (error) {
      Alert.alert('Não foi possível verificar', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering((currentMode) => !currentMode);
    clearFields();
  };

  const renderField = (label, icon, value, onChangeText, props = {}) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <Feather name={icon} size={17} color={colors.muted} />
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.muted}
          value={value}
          onChangeText={onChangeText}
          {...props}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={[styles.shell, isWide && styles.shellWide]}>
            <View style={[styles.intro, isWide && styles.introWide]}>
              <Pressable style={styles.brand} onPress={() => router.replace('/')} accessibilityRole="button" accessibilityLabel="Voltar à página inicial">
                <View style={styles.brandMark}><Feather name="link-2" size={19} color={colors.surface} /></View>
                <Text style={styles.brandName}>Conecta Fácil</Text>
              </Pressable>
              <View style={styles.introCopy}>
                <Text style={styles.eyebrow}>ACESSO PARA EMPRESAS</Text>
                <Text style={styles.introTitle}>Boas conexões começam com uma boa oportunidade.</Text>
                <Text style={styles.introText}>Entre na sua conta para cuidar do perfil da empresa e das vagas publicadas.</Text>
              </View>
              <View style={styles.securityNote}>
                <Feather name="shield" size={17} color={colors.primaryDark} />
                <Text style={styles.securityText}>Acesso protegido para sua equipe.</Text>
              </View>
            </View>

            <View style={styles.formColumn}>
              <Pressable style={styles.backLink} onPress={() => router.replace('/')} accessibilityRole="button">
                <Feather name="arrow-left" size={16} color={colors.primaryDark} />
                <Text style={styles.backLinkText}>Voltar ao início</Text>
              </Pressable>
              <View style={styles.formCard}>
                <Text style={styles.formEyebrow}>{isRegistering ? 'PRIMEIRO ACESSO' : 'SUA CONTA'}</Text>
                <Text style={styles.title}>{isRegistering ? 'Crie seu acesso' : 'Que bom ter você de volta'}</Text>
                <Text style={styles.subtitle}>
                  {isRegistering ? 'Informe os dados da pessoa responsável e da empresa.' : 'Entre para acompanhar e administrar suas oportunidades.'}
                </Text>

                {isRegistering && renderField('Nome do responsável', 'user', name, setName, {
                  placeholder: 'Como podemos chamar você?', autoCapitalize: 'words',
                })}
                {isRegistering && renderField('CNPJ da empresa', 'briefcase', documentNumber, setDocumentNumber, {
                  placeholder: '00.000.000/0000-00', keyboardType: 'number-pad',
                })}
                {verificationPending && renderField('Código de verificação', 'check-circle', verificationCode, setVerificationCode, {
                  placeholder: 'Código com 6 números', keyboardType: 'number-pad', maxLength: 6,
                })}
                {renderField('E-mail', 'mail', email, setEmail, {
                  placeholder: 'voce@empresa.com.br', keyboardType: 'email-address', autoCapitalize: 'none', autoCorrect: false,
                })}

                <View style={styles.fieldGroup}>
                  <View style={styles.labelLine}>
                    <Text style={styles.label}>Senha</Text>
                    {!isRegistering && <Pressable onPress={() => Alert.alert('Recuperar senha', 'A recuperação de senha ainda não está disponível. Entre em contato com o suporte da plataforma.')}><Text style={styles.forgotPassword}>Esqueci minha senha</Text></Pressable>}
                  </View>
                  <View style={styles.inputRow}>
                    <Feather name="lock" size={17} color={colors.muted} />
                    <TextInput style={styles.input} placeholder="Mínimo de 8 caracteres" placeholderTextColor={colors.muted} secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
                    <Pressable onPress={() => setShowPassword((visible) => !visible)} hitSlop={10} accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                      <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.muted} />
                    </Pressable>
                  </View>
                </View>

                <Pressable style={({ pressed }) => [styles.submitButton, pressed && styles.pressedButton, isSubmitting && styles.disabledButton]} onPress={verificationPending ? handleVerifyEmail : handleSubmit} disabled={isSubmitting} accessibilityRole="button">
                  <Text style={styles.submitText}>{isSubmitting ? 'Aguarde…' : verificationPending ? 'Verificar e-mail' : isRegistering ? 'Criar meu acesso' : 'Entrar na conta'}</Text>
                  {!isSubmitting && <Feather name="arrow-right" size={18} color={colors.surface} />}
                </Pressable>

                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>{isRegistering ? 'Já tem acesso?' : 'Sua empresa ainda não tem acesso?'}</Text>
                  <Pressable onPress={toggleMode} accessibilityRole="button">
                    <Text style={styles.switchLink}>{isRegistering ? 'Entrar' : 'Criar conta'}</Text>
                  </Pressable>
                </View>
              </View>
              <Text style={styles.terms}>Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade da plataforma.</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.paper },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 24 },
  shell: { width: '100%', maxWidth: 540, alignSelf: 'center' },
  shellWide: { maxWidth: 1120, flexDirection: 'row', alignItems: 'stretch', minHeight: 660, backgroundColor: colors.surface, borderRadius: 28, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  intro: { padding: 22, paddingBottom: 8 },
  introWide: { flex: 0.88, justifyContent: 'space-between', padding: 42, backgroundColor: colors.surfaceSoft },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start' },
  brandMark: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  brandName: { color: colors.ink, fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  introCopy: { marginTop: 34, maxWidth: 450 },
  eyebrow: { color: colors.primaryDark, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 13 },
  introTitle: { color: colors.ink, fontSize: 31, lineHeight: 39, fontWeight: '700', letterSpacing: -0.8 },
  introText: { color: colors.inkSoft, fontSize: 15, lineHeight: 23, marginTop: 13, maxWidth: 420 },
  securityNote: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 24 },
  securityText: { color: colors.inkSoft, fontSize: 13, fontWeight: '600' },
  formColumn: { flex: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 18 },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', paddingVertical: 8, marginBottom: 12 },
  backLinkText: { color: colors.primaryDark, fontSize: 13, fontWeight: '700' },
  formCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 22, borderWidth: 1, borderColor: colors.line },
  formEyebrow: { color: colors.primaryDark, fontSize: 10, fontWeight: '800', letterSpacing: 1.4, marginBottom: 9 },
  title: { color: colors.ink, fontSize: 27, lineHeight: 34, fontWeight: '700', letterSpacing: -0.6 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 7, marginBottom: 21 },
  fieldGroup: { marginBottom: 15 },
  labelLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  label: { color: colors.ink, fontSize: 13, fontWeight: '700', marginBottom: 7 },
  forgotPassword: { color: colors.primaryDark, fontSize: 12, fontWeight: '700', marginBottom: 7 },
  inputRow: { minHeight: 50, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: 11, paddingHorizontal: 13, backgroundColor: colors.surface },
  input: { flex: 1, minWidth: 0, height: 48, paddingHorizontal: 10, color: colors.ink, fontSize: 14, outlineStyle: 'none' },
  submitButton: { minHeight: 50, borderRadius: 11, backgroundColor: colors.primaryDark, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9, marginTop: 5 },
  pressedButton: { opacity: 0.88 },
  disabledButton: { opacity: 0.58 },
  submitText: { color: colors.surface, fontSize: 14, fontWeight: '800' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginTop: 20 },
  switchText: { color: colors.muted, fontSize: 13 },
  switchLink: { color: colors.primaryDark, fontSize: 13, fontWeight: '800' },
  terms: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 15, paddingHorizontal: 8 },
});
