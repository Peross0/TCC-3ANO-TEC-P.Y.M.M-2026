import React, { useContext, useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import AnimatedScreen from '../components/layout/AnimatedScreen';
import { useAppPreferences } from '../context/PreferencesContext';
import { SessionContext } from '../context/SessionContext';
import { apiFetch, getAssetUrl } from '../lib/api';

export default function PerfilScreen() {
  const { sessionData, setSessionData } = useContext(SessionContext);
  const { colors, preferences } = useAppPreferences();
  const styles = makeStyles(colors, preferences.large_text);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [curso, setCurso] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [avatarUri, setAvatarUri] = useState(null);
  const [resumeName, setResumeName] = useState(null);
  const router = useRouter();
  const user = sessionData?.user;
  const profile = sessionData?.profile;
  const isCandidate = user?.user_type === 'CANDIDATE';

  useEffect(() => {
    setNome(profile?.full_name || user?.full_name || '');
    setTelefone(profile?.phone || user?.phone || '');
    setCurso(profile?.course || user?.course || '');
    setAvatarUri(getAssetUrl(profile?.avatar_url || user?.avatar_url));
    
    // Se houver um currículo salvo no perfil/usuário, extraímos o nome ou definimos um rótulo padrão
    const currentResumeUrl = profile?.resume_url || user?.resume_url;
    if (currentResumeUrl) {
      const parts = currentResumeUrl.split('/');
      setResumeName(parts[parts.length - 1] || 'Currículo anexado');
    }
  }, [profile, user]);

  const changeAvatar = async () => {
    if (isUploadingAvatar) return;

    try {
      const selection = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (selection.canceled || !selection.assets?.length) return;

      const asset = selection.assets[0];
      const formData = new FormData();
      if (Platform.OS === 'web' && asset.file) {
        formData.append('avatar', asset.file, asset.fileName || 'avatar.jpg');
      } else {
        formData.append('avatar', {
          uri: asset.uri,
          name: asset.fileName || 'avatar.jpg',
          type: asset.mimeType || 'image/jpeg',
        });
      }

      setIsUploadingAvatar(true);
      const result = await apiFetch('/users/me/avatar', { method: 'POST', body: formData });
      const updatedAvatarUrl = result.user?.avatar_url;
      if (!updatedAvatarUrl) throw new Error('O servidor não retornou a nova foto do perfil.');
      const updatedAvatarUri = getAssetUrl(updatedAvatarUrl);
      setAvatarUri(updatedAvatarUri);
      setSessionData((current) => ({
        ...current,
        user: { ...current.user, avatar_url: updatedAvatarUrl },
        profile: { ...current.profile, avatar_url: updatedAvatarUrl },
      }));
      Alert.alert('Foto atualizada', 'Sua foto foi salva no perfil.');
    } catch (error) {
      Alert.alert('Não foi possível atualizar a foto', error.message || 'Tente novamente.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handlePickResume = async () => {
    if (isUploadingResume) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const fileAsset = result.assets[0];
      const formData = new FormData();

      if (Platform.OS === 'web' && fileAsset.file) {
        formData.append('resume', fileAsset.file, fileAsset.name || 'curriculo.pdf');
      } else {
        formData.append('resume', {
          uri: fileAsset.uri,
          name: fileAsset.name || 'curriculo.pdf',
          type: fileAsset.mimeType || 'application/pdf',
        });
      }

      setIsUploadingResume(true);
      // Rota de API para upload de currículo do candidato (ajuste conforme o seu backend)
      const apiResult = await apiFetch('/candidates/resume', { method: 'POST', body: formData });
      const updatedResumeUrl = apiResult.candidate?.resume_url || apiResult.resume_url;

      setResumeName(fileAsset.name);
      setSessionData((current) => ({
        ...current,
        profile: { ...current.profile, resume_url: updatedResumeUrl },
      }));

      Alert.alert('Currículo enviado', 'Seu currículo foi anexado com sucesso.');
    } catch (error) {
      Alert.alert('Não foi possível enviar o currículo', error.message || 'Tente novamente.');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleSave = async () => {
    if (!nome.trim() || nome.trim().length < 2) {
      Alert.alert('Nome obrigatório', 'Informe seu nome completo (pelo menos 2 caracteres).');
      return;
    }
    if (!user) {
      Alert.alert('Sessão não encontrada', 'Entre novamente para atualizar seu perfil.');
      return;
    }

    const profilePath = isCandidate
      ? '/candidates/profile'
      : user.user_type === 'RECRUITER'
        ? '/recruiters/profile'
        : `/admin/users/${user.id}`;
    const updates = {
      full_name: nome.trim(),
      phone: telefone.trim() || null,
      ...(isCandidate ? { course: curso.trim() || null } : {}),
    };

    setIsSaving(true);
    try {
      const result = await apiFetch(profilePath, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      const updatedProfile = result.candidate || result.recruiter || result.user || updates;
      setSessionData((current) => ({
        ...current,
        user: { ...current.user, ...updates },
        profile: { ...current.profile, ...updatedProfile, ...updates },
      }));
      Alert.alert('Perfil atualizado', 'Seus dados foram salvos na sua conta.');
    } catch (error) {
      Alert.alert(
        'Não foi possível salvar',
        error instanceof TypeError ? 'Não foi possível conectar ao servidor.' : error.message,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatedScreen>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={colors.background === '#101822' || colors.background === '#000000' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Feather name="arrow-left" size={21} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Editar perfil</Text>
            <Text style={styles.subtitle}>Atualize os dados da sua conta</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              {avatarUri
                ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} onError={() => setAvatarUri(null)} />
                : <Feather name="user" size={38} color={colors.tint} />}
            </View>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={changeAvatar}
              disabled={isUploadingAvatar}
              accessibilityRole="button"
              accessibilityLabel="Alterar foto do perfil"
            >
              {isUploadingAvatar
                ? <ActivityIndicator size="small" color={colors.surface} />
                : <Feather name="camera" size={15} color={colors.surface} />}
              <Text style={styles.photoButtonText}>Alterar foto</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Dados pessoais</Text>
            <Field
              colors={colors}
              styles={styles}
              label="Nome completo"
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome completo"
              editable={!isSaving}
            />
            <Field
              colors={colors}
              styles={styles}
              label="E-mail"
              value={profile?.email || user?.email || ''}
              editable={false}
            />
            {(profile?.document_number || user?.document_number) ? (
              <Field
                colors={colors}
                styles={styles}
                label={(profile?.document_type || user?.document_type) === 'CNPJ' ? 'CNPJ' : 'CPF'}
                value={profile?.document_number || user?.document_number}
                editable={false}
              />
            ) : null}
            <Field
              colors={colors}
              styles={styles}
              label="Telefone"
              value={telefone}
              onChangeText={setTelefone}
              placeholder="(00) 00000-0000"
              keyboardType="phone-pad"
              editable={!isSaving}
            />
            {isCandidate ? (
              <Field
                colors={colors}
                styles={styles}
                label="Curso"
                value={curso}
                onChangeText={setCurso}
                placeholder="Seu curso"
                editable={!isSaving}
              />
            ) : null}
          </View>

          {/* Seção específica para o currículo caso o usuário seja candidato */}
          {isCandidate && (
            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>Currículo Profissional</Text>
              <Text style={styles.subtitleResume}>Envie seu currículo em formato PDF ou Word</Text>
              
              <View style={styles.resumeRow}>
                <View style={styles.resumeInfo}>
                  <Feather name="file-text" size={20} color={colors.tint} />
                  <Text style={styles.resumeName} numberOfLines={1}>
                    {resumeName || 'Nenhum currículo anexado'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.resumeButton, isUploadingResume && styles.disabledButton]}
                  onPress={handlePickResume}
                  disabled={isUploadingResume}
                >
                  {isUploadingResume ? (
                    <ActivityIndicator size="small" color={colors.surface} />
                  ) : (
                    <>
                      <Feather name="upload" size={14} color={colors.surface} />
                      <Text style={styles.resumeButtonText}>
                        {resumeName ? 'Alterar' : 'Anexar'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.disabledButton]}
            onPress={handleSave}
            disabled={isSaving}
            accessibilityRole="button"
          >
            {isSaving
              ? <ActivityIndicator color={colors.surface} />
              : <Feather name="check" size={18} color={colors.surface} />}
            <Text style={styles.saveText}>{isSaving ? 'Salvando...' : 'Salvar alterações'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </AnimatedScreen>
  );
}

function Field({ colors, styles, label, ...inputProps }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        style={[styles.input, inputProps.editable === false && styles.readOnlyInput]}
        placeholderTextColor={colors.muted}
        accessibilityLabel={label}
      />
    </View>
  );
}

function makeStyles(colors, largeText) {
  const scale = largeText ? 1.15 : 1;
  return StyleSheet.create({
    container: { backgroundColor: colors.background, flex: 1 },
    header: {
      alignItems: 'center',
      borderBottomColor: colors.line,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      gap: 12,
      padding: 16,
    },
    backButton: { padding: 8 },
    headerCopy: { flex: 1 },
    title: { color: colors.text, fontSize: 20 * scale, fontWeight: '800' },
    subtitle: { color: colors.muted, fontSize: 12 * scale, marginTop: 3 },
    subtitleResume: { color: colors.muted, fontSize: 12 * scale, marginBottom: 4 },
    content: { gap: 16, padding: 18, paddingBottom: 34 },
    avatarSection: { alignItems: 'center', paddingVertical: 8 },
    avatar: {
      alignItems: 'center',
      backgroundColor: colors.primaryWash,
      borderColor: colors.line,
      borderRadius: 52,
      borderWidth: 2,
      height: 104,
      justifyContent: 'center',
      overflow: 'hidden',
      width: 104,
    },
    avatarImage: { height: '100%', width: '100%' },
    photoButton: {
      alignItems: 'center',
      backgroundColor: colors.tint,
      borderRadius: 20,
      flexDirection: 'row',
      gap: 7,
      marginTop: 10,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    photoButtonText: { color: colors.surface, fontSize: 12 * scale, fontWeight: '700' },
    formCard: {
      backgroundColor: colors.surface,
      borderColor: colors.line,
      borderRadius: 17,
      borderWidth: 1,
      gap: 13,
      padding: 16,
    },
    sectionTitle: { color: colors.text, fontSize: 16 * scale, fontWeight: '800', marginBottom: 2 },
    field: { gap: 6 },
    label: { color: colors.text, fontSize: 12 * scale, fontWeight: '700' },
    input: {
      backgroundColor: colors.background,
      borderColor: colors.line,
      borderRadius: 11,
      borderWidth: 1,
      color: colors.text,
      fontSize: 14 * scale,
      minHeight: 46,
      paddingHorizontal: 13,
      paddingVertical: 10,
    },
    readOnlyInput: { color: colors.muted, opacity: 0.85 },
    resumeRow: {
      alignItems: 'center',
      backgroundColor: colors.background,
      borderColor: colors.line,
      borderRadius: 11,
      borderWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    resumeInfo: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
      gap: 10,
      marginRight: 10,
    },
    resumeName: {
      color: colors.text,
      fontSize: 13 * scale,
      flex: 1,
    },
    resumeButton: {
      alignItems: 'center',
      backgroundColor: colors.tint,
      borderRadius: 8,
      flexDirection: 'row',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    resumeButtonText: {
      color: colors.surface,
      fontSize: 12 * scale,
      fontWeight: '700',
    },
    saveButton: {
      alignItems: 'center',
      backgroundColor: colors.tint,
      borderRadius: 13,
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'center',
      minHeight: 50,
    },
    disabledButton: { opacity: 0.7 },
    saveText: { color: colors.surface, fontSize: 14 * scale, fontWeight: '800' },
  });
}