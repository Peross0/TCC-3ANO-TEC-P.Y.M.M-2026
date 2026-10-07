import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/theme';
import { SessionContext } from '../context/SessionContext';
import { apiFetch } from '../lib/api';

const colors = Colors.light;

export default function PerfilScreen() {
  const { sessionData, setSessionData } = useContext(SessionContext);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [genero, setGenero] = useState('');
  const [descricao, setDescricao] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setNome(sessionData?.profile?.full_name || '');
    setTelefone(sessionData?.profile?.phone || '');
  }, [sessionData?.profile]);

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
        }),
      });
      const profile = result.candidate || result.recruiter || result.user;
      setSessionData((current) => ({
        ...current,
        user: {
          ...current.user,
          full_name: nome.trim(),
          ...(telefone.trim() ? { phone: telefone.trim() } : {}),
        },
        profile: {
          ...current.profile,
          ...profile,
          full_name: nome.trim(),
          ...(telefone.trim() ? { phone: telefone.trim() } : {}),
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
            <FontAwesome5 name="user-alt" size={40} color={colors.muted} />
          </View>
          <TouchableOpacity style={styles.camBadge}>
            <Feather name="camera" size={14} color={colors.text} />
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

          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.input}
            value={telefone}
            onChangeText={setTelefone}
            placeholder="Seu telefone"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Gênero</Text>
          <TextInput
            style={styles.input}
            value={genero}
            onChangeText={setGenero}
            placeholder="Seu gênero"
          />

          <View style={styles.descHead}>
            <Text style={styles.label}>Sobre</Text>
            <Text style={styles.counter}>{descricao.length}/300</Text>
          </View>
          <TextInput
            style={[styles.input, styles.descInput]}
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Breve descrição..."
            multiline
            maxLength={300}
          />
        </View>

        {/* Currículo */}
        <TouchableOpacity style={styles.card}>
          <Feather name="file-text" size={20} color={colors.tint} />
          <Text style={styles.cardText}>Anexar Currículo (PDF)</Text>
          <Feather name="paperclip" size={18} color={colors.muted} />
        </TouchableOpacity>

        {/* Botão Salvar */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
          <Text style={styles.saveText}>{isSaving ? 'Salvando...' : 'Salvar'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  },
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
  descHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  counter: { fontSize: 11, color: colors.muted },
  descInput: { height: 80, textAlignVertical: 'top' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginBottom: 20,
  },
  cardText: { flex: 1, fontSize: 14, color: colors.text },
  saveBtn: {
    backgroundColor: colors.tint,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: { color: colors.text, fontWeight: '700', fontSize: 15 },
});