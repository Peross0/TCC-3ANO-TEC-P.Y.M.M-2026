import { Feather, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAppPreferences } from '../context/PreferencesContext';
import { SessionContext } from '../context/SessionContext';
import { apiFetch, getAssetUrl } from '../lib/api';

export default function PerfilScreen() {
  const { sessionData, setSessionData } = useContext(SessionContext);
  const { colors } = useAppPreferences();
  const styles = makeStyles(colors);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [curso, setCurso] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUri, setAvatarUri] = useState(getAssetUrl(sessionData?.profile?.avatar_url || sessionData?.user?.avatar_url));
  const router = useRouter();

  useEffect(() => {
    setNome(sessionData?.profile?.full_name || '');
    setTelefone(sessionData?.profile?.phone || '');
    setCurso(sessionData?.profile?.course || '');
    setAvatarUri(getAssetUrl(sessionData?.profile?.avatar_url || sessionData?.user?.avatar_url));
  }, [sessionData?.profile]);

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
      setAvatarUri(getAssetUrl(updatedAvatarUrl));
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

  const handleSave = async () => {
    if (!nome.trim()) {
      Alert.alert('Nome obrigatório', 'Informe seu nome completo.');
      return;
    }
    const user = sessionData?.user;
    const profilePath = user?.user_type === 'CANDIDATE'
      ? '/candidates/profile'
      : user?.user_type === 'RECRUITER'
        ? '/recruiters/profile'
        : `/admin/users/${user?.id}`;
    setIsSaving(true);
    try {
      const result = await apiFetch(profilePath, {
        method: 'PUT',
        body: JSON.stringify({
          full_name: nome.trim(),
          ...(telefone.trim() ? { phone: telefone.trim() } : {}),
          ...(user?.user_type === 'CANDIDATE' ? { course: curso.trim() || null } : {}),
        }),
      });
      const profile = result.candidate || result.recruiter || result.user;
      setSessionData((current) => ({
        ...current,
        user: {
          ...current.user,
          full_name: nome.trim(),
          ...(telefone.trim() ? { phone: telefone.trim() } : {}),
          ...(user?.user_type === 'CANDIDATE' ? { course: curso.trim() || null } : {}),
        },
        profile: {
          ...current.profile,
          ...profile,
          full_name: nome.trim(),
          ...(telefone.trim() ? { phone: telefone.trim() } : {}),
          ...(user?.user_type === 'CANDIDATE' ? { course: curso.trim() || null } : {}),
        },
      }));
      Alert.alert('Perfil atualizado', 'Seus dados foram salvos com sucesso.');
    } catch (error) {
      Alert.alert('Não foi possível salvar', error instanceof TypeError
        ? 'Não foi possível conectar ao servidor.'
        : error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnIcon}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity style={styles.btnIcon}>
          <Feather name="more-horizontal" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            {avatarUri
              ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} onError={() => setAvatarUri(null)} />
              : <FontAwesome5 name="user-alt" size={40} color={colors.muted} />}
          </View>
          <TouchableOpacity style={styles.camBadge} onPress={changeAvatar} disabled={isUploadingAvatar} accessibilityRole="button" accessibilityLabel="Alterar foto do perfil">
            {isUploadingAvatar
              ? <ActivityIndicator size="small" color={colors.text} />
              : <Feather name="camera" size={14} color={colors.text} />}
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        <View style={styles.form}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome"
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={[styles.input, styles.readOnlyInput]}
            value={sessionData?.profile?.email || sessionData?.user?.email || ''}
            editable={false}
          />

          <Text style={styles.label}>
            {sessionData?.profile?.document_type === 'CNPJ' ? 'CNPJ' : 'CPF'}
          </Text>
          <TextInput
            style={[styles.input, styles.readOnlyInput]}
            value={sessionData?.profile?.document_number || ''}
            editable={false}
          />

          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.input}
            value={telefone}
            onChangeText={setTelefone}
            placeholder="Seu telefone"
            keyboardType="phone-pad"
          />

          {sessionData?.user?.user_type === 'CANDIDATE' && (
            <>
              <Text style={styles.label}>Curso</Text>
              <TextInput
                style={styles.input}
                value={curso}
                onChangeText={setCurso}
                placeholder="Seu curso"
              />
            </>
          )}
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
          <Text style={styles.saveText}>{isSaving ? 'Salvando...' : 'Salvar'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  btnIcon: { padding: 8, borderRadius: 20, backgroundColor: colors.primaryWash },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  content: { padding: 20 },
  avatarWrap: { alignSelf: 'center', marginBottom: 20 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primaryWash,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 45 },
  camBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.tint,
    padding: 8,
    borderRadius: 15,
  },
  form: { gap: 8, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.inkSoft, marginTop: 8 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
  },
  readOnlyInput: { color: colors.muted },
  saveBtn: {
    backgroundColor: colors.tint,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: { color: colors.text, fontWeight: '700', fontSize: 15 },
  });
}