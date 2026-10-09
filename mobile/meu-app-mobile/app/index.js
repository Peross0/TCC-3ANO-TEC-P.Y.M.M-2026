import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
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
import {
  apiFetch,
  clearToken,
  getToken,
  hasSeenOnboarding,
  markOnboardingSeen,
  saveToken,
} from '../lib/api';

const BRAND = {
  blue: '#38B6F5',
  black: '#111111',
  gray: '#777777',
  line: '#E7E9EC',
  background: '#F6F8FA',
  white: '#FFFFFF',
};
const MIN_SPLASH_DURATION_MS = 1700;
const wait = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

const onboardingSlides = [
  {
    icon: 'briefcase',
    title: 'Conecte-se ao seu futuro!',
    subtitle: 'Sem complicação e sem exigência de experiência anterior: crie seu perfil e acesse vagas de estágio e primeiro emprego em poucos cliques.',
  },
  {
    icon: 'map-pin',
    title: 'Oportunidades sob medida',
    subtitle: 'Encontre vagas de estágio e emprego na sua região ou remotas, alinhadas ao seu perfil e curso.',
  },
  {
    icon: 'award',
    title: 'Pronto para dar o próximo passo?',
    subtitle: 'Seu próximo estágio ou primeiro emprego pode começar agora.',
  },
];

function SplashScreen() {
  return (
    <View style={styles.splash}>
      <StatusBar barStyle="light-content" backgroundColor="#1D1C24" />
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.splashLogo}
        resizeMode="contain"
        accessibilityLabel="ConectaFácil Internships"
      />
      <View style={styles.splashIndicator} />
    </View>
  );
}

