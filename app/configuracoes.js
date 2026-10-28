import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAppPreferences } from '../context/PreferencesContext';
import { SessionContext } from '../context/SessionContext';
import { apiFetch, clearToken, getAssetUrl, saveToken } from '../lib/api';

const THEME_OPTIONS = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
];
const WORK_MODELS = [
  { value: null, label: 'Qualquer' },
  { value: 'ONSITE', label: 'Presencial' },
  { value: 'HYBRID', label: 'Híbrido' },
  { value: 'REMOTE', label: 'Remoto' },
];
const CONTRACT_TYPES = [
  { value: null, label: 'Qualquer' },
  { value: 'CLT', label: 'CLT' },
  { value: 'PJ', label: 'PJ' },
  { value: 'INTERNSHIP', label: 'Estágio' },
  { value: 'FREELANCE', label: 'Freelancer' },
];

export default function ConfiguracoesScreen() {
  const router = useRouter();
  const { sessionData, setSessionData } = useContext(SessionContext);
  const {
    preferences,
    colors,
    isDark,
    saving: savingPreferences,
    syncError,
    updatePreferences,
  } = useAppPreferences();
  const styles = makeStyles(colors, preferences.large_text);
  const user = sessionData?.user;
  const [draft, setDraft] = useState(preferences);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setDraft(preferences);
  }, [preferences]);

  const notificationsEnabled = Boolean(
    sessionData?.settings?.active_notification ?? user?.active_notification,
  );

  const savePreference = async (updates) => {
    try {
      await updatePreferences(updates);
      setFeedback({ message: 'Preferência salva.', error: false });
    } catch (error) {
      setFeedback({ message: error.message || 'Não foi possível salvar a preferência.', error: true });
    }
  };

  const updateNotifications = async (activeNotification) => {
    if (!user || savingNotifications) return;
    setSavingNotifications(true);
    const path = user.user_type === 'CANDIDATE'
      ? '/candidates/notifications'
      : '/recruiters/profile';
    try {
      await apiFetch(path, {
        method: user.user_type === 'CANDIDATE' ? 'PATCH' : 'PUT',
        body: JSON.stringify({ active_notification: activeNotification }),
      });
      setSessionData((current) => ({
        ...current,
        user: { ...current.user, active_notification: activeNotification },
        profile: { ...current.profile, active_notification: activeNotification },
        settings: { ...current.settings, active_notification: activeNotification },
      }));
      setFeedback({ message: 'Preferência de avisos atualizada.', error: false });
    } catch (error) {
      setFeedback({ message: error.message || 'Não foi possível atualizar os avisos.', error: true });
    } finally {
      setSavingNotifications(false);
    }
  };

  const saveJobPreferences = async () => {
    try {
      await updatePreferences({
        preferred_sector: draft.preferred_sector?.trim() || null,
        preferred_location: draft.preferred_location?.trim() || null,
        preferred_work_model: draft.preferred_work_model || null,
        preferred_contract_type: draft.preferred_contract_type || null,
      });
      setFeedback({ message: 'Preferências de oportunidades salvas.', error: false });
    } catch (error) {
      setFeedback({ message: error.message || 'Não foi possível salvar as preferências.', error: true });
    }
  };

  const savePassword = async () => {
    if (!currentPassword) {
      setFeedback({ message: 'Informe sua senha atual.', error: true });
      return;
    }
    if (newPassword.length < 8) {
      setFeedback({ message: 'A nova senha precisa ter pelo menos 8 caracteres.', error: true });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ message: 'As senhas não conferem.', error: true });
      return;
    }
    setSavingPassword(true);
    try {
      const result = await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      await saveToken(result.token);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFeedback({ message: result.message || 'Senha alterada com sucesso.', error: false });
    } catch (error) {
      setFeedback({ message: error.message || 'Não foi possível alterar a senha.', error: true });
    } finally {
      setSavingPassword(false);
    }
  };

  const logout = async () => {
    try {
      await clearToken();
      setSessionData(null);
      router.replace('/');
    } catch (error) {
      setFeedback({ message: error.message || 'Não foi possível sair da conta.', error: true });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Voltar">
          <Feather name="arrow-left" size={21} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Conta e configurações</Text>
          <Text style={styles.subtitle}>Gerencie seus dados e preferências</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {feedback ? <Text style={[styles.feedback, feedback.error && styles.errorText]} accessibilityLiveRegion="polite">{feedback.message}</Text> : null}
        {syncError ? <Text style={styles.errorText}>{syncError}</Text> : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minha conta</Text>
          <View style={styles.accountRow}>
            <View style={styles.avatar}>
              {getAssetUrl(sessionData?.profile?.avatar_url || user?.avatar_url)
                ? <Image source={{ uri: getAssetUrl(sessionData?.profile?.avatar_url || user?.avatar_url) }} style={styles.avatarImage} />
                : <Feather name="user" size={22} color={colors.tint} />}
            </View>
            <View style={styles.accountDetails}>
              <Text style={styles.accountName}>{sessionData?.profile?.full_name || user?.full_name || 'Conta'}</Text>
              <Text style={styles.accountEmail}>{sessionData?.profile?.email || user?.email}</Text>
              <Text style={styles.accountMeta}>{user?.user_type === 'RECRUITER' ? 'Empresa' : 'Estudante'}{user?.created_at ? ` · Desde ${new Date(user.created_at).toLocaleDateString('pt-BR')}` : ''}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/perfil')} accessibilityRole="button">
            <Feather name="edit-2" size={16} color={colors.tint} />
            <Text style={styles.secondaryButtonText}>Editar perfil</Text>
          </TouchableOpacity>
          {user?.user_type === 'CANDIDATE' ? (
            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/salvos')} accessibilityRole="button">
              <Feather name="bookmark" size={16} color={colors.tint} />
              <Text style={styles.secondaryButtonText}>Vagas salvas</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alterar senha</Text>
          <PasswordField label="Senha atual" value={currentPassword} onChangeText={setCurrentPassword} visible={showPasswords} toggleVisible={() => setShowPasswords((value) => !value)} colors={colors} styles={styles} />
          <PasswordField label="Nova senha" value={newPassword} onChangeText={setNewPassword} visible={showPasswords} toggleVisible={() => setShowPasswords((value) => !value)} colors={colors} styles={styles} />
          <PasswordField label="Confirmar nova senha" value={confirmPassword} onChangeText={setConfirmPassword} visible={showPasswords} toggleVisible={() => setShowPasswords((value) => !value)} colors={colors} styles={styles} />
          <Text style={styles.helperText}>{newPassword.length >= 8 ? '✓ ' : '○ '}Pelo menos 8 caracteres</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={savePassword} disabled={savingPassword} accessibilityRole="button">
            {savingPassword ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.primaryButtonText}>Salvar nova senha</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tema</Text>
          <View style={styles.segmentRow} accessibilityRole="radiogroup" accessibilityLabel="Tema do aplicativo">
            {THEME_OPTIONS.map((option) => {
              const selected = preferences.theme === option.value;
              return (
                <TouchableOpacity key={option.value} style={[styles.segment, selected && styles.segmentSelected]} onPress={() => savePreference({ theme: option.value })} accessibilityRole="radio" accessibilityState={{ selected }}>
                  <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.helperText}>A aparência segue o sistema do dispositivo ou a opção escolhida.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências de oportunidades</Text>
          <Text style={styles.label}>Área profissional</Text>
          <TextInput value={draft.preferred_sector || ''} onChangeText={(value) => setDraft((current) => ({ ...current, preferred_sector: value }))} placeholder="Ex.: Tecnologia" placeholderTextColor={colors.muted} style={styles.input} />
          <Text style={styles.label}>Localização</Text>
          <TextInput value={draft.preferred_location || ''} onChangeText={(value) => setDraft((current) => ({ ...current, preferred_location: value }))} placeholder="Cidade ou região" placeholderTextColor={colors.muted} style={styles.input} />
          <ChoiceGroup label="Modalidade preferida" options={WORK_MODELS} value={draft.preferred_work_model} onChange={(value) => setDraft((current) => ({ ...current, preferred_work_model: value }))} colors={colors} styles={styles} />
          <ChoiceGroup label="Tipo de oportunidade" options={CONTRACT_TYPES} value={draft.preferred_contract_type} onChange={(value) => setDraft((current) => ({ ...current, preferred_contract_type: value }))} colors={colors} styles={styles} />
          <TouchableOpacity style={styles.primaryButton} onPress={saveJobPreferences} disabled={savingPreferences} accessibilityRole="button">
            {savingPreferences ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.primaryButtonText}>Salvar preferências</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acessibilidade e avisos</Text>
          <PreferenceSwitch title="Texto maior" value={preferences.large_text} disabled={savingPreferences} onChange={(value) => savePreference({ large_text: value })} colors={colors} styles={styles} />
          <PreferenceSwitch title="Alto contraste" value={preferences.high_contrast} disabled={savingPreferences} onChange={(value) => savePreference({ high_contrast: value })} colors={colors} styles={styles} />
          <PreferenceSwitch title="Reduzir animações" value={preferences.reduce_motion} disabled={savingPreferences} onChange={(value) => savePreference({ reduce_motion: value })} colors={colors} styles={styles} />
          <PreferenceSwitch title="Avisos de atividade no aplicativo" description="Controla os avisos de candidaturas disponíveis na área de notificações." value={notificationsEnabled} disabled={savingNotifications || !user} busy={savingNotifications} onChange={updateNotifications} colors={colors} styles={styles} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacidade</Text>
          <Text style={styles.bodyText}>As informações exibidas nesta conta são carregadas do perfil autenticado. Alterações são enviadas ao backend com a sessão da própria conta; e-mail e documento permanecem somente para consulta.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre o Conecta Fácil</Text>
          <Text style={styles.aboutName}>Conecta Fácil</Text>
          <Text style={styles.bodyText}>Plataforma que aproxima estudantes e empresas de oportunidades de estágio e primeiro emprego.</Text>
          <Text style={styles.accountMeta}>Versão {Constants.expoConfig?.version || '1.0.0'}</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout} accessibilityRole="button">
          <Feather name="log-out" size={17} color={colors.danger} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function PasswordField({ label, value, onChangeText, visible, toggleVisible, colors, styles }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput value={value} onChangeText={onChangeText} secureTextEntry={!visible} autoCapitalize="none" placeholder={label} placeholderTextColor={colors.muted} style={styles.passwordInput} />
        <TouchableOpacity onPress={toggleVisible} accessibilityRole="button" accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}>
          <Feather name={visible ? 'eye-off' : 'eye'} size={18} color={colors.muted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PreferenceSwitch({ title, description, value, disabled, busy, onChange, colors, styles }) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.switchCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        {description ? <Text style={styles.helperText}>{description}</Text> : null}
      </View>
      {busy ? <ActivityIndicator color={colors.tint} /> : <Switch value={Boolean(value)} onValueChange={onChange} disabled={disabled} accessibilityLabel={title} trackColor={{ false: colors.line, true: colors.tint }} thumbColor={colors.surface} />}
    </View>
  );
}

function ChoiceGroup({ label, options, value, onChange, colors, styles }) {
  return (
    <View style={styles.choiceGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.choiceRow}>
        {options.map((option) => {
          const selected = (value || null) === option.value;
          return (
            <TouchableOpacity key={option.value || 'any'} style={[styles.choice, selected && styles.choiceSelected]} onPress={() => onChange(option.value)} accessibilityRole="radio" accessibilityState={{ selected }}>
              <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function makeStyles(colors, largeText) {
  const scale = largeText ? 1.12 : 1;
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
    backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerCopy: { flex: 1 },
    title: { color: colors.text, fontSize: 19 * scale, fontWeight: '800' },
    subtitle: { color: colors.muted, fontSize: 12 * scale, marginTop: 3 },
    content: { padding: 18, paddingBottom: 40, gap: 8, maxWidth: 760, width: '100%', alignSelf: 'center' },
    section: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line, gap: 10 },
    sectionTitle: { color: colors.text, fontSize: 16 * scale, fontWeight: '800', marginBottom: 3 },
    accountRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
    avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: colors.primaryWash },
    avatarImage: { width: '100%', height: '100%' },
    accountDetails: { flex: 1 },
    accountName: { color: colors.text, fontSize: 15 * scale, fontWeight: '700' },
    accountEmail: { color: colors.muted, fontSize: 12, marginTop: 3 },
    accountMeta: { color: colors.muted, fontSize: 11, marginTop: 4 },
    secondaryButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 4 },
    secondaryButtonText: { color: colors.tint, fontSize: 13, fontWeight: '700' },
    fieldGroup: { gap: 6 },
    label: { color: colors.text, fontSize: 12 * scale, fontWeight: '700', marginTop: 4 },
    input: { minHeight: 44, borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingHorizontal: 12, color: colors.text, backgroundColor: colors.surface },
    inputRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingHorizontal: 12, backgroundColor: colors.surface },
    passwordInput: { flex: 1, minWidth: 0, height: 42, color: colors.text },
    helperText: { color: colors.muted, fontSize: 11, lineHeight: 16 },
    feedback: { color: '#287A4B', fontSize: 12, lineHeight: 18, paddingVertical: 5 },
    errorText: { color: colors.danger, fontSize: 12, lineHeight: 18, paddingVertical: 5 },
    primaryButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tint, borderRadius: 8, paddingHorizontal: 14, marginTop: 4 },
    primaryButtonText: { color: colors.surface, fontSize: 13, fontWeight: '800' },
    segmentRow: { flexDirection: 'row', borderWidth: 1, borderColor: colors.line, borderRadius: 9, padding: 3, backgroundColor: colors.surfaceSoft },
    segment: { flex: 1, minHeight: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 7 },
    segmentSelected: { backgroundColor: colors.tint },
    segmentText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
    segmentTextSelected: { color: colors.surface },
    choiceGroup: { gap: 6 },
    choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
    choice: { minHeight: 34, justifyContent: 'center', borderWidth: 1, borderColor: colors.line, borderRadius: 17, paddingHorizontal: 11 },
    choiceSelected: { borderColor: colors.tint, backgroundColor: colors.tint },
    choiceText: { color: colors.inkSoft, fontSize: 11, fontWeight: '600' },
    choiceTextSelected: { color: colors.surface },
    switchRow: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
    switchCopy: { flex: 1 },
    rowTitle: { color: colors.text, fontSize: 13 * scale, fontWeight: '700' },
    bodyText: { color: colors.inkSoft, fontSize: 12 * scale, lineHeight: 19 },
    aboutName: { color: colors.text, fontSize: 14, fontWeight: '800' },
    logoutButton: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10, borderWidth: 1, borderColor: colors.danger, borderRadius: 8 },
    logoutText: { color: colors.danger, fontSize: 13, fontWeight: '700' },
  });
}