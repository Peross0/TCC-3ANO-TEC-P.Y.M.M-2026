import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
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

import { apiFetch, saveSession } from '../lib/api';
import { colors } from '../lib/theme';
import { useHydratedWidth } from '../lib/useHydratedWidth';

export default function LoginScreen() {
  const params = useLocalSearchParams();
  const width = useHydratedWidth();
  const isWide = width >= 860;
  const [isRegistering, setIsRegistering] = useState(false);
  const [accountType, setAccountType] = useState('RECRUITER');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [formError, setFormError] = useState('');
  const isCandidate = accountType === 'CANDIDATE';

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsRegistering(params.cadastro === '1');
      setAccountType(params.tipo === 'CANDIDATE' ? 'CANDIDATE' : 'RECRUITER');
    });
    return () => cancelAnimationFrame(frame);
  }, [params.cadastro, params.tipo]);

  const clearFields = () => {
    setName('');
    setEmail('');
    setCompanyName('');
    setPhone('');
    setCourse('');
    setPassword('');
    setDocumentNumber('');
    setShowPassword(false);
    setFormError('');
  };

  const isValidCnpj = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false;
    return true;
  };

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const isCandidate = accountType === 'CANDIDATE';
    setFormError('');

    if (isRegistering && !name.trim()) {
      setFormError('Informe o nome completo do responsável.');
      return;
    }
    if (isRegistering && !isCandidate && !companyName.trim()) {
      setFormError('Informe o nome da empresa.');
      return;
    }
    if (isRegistering && !isCandidate && !phone.trim()) {
      setFormError('Informe um telefone para contato.');
      return;
    }
    if (isRegistering && isCandidate && documentNumber.replace(/\D/g, '').length !== 11) {
      setFormError('Informe um CPF com 11 números.');
      return;
    }
    if (isRegistering && !isCandidate && documentNumber.trim() && !isValidCnpj(documentNumber)) {
      setFormError('Informe um CNPJ válido ou deixe o campo em branco.');
      return;
    }
    if (!normalizedEmail) {
      setFormError('Informe seu e-mail.');
      return;
    }
    if (!normalizedEmail.includes('@')) {
      setFormError('Informe um e-mail válido.');
      return;
    }
    if (!password.trim()) {
      setFormError('Informe sua senha.');
      return;
    }
    if (password.trim().length < 8) {
      setFormError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRegistering) {
        const data = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            full_name: name.trim(),
            company_name: isCandidate ? undefined : companyName.trim(),
            email: normalizedEmail,
            password,
            phone: phone.trim() || undefined,
            course: course.trim() || undefined,
            user_type: accountType,
            ...(isCandidate || documentNumber.replace(/\D/g, '')
              ? {
                  document_type: isCandidate ? 'CPF' : 'CNPJ',
                  document_number: documentNumber.replace(/\D/g, ''),
                }
              : {}),
          }),
        });
        await saveSession(data.token, data.user);
        router.replace(isCandidate ? '/candidato' : '/home');
        return;
      }

      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      await saveSession(data.token, data.user);
      router.replace(data.user.user_type === 'CANDIDATE' ? '/candidato' : '/home');
    } catch (error) {
      const message = error instanceof TypeError
        ? 'Não foi possível conectar ao servidor. Inicie o backend na porta 3000.'
        : error.message;
      setFormError(message || (isRegistering ? 'Não foi possível criar sua conta.' : 'Não foi possível entrar.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering((currentMode) => !currentMode);
    clearFields();
  };

  const selectAccountType = (type) => {
    setAccountType(type);
    setFormError('');
    setDocumentNumber('');
    setCourse('');
    setCompanyName('');
    setPhone('');
  };

  const renderField = (label, icon, value, onChangeText, props = {}) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <Feather name={icon} size={17} color={colors.muted} />
        <TextInput
          style={styles.input}
          accessibilityLabel={label}
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
      <StatusBar style="light" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={[styles.shell, isWide && styles.shellWide]}>
            <View style={[styles.intro, isWide && styles.introWide]}>
              <Pressable style={styles.brand} onPress={() => router.replace('/')} accessibilityRole="button" accessibilityLabel="Voltar à página inicial">
                <View style={styles.brandMark}><Feather name="link-2" size={19} color={colors.onPrimary} /></View>
                <Text style={styles.brandName}>Conecta Fácil</Text>
              </Pressable>
              <View style={styles.introCopy}>
                <Text style={styles.eyebrow}>CONECTA FÁCIL</Text>
                <Text style={styles.introTitle}>Uma plataforma. Novas possibilidades.</Text>
                <Text style={styles.introText}>Acesse oportunidades como candidato ou encontre profissionais para sua empresa.</Text>
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
                <Text style={styles.formEyebrow}>{isRegistering ? 'PRIMEIRO ACESSO' : 'CONTA CONECTA FÁCIL'}</Text>
                <Text style={styles.title}>{isRegistering ? 'Crie sua conta' : 'Que bom ter você de volta'}</Text>
                <Text style={styles.subtitle}>
                  {isRegistering ? 'Como você deseja utilizar o Conecta Fácil?' : 'Entre para continuar de onde parou.'}
                </Text>
                {formError ? (
                  <View style={styles.formError} accessibilityRole="alert" accessibilityLiveRegion="polite">
                    <Feather name="alert-circle" size={16} color={colors.danger} />
                    <Text style={styles.formErrorText}>{formError}</Text>
                  </View>
                ) : null}

                {isRegistering && (
                  <View style={styles.accountChoices}>
                    <Pressable
                      style={[styles.accountChoice, accountType === 'CANDIDATE' && styles.accountChoiceActive]}
                      onPress={() => selectAccountType('CANDIDATE')}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: accountType === 'CANDIDATE' }}
                    >
                      <View style={styles.accountChoiceIcon}><Feather name="user" size={18} color={colors.primary} /></View>
                      <Text style={styles.accountChoiceTitle}>Candidato</Text>
                      <Text style={styles.accountChoiceDescription}>Procuro oportunidades de emprego, estágio ou primeiro trabalho.</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.accountChoice, accountType === 'RECRUITER' && styles.accountChoiceActive]}
                      onPress={() => selectAccountType('RECRUITER')}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: accountType === 'RECRUITER' }}
                    >
                      <View style={styles.accountChoiceIcon}><Feather name="briefcase" size={18} color={colors.primary} /></View>
                      <Text style={styles.accountChoiceTitle}>Empresário</Text>
                      <Text style={styles.accountChoiceDescription}>Quero divulgar oportunidades e encontrar profissionais.</Text>
                    </Pressable>
                  </View>
                )}

                {isRegistering && !isCandidate && renderField('Nome da empresa', 'briefcase', companyName, setCompanyName, {
                  placeholder: 'Razão ou nome da empresa', autoCapitalize: 'words',
                })}
                {isRegistering && renderField(isCandidate ? 'Nome completo' : 'Nome do responsável', 'user', name, setName, {
                  placeholder: 'Como podemos chamar você?', autoCapitalize: 'words',
                })}
                {isRegistering && renderField(isCandidate ? 'CPF' : 'CNPJ (opcional)', 'credit-card', documentNumber, setDocumentNumber, {
                  placeholder: isCandidate ? '000.000.000-00' : '00.000.000/0000-00', keyboardType: 'number-pad',
                })}
                {isRegistering && renderField(isCandidate ? 'Telefone (opcional)' : 'Telefone', 'phone', phone, setPhone, {
                  placeholder: '(00) 00000-0000', keyboardType: 'phone-pad',
                })}
                {isRegistering && isCandidate && renderField('Formação principal (opcional)', 'book-open', course, setCourse, {
                  placeholder: 'Curso ou área de formação', autoCapitalize: 'words',
                })}
                {renderField('E-mail', 'mail', email, setEmail, {
                  placeholder: 'voce@empresa.com.br', keyboardType: 'email-address', autoCapitalize: 'none', autoCorrect: false,
                })}
                <View style={styles.fieldGroup}>
                  <View style={styles.labelLine}>
                    <Text style={styles.label}>Senha</Text>
                  </View>
                  <View style={styles.inputRow}>
                    <Feather name="lock" size={17} color={colors.muted} />
                    <TextInput style={styles.input} accessibilityLabel="Senha" placeholder="Mínimo de 8 caracteres" placeholderTextColor={colors.muted} secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
                    <Pressable onPress={() => setShowPassword((visible) => !visible)} hitSlop={10} accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                      <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.muted} />
                    </Pressable>
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [styles.submitButton, pressed && styles.pressedButton, isSubmitting && styles.disabledButton]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  accessibilityRole="button"
                >
                  <Text style={styles.submitText}>
                    {isSubmitting ? 'Aguarde…' : isRegistering ? 'Criar meu acesso' : 'Entrar na conta'}
                  </Text>
                  {!isSubmitting && <Feather name="arrow-right" size={18} color={colors.onPrimary} />}
                </Pressable>
                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>{isRegistering ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}</Text>
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
  brandMark: { width: 38, height: 38, borderRadius: 13, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
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
  accountChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 18 },
  accountChoice: { flex: 1, minWidth: 190, minHeight: 132, padding: 13, borderWidth: 1, borderColor: colors.line, borderRadius: 13, backgroundColor: colors.surface },
  accountChoiceActive: { borderColor: colors.primary, backgroundColor: colors.surfaceSoft },
  accountChoiceIcon: { width: 31, height: 31, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: colors.surfaceSoft, marginBottom: 9 },
  accountChoiceTitle: { color: colors.ink, fontSize: 13, fontWeight: '800', marginBottom: 5 },
  accountChoiceDescription: { color: colors.muted, fontSize: 10, lineHeight: 15 },
  formError: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 11, marginBottom: 13, borderWidth: 1, borderColor: colors.danger, borderRadius: 10, backgroundColor: colors.dangerSurface },
  formErrorText: { flex: 1, color: colors.danger, fontSize: 12, lineHeight: 17 },
  fieldGroup: { marginBottom: 15 },
  labelLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  label: { color: colors.ink, fontSize: 13, fontWeight: '700', marginBottom: 7 },
  inputRow: { minHeight: 50, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: 11, paddingHorizontal: 13, backgroundColor: colors.surface },
  input: { flex: 1, minWidth: 0, height: 48, paddingHorizontal: 10, color: colors.ink, fontSize: 14 },
  submitButton: { minHeight: 50, borderRadius: 11, backgroundColor: colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9, marginTop: 5 },
  pressedButton: { opacity: 0.88 },
  disabledButton: { opacity: 0.58 },
  submitText: { color: colors.onPrimary, fontSize: 14, fontWeight: '800' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginTop: 20 },
  switchText: { color: colors.muted, fontSize: 13 },
  switchLink: { color: colors.primaryDark, fontSize: 13, fontWeight: '800' },
  terms: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 15, paddingHorizontal: 8 },
});