function OnboardingScreen({ onFinish }) {
  const [step, setStep] = useState(0);
  const slide = onboardingSlides[step];
  const lastStep = step === onboardingSlides.length - 1;

  return (
    <SafeAreaView style={styles.onboardingScreen}>
      <StatusBar barStyle="dark-content" backgroundColor={BRAND.background} />
      <View style={styles.onboardingTop}>
        <View style={styles.brandLine}>
          <View style={styles.brandIcon}><Feather name="link" size={18} color={BRAND.white} /></View>
          <Text style={styles.brandName}>Conecta<Text style={styles.brandAccent}>Fácil</Text></Text>
        </View>
        {step === 0 ? (
          <TouchableOpacity onPress={onFinish} accessibilityRole="button">
            <Text style={styles.skipText}>Pular</Text>
          </TouchableOpacity>
        ) : <View style={styles.skipSpacer} />}
      </View>

      <View style={styles.illustration}>
        <View style={styles.illustrationCircle}>
          <View style={styles.illustrationIcon}>
            <Feather name={slide.icon} size={68} color={BRAND.blue} />
          </View>
          <View style={[styles.illustrationBadge, styles.badgeLeft]}>
            <Feather name={step === 1 ? 'map' : 'user'} size={22} color={BRAND.white} />
          </View>
          <View style={[styles.illustrationBadge, styles.badgeRight]}>
            <Feather name={step === 2 ? 'check' : 'briefcase'} size={20} color={BRAND.white} />
          </View>
        </View>
        {step === 1 && (
          <View style={styles.mapPins}>
            <View style={[styles.mapPin, styles.mapPinOne]} />
            <View style={[styles.mapPin, styles.mapPinTwo]} />
            <View style={[styles.mapPin, styles.mapPinThree]} />
          </View>
        )}
      </View>

      <View style={styles.onboardingCopy}>
        <View style={styles.dots}>
          {onboardingSlides.map((item, index) => (
            <View key={item.title} style={[styles.dot, index === step && styles.activeDot]} />
          ))}
        </View>
        <Text style={styles.onboardingTitle}>{slide.title}</Text>
        <Text style={styles.onboardingSubtitle}>{slide.subtitle}</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={lastStep ? onFinish : () => setStep((current) => current + 1)}
          accessibilityRole="button"
        >
          <Text style={styles.primaryButtonText}>{lastStep ? 'Ir para o Login' : 'Avançar'}</Text>
          {!lastStep && <Feather name="arrow-right" size={18} color={BRAND.white} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function LoginScreen({ startupMessage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginNotice, setLoginNotice] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoginError('');
    setLoginNotice('');
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes('@')) {
      setLoginError('Informe um e-mail válido.');
      return;
    }
    if (!password) {
      setLoginError('Informe sua senha.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail, password }),
        token: null,
      });
      await saveToken(data.token);
      router.replace('/carregando');
    } catch (error) {
      if (error.status === 401) {
        setLoginError('E-mail ou senha incorretos. Confira os dados e tente novamente.');
      } else if (error instanceof TypeError) {
        setLoginError('Não foi possível conectar ao servidor. Verifique se o backend está ativo e acessível na rede.');
      } else {
        setLoginError(error.message || 'Não foi possível entrar. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.loginScreen}>
      <StatusBar barStyle="dark-content" backgroundColor={BRAND.background} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.loginContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.loginBrand}>
            <View style={styles.brandIcon}><Feather name="link" size={20} color={BRAND.white} /></View>
            <Text style={styles.brandName}>Conecta<Text style={styles.brandAccent}>Fácil</Text></Text>
          </View>
          <Text style={styles.welcome}>Que bom ter você aqui!</Text>
          <Text style={styles.loginSubtitle}>Entre para encontrar sua próxima oportunidade.</Text>

          {!!startupMessage && <Text style={styles.startupMessage}>{startupMessage}</Text>}

          <View style={styles.formCard}>
            <Text style={styles.fieldLabel}>E-mail</Text>
            <View style={styles.inputWrapper}>
              <Feather name="mail" size={19} color={BRAND.gray} />
              <TextInput
                style={styles.input}
                placeholder="seuemail@exemplo.com"
                placeholderTextColor="#A0A4A8"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setLoginError('');
                  setLoginNotice('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
              />
            </View>

            <Text style={styles.fieldLabel}>Senha</Text>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={19} color={BRAND.gray} />
              <TextInput
                style={styles.input}
                placeholder="Digite sua senha"
                placeholderTextColor="#A0A4A8"
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setLoginError('');
                  setLoginNotice('');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((visible) => !visible)}
                hitSlop={10}
                accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={19} color={BRAND.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.forgotPasswordRow}>
              <TouchableOpacity
                onPress={() => {
                  setLoginError('');
                  setLoginNotice('A recuperação de senha será disponibilizada em breve.');
                }}
                accessibilityRole="button"
              >
                <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
              </TouchableOpacity>
            </View>

            {!!loginNotice && (
              <Text style={styles.loginNoticeText} accessibilityLiveRegion="polite">
                {loginNotice}
              </Text>
            )}

            {!!loginError && (
              <View style={styles.loginErrorBox} accessibilityRole="alert" accessibilityLiveRegion="polite">
                <Feather name="alert-circle" size={17} color="#B42318" />
                <Text style={styles.loginErrorText}>{loginError}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, styles.loginPrimaryButton, isSubmitting && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isSubmitting}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>{isSubmitting ? 'Entrando...' : 'Entrar'}</Text>
              {!isSubmitting && <Feather name="arrow-right" size={18} color={BRAND.white} />}
            </TouchableOpacity>

            <View style={styles.registerLine}>
              <Text style={styles.registerText}>Ainda não tem uma conta? </Text>
              <TouchableOpacity onPress={() => router.push('/cadastro')}>
                <Text style={styles.registerLink}>Cadastre-se</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.secureNote}>
            <Feather name="shield" size={14} color={BRAND.gray} />
            <Text style={styles.secureNoteText}>Seus dados estão protegidos</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function EntryScreen() {
  const [screen, setScreen] = useState('splash');
  const [startupMessage, setStartupMessage] = useState('');
  const router = useRouter();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    const initialize = async () => {
      const startedAt = Date.now();
      const waitForSplash = () => wait(Math.max(0, MIN_SPLASH_DURATION_MS - (Date.now() - startedAt)));
      const showFirstRunPreview = Platform.OS === 'web'
        && typeof globalThis.location !== 'undefined'
        && new URLSearchParams(globalThis.location.search).get('firstRun') === '1';
      let loadExistingSession = false;

      try {
        const [token, onboardingSeen] = await Promise.all([
          getToken(),
          showFirstRunPreview ? Promise.resolve(false) : hasSeenOnboarding(),
        ]);
        if (token && !showFirstRunPreview) {
          try {
            await apiFetch('/auth/me', { token, timeoutMs: 2200 });
            loadExistingSession = true;
          } catch (error) {
            if (error.status === 401 || error.status === 403) {
              await clearToken();
            } else {
              setStartupMessage('Não foi possível validar sua sessão. Entre novamente com sua conta.');
            }
          }
        }
        await waitForSplash();
        if (loadExistingSession) {
          router.replace('/carregando');
          return;
        }
        setScreen(onboardingSeen ? 'login' : 'onboarding');
      } catch (error) {
        setStartupMessage(error.message);
        await waitForSplash();
        setScreen('login');
      }
    };

    initialize();
  }, [router]);

  const finishOnboarding = async () => {
    try {
      await markOnboardingSeen();
      setScreen('login');
    } catch (error) {
      Alert.alert('Não foi possível continuar', error.message);
    }
  };

  if (screen === 'splash') return <SplashScreen />;
  if (screen === 'onboarding') return <OnboardingScreen onFinish={finishOnboarding} />;
  return <LoginScreen startupMessage={startupMessage} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  splash: {
    flex: 1,
    backgroundColor: '#1D1C24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: { width: '100%', height: 320, maxWidth: 420 },
  splashIndicator: {
    position: 'absolute',
    bottom: 54,
    width: 38,
    height: 4,
    borderRadius: 3,
    backgroundColor: BRAND.blue,
  },
  onboardingScreen: { flex: 1, backgroundColor: BRAND.background, paddingHorizontal: 24 },
  onboardingTop: {
    height: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandLine: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: BRAND.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { color: BRAND.black, fontSize: 19, fontWeight: '800', letterSpacing: -0.5 },
  brandAccent: { color: BRAND.blue },
  skipText: { color: BRAND.gray, fontSize: 15, fontWeight: '600', padding: 8 },
  skipSpacer: { width: 44 },
  illustration: { flex: 1, minHeight: 235, alignItems: 'center', justifyContent: 'center' },
  illustrationCircle: {
    width: 218,
    height: 218,
    borderRadius: 109,
    backgroundColor: '#E5F5FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationIcon: {
    width: 142,
    height: 142,
    borderRadius: 71,
    backgroundColor: BRAND.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 7px 18px rgba(17, 17, 17, 0.08)' },
      default: {
        shadowColor: BRAND.black,
        shadowOpacity: 0.08,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 7 },
        elevation: 3,
      },
    }),
  },
  illustrationBadge: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BRAND.blue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: BRAND.background,
  },
  badgeLeft: { left: 2, top: 36 },
  badgeRight: { right: 3, bottom: 27 },
  mapPins: { ...StyleSheet.absoluteFillObject },
  mapPin: { position: 'absolute', width: 13, height: 13, borderRadius: 8, backgroundColor: BRAND.blue, borderWidth: 3, borderColor: BRAND.white },
  mapPinOne: { top: '31%', left: '34%' },
  mapPinTwo: { top: '45%', right: '28%' },
  mapPinThree: { bottom: '25%', left: '40%' },
  onboardingCopy: { paddingBottom: 28, alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 7, marginBottom: 25 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#D3D8DC' },
  activeDot: { width: 24, backgroundColor: BRAND.blue },
  onboardingTitle: { color: BRAND.black, fontSize: 27, lineHeight: 34, fontWeight: '800', textAlign: 'center' },
  onboardingSubtitle: { color: BRAND.gray, fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 12, marginBottom: 26 },
  primaryButton: {
    width: '100%',
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: BRAND.blue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryButtonText: { color: BRAND.white, fontSize: 16, fontWeight: '700' },
  loginScreen: { flex: 1, backgroundColor: BRAND.background },
  loginContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingTop: 26, paddingBottom: 24 },
  loginBrand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 34 },
  welcome: { color: BRAND.black, fontSize: 30, lineHeight: 37, fontWeight: '800', letterSpacing: -0.8 },
  loginSubtitle: { color: BRAND.gray, fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 26 },
  startupMessage: { color: '#A65B00', fontSize: 13, lineHeight: 19, marginBottom: 14 },
  loginErrorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FEF3F2',
    borderWidth: 1,
    borderColor: '#FECDCA',
    borderRadius: 10,
    padding: 11,
    marginTop: 2,
    marginBottom: 8,
  },
  loginErrorText: { flex: 1, color: '#B42318', fontSize: 13, lineHeight: 18 },
  formCard: { backgroundColor: BRAND.white, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#EEF0F2' },
  fieldLabel: { color: BRAND.black, fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 8 },
  inputWrapper: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BRAND.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: BRAND.white,
  },
  input: { flex: 1, height: 52, paddingHorizontal: 11, color: BRAND.black, fontSize: 15 },
  forgotPasswordRow: { alignItems: 'flex-end', marginTop: 10, marginBottom: 8 },
  forgotPasswordText: { color: '#168AC7', fontSize: 13, fontWeight: '600', paddingVertical: 4 },
  loginNoticeText: { color: '#168AC7', fontSize: 12, lineHeight: 18, marginBottom: 8 },
  loginPrimaryButton: { marginTop: 8 },
  disabledButton: { opacity: 0.65 },
  registerLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F2',
  },
  registerText: { color: BRAND.gray, fontSize: 13 },
  registerLink: { color: '#168AC7', fontSize: 13, fontWeight: '700' },
  secureNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 24 },
  secureNoteText: { color: BRAND.gray, fontSize: 12 },
});
