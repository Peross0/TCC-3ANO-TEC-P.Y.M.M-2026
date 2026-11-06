import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SessionContext } from '../context/SessionContext';
import { useAppPreferences } from '../context/PreferencesContext';
import { apiFetch, clearToken } from '../lib/api';

const MIN_SKELETON_DURATION_MS = 1200;
const wait = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

function SkeletonBar({ width, height = 13, style }) {
  const { colors } = useAppPreferences();
  const styles = makeStyles(colors);
  return <View style={[styles.skeletonBar, { width, height }, style]} />;
}

function SkeletonCard({ children, style }) {
  const { colors } = useAppPreferences();
  const styles = makeStyles(colors);
  return <View style={[styles.skeletonCard, style]}>{children}</View>;
}

function SectionHeading({ icon, title }) {
  const { colors } = useAppPreferences();
  const styles = makeStyles(colors);
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionIcon}>
        <Feather name={icon} size={15} color={colors.tint} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.headingLine} />
      <View style={styles.loadingDot} />
    </View>
  );
}

function LoadingPlaceholder() {
  const { colors } = useAppPreferences();
  const styles = makeStyles(colors);
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 850, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(pulse, { toValue: 0, duration: 850, useNativeDriver: Platform.OS !== 'web' }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const animatedStyle = {
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
  };

  return (
    <Animated.View style={[styles.placeholder, animatedStyle]}>
      <SkeletonCard style={styles.profileCard}>
        <View style={styles.placeholderHeading}>
          <View style={styles.avatarSkeleton}>
            <Feather name="user" size={23} color={colors.primaryDark} />
          </View>
          <View style={styles.placeholderIdentity}>
            <SkeletonBar width="56%" height={16} />
            <SkeletonBar width="77%" height={11} />
          </View>
          <View style={styles.editBadge}><Feather name="edit-2" size={14} color={colors.tint} /></View>
        </View>
        <View style={styles.profileStats}>
          <View style={styles.statBlock}>
            <SkeletonBar width={58} height={10} />
            <SkeletonBar width={90} height={12} />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBlock}>
            <SkeletonBar width={51} height={10} />
            <SkeletonBar width={74} height={12} />
          </View>
        </View>
      </SkeletonCard>

      <SkeletonCard>
        <SectionHeading icon="user" title="Seu perfil" />
        <SkeletonBar width="37%" height={11} style={styles.fieldLabelSkeleton} />
        <SkeletonBar width="100%" height={40} style={styles.inputSkeleton} />
        <SkeletonBar width="29%" height={11} style={styles.fieldLabelSkeleton} />
        <SkeletonBar width="100%" height={40} style={styles.inputSkeleton} />
        <View style={styles.completionRow}>
          <SkeletonBar width="37%" height={10} />
          <SkeletonBar width="27%" height={10} />
        </View>
        <View style={styles.completionTrack}><View style={styles.completionFill} /></View>
      </SkeletonCard>

      <SkeletonCard>
        <SectionHeading icon="message-circle" title="Mensagens" />
        {[0, 1].map((item) => (
          <View key={item} style={styles.messagePreview}>
            <View style={styles.messageAvatar} />
            <View style={styles.messageCopy}>
              <View style={styles.messageTitleRow}>
                <SkeletonBar width={item === 0 ? '43%' : '35%'} height={12} />
                <SkeletonBar width={35} height={9} />
              </View>
              <SkeletonBar width={item === 0 ? '77%' : '61%'} height={10} />
            </View>
          </View>
        ))}
      </SkeletonCard>

      <SkeletonCard>
        <SectionHeading icon="briefcase" title="Histórico de candidaturas" />
        <View style={styles.applicationPreview}>
          <View style={styles.applicationIcon}><Feather name="briefcase" size={15} color={colors.tint} /></View>
          <View style={styles.applicationCopy}>
            <SkeletonBar width="68%" height={12} />
            <SkeletonBar width="43%" height={10} />
          </View>
          <View style={styles.applicationStatus}><SkeletonBar width={47} height={9} /></View>
        </View>
      </SkeletonCard>

      <SkeletonCard style={styles.settingsCard}>
        <View style={styles.settingsIcon}><Feather name="settings" size={16} color={colors.tint} /></View>
        <View style={styles.settingsCopy}>
          <SkeletonBar width={103} height={12} />
          <SkeletonBar width={148} height={9} />
        </View>
        <View style={styles.switchSkeleton}><View style={styles.switchThumb} /></View>
      </SkeletonCard>
    </Animated.View>
  );
}

export default function LoadingScreen() {
  const { setSessionData } = useContext(SessionContext);
  const { colors, isDark } = useAppPreferences();
  const styles = makeStyles(colors);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const router = useRouter();
  const loading = useRef(false);

  const loadAccount = useCallback(async () => {
    if (loading.current) return;
    loading.current = true;
    setErrorMessage('');
    const minimumSkeletonDuration = wait(MIN_SKELETON_DURATION_MS);

    try {
      const { user } = await apiFetch('/auth/me');
      const isCandidate = user.user_type === 'CANDIDATE';
      const isRecruiter = user.user_type === 'RECRUITER';
      const profileRequest = isCandidate
        ? apiFetch('/candidates/profile')
        : isRecruiter
          ? apiFetch('/recruiters/profile')
          : Promise.resolve({ user });
      const historyRequest = isCandidate
        ? apiFetch('/candidates/applications')
        : Promise.resolve({ applications: [] });

      const [profileData, historyData, messagesData, preferencesData] = await Promise.all([
        profileRequest,
        historyRequest,
        apiFetch('/messages'),
        apiFetch('/users/me/preferences'),
      ]);

      await minimumSkeletonDuration;
      setSessionData({
        user,
        profile: profileData.candidate || profileData.recruiter || profileData.user || user,
        applications: historyData.applications || [],
        conversations: messagesData.conversations || [],
        messages: messagesData.messages,
        preferences: preferencesData.preferences,
        settings: { active_notification: user.active_notification },
      });
      router.replace('/(tabs)/home');
    } catch (error) {
      await minimumSkeletonDuration;
      if (error.status === 401 || error.status === 403) {
        await clearToken();
      }
      setErrorMessage(error instanceof TypeError
        ? 'Não foi possível conectar ao servidor. Verifique sua rede e tente novamente.'
        : error.message);
    } finally {
      loading.current = false;
      setIsRetrying(false);
    }
  }, [router, setSessionData]);

  useEffect(() => {
    const timer = setTimeout(loadAccount, 0);
    return () => clearTimeout(timer);
  }, [loadAccount]);

  const returnToLogin = async () => {
    await clearToken();
    setSessionData(null);
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={styles.header}>
        <View style={styles.brandIcon}><Feather name="link" size={18} color={colors.buttonText} /></View>
        <View style={styles.headerCopy}>
          <Text style={styles.brandName}>Conecta<Text style={styles.brandAccent}>Fácil</Text></Text>
          <Text style={styles.headerCaption}>SEU PRÓXIMO PASSO COMEÇA AQUI</Text>
        </View>
        <View style={styles.headerLoading}>
          <ActivityIndicator size="small" color={colors.tint} />
          <Text style={styles.headerLoadingText}>Carregando</Text>
        </View>
      </View>

      {errorMessage ? (
        <View style={styles.errorPanel}>
          <View style={styles.errorIcon}><Feather name="wifi-off" size={24} color={colors.tint} /></View>
          <Text style={styles.title}>Não foi possível carregar seus dados</Text>
          <Text style={styles.subtitle}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setIsRetrying(true);
              loadAccount();
            }}
            disabled={isRetrying}
          >
            <Text style={styles.retryText}>{isRetrying ? 'Tentando...' : 'Tentar novamente'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.loginButton} onPress={returnToLogin}>
            <Text style={styles.loginButtonText}>Voltar ao login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.loadingContent}
          >
            <View style={styles.intro}>
              <View style={styles.introEyebrow}>
                <ActivityIndicator size="small" color={colors.tint} />
                <Text style={styles.eyebrowText}>CARREGANDO SEUS DADOS</Text>
              </View>
              <Text style={styles.title}>Preparando sua conta</Text>
              <Text style={styles.subtitle}>Buscando seu perfil, mensagens, candidaturas e configurações.</Text>
            </View>
            <LoadingPlaceholder />
            <View style={styles.statusLine}>
              <Feather name="shield" size={14} color={colors.tint} />
              <Text style={styles.statusText}>Seus dados estão sendo carregados com segurança</Text>
            </View>
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 22 },
  header: { height: 68, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  headerCopy: { gap: 3 },
  headerLoading: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 18, backgroundColor: colors.primaryWash },
  headerLoadingText: { color: colors.tint, fontSize: 11, fontWeight: '700' },
  brandIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center' },
  brandName: { color: colors.text, fontSize: 18, fontWeight: '800' },
  brandAccent: { color: colors.tint },
  headerCaption: { color: colors.muted, fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  loadingContent: { paddingBottom: 25 },
  intro: { marginTop: 24, marginBottom: 19 },
  introEyebrow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 },
  eyebrowText: { color: colors.tint, fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 5 },
  placeholder: { gap: 13 },
  skeletonCard: {
    backgroundColor: colors.surface,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 15,
    gap: 10,
    ...Platform.select({
      web: { boxShadow: '0px 3px 9px rgba(15, 41, 64, 0.035)' },
      default: {
        shadowColor: colors.text,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.035,
        shadowRadius: 9,
        elevation: 1,
      },
    }),
  },
  profileCard: { backgroundColor: colors.surface },
  placeholderHeading: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 3 },
  avatarSkeleton: { width: 54, height: 54, borderRadius: 18, backgroundColor: colors.primaryWash, alignItems: 'center', justifyContent: 'center' },
  placeholderIdentity: { flex: 1, gap: 8 },
  editBadge: { width: 30, height: 30, borderRadius: 10, backgroundColor: colors.accentWash, alignItems: 'center', justifyContent: 'center' },
  profileStats: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line },
  statBlock: { flex: 1, gap: 7 },
  statDivider: { width: 1, height: 27, backgroundColor: colors.line, marginHorizontal: 14 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  sectionIcon: { width: 27, height: 27, borderRadius: 9, backgroundColor: colors.primaryWash, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
  headingLine: { flex: 1 },
  loadingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.tint },
  skeletonBar: { backgroundColor: colors.line, borderRadius: 7 },
  fieldLabelSkeleton: { marginTop: 2 },
  inputSkeleton: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.line, borderRadius: 10 },
  completionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  completionTrack: { height: 5, borderRadius: 3, backgroundColor: colors.line, overflow: 'hidden' },
  completionFill: { width: '63%', height: '100%', borderRadius: 3, backgroundColor: colors.accent },
  messagePreview: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 3 },
  messageAvatar: { width: 36, height: 36, borderRadius: 13, backgroundColor: colors.primaryWash },
  messageCopy: { flex: 1, gap: 7 },
  messageTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  applicationPreview: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 2 },
  applicationIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.primaryWash, alignItems: 'center', justifyContent: 'center' },
  applicationCopy: { flex: 1, gap: 7 },
  applicationStatus: { backgroundColor: colors.accentWash, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 6 },
  settingsCard: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingsIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.primaryWash, alignItems: 'center', justifyContent: 'center' },
  settingsCopy: { flex: 1, gap: 7 },
  switchSkeleton: { width: 38, height: 22, borderRadius: 12, backgroundColor: colors.accentWash, justifyContent: 'center', paddingHorizontal: 3 },
  switchThumb: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.tint, alignSelf: 'flex-end' },
  statusLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 16 },
  statusText: { color: colors.muted, fontSize: 11, textAlign: 'center' },
  errorPanel: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 45 },
  errorIcon: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.primaryWash, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  retryButton: { backgroundColor: colors.tint, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, marginTop: 26 },
  retryText: { color: colors.buttonText, fontSize: 15, fontWeight: '700' },
  loginButton: { padding: 14, marginTop: 8 },
  loginButtonText: { color: colors.muted, fontSize: 14, fontWeight: '600' },
});
