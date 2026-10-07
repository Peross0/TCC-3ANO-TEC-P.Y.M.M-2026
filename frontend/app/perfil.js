import React, { useEffect, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { apiFetch } from '../lib/api';
import { colors } from '../lib/theme';

export default function PerfilScreen() {
  const params = useLocalSearchParams();
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(params.nome || 'Empresário');
  const [email, setEmail] = useState(params.email || '');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    apiFetch('/recruiters/profile')
      .then(({ recruiter }) => {
        setNome(recruiter.full_name);
        setEmail(recruiter.email);
      })
      .catch((error) => Alert.alert('Não foi possível carregar o perfil', error.message))
      .finally(() => setCarregando(false));
  }, []);

  const salvar = async () => {
    if (!nome.trim() || !email.trim()) {
      Alert.alert('Dados incompletos', 'Preencha nome e e-mail.');
      return;
    }
    try {
      const { recruiter } = await apiFetch('/recruiters/profile', {
        method: 'PUT',
        body: JSON.stringify({ full_name: nome }),
      });
      if (recruiter?.full_name) setNome(recruiter.full_name);
      setEditando(false);
      Alert.alert('Perfil atualizado', 'Seus dados foram salvos com sucesso.');
    } catch (error) {
      Alert.alert('Não foi possível salvar', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headingRow}>
          <Pressable onPress={() => router.replace({ pathname: '/home', params: { nome, email } })} style={styles.backButton} accessibilityLabel="Voltar para início">
            <Feather name="arrow-left" size={20} color="#14213D" />
          </Pressable>
          <View><Text style={styles.eyebrow}>CONTA EMPRESARIAL</Text><Text style={styles.title}>Meu perfil</Text></View>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{nome.trim().charAt(0).toUpperCase() || 'E'}</Text></View>
          <View><Text style={styles.profileName}>{nome}</Text><Text style={styles.profileRole}>Administrador da empresa</Text></View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Dados do responsável</Text>
            {!editando && !carregando && <Pressable style={styles.editButton} onPress={() => setEditando(true)} accessibilityRole="button"><Feather name="edit-2" size={15} color={colors.primary} /><Text style={styles.editButtonText}>Editar</Text></Pressable>}
          </View>
          <Text style={styles.label}>Nome do responsável</Text>
          <TextInput style={[styles.input, (!editando || carregando) && styles.readOnly]} value={nome} onChangeText={setNome} editable={editando && !carregando} placeholder="Nome completo" placeholderTextColor="#98A39C" />
          <Text style={styles.label}>E-mail de acesso · somente leitura</Text>
          <TextInput style={[styles.input, styles.readOnly]} value={email} editable={false} keyboardType="email-address" autoCapitalize="none" />
          {editando && <View style={styles.formActions}><Pressable style={styles.cancelButton} onPress={() => { setNome(params.nome || 'Empresário'); setEditando(false); }}><Text style={styles.cancelText}>Cancelar</Text></Pressable><Pressable style={styles.saveButton} onPress={salvar}><Text style={styles.saveText}>Salvar alterações</Text></Pressable></View>}
        </View>

        <View style={styles.infoCard}><Feather name="shield" size={20} color="#2E56D9" /><View style={styles.infoContent}><Text style={styles.infoTitle}>Conta protegida</Text><Text style={styles.infoText}>Seu acesso é exclusivo para a gestão empresarial do Conecta Fácil.</Text></View></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  content: { width: '100%', maxWidth: 900, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 28, paddingBottom: 48 },
  headingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 5 },
  title: { color: colors.ink, fontSize: 29, fontWeight: '700', letterSpacing: -0.7 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: 16, padding: 20, marginBottom: 16 },
  avatar: { width: 56, height: 56, borderRadius: 17, backgroundColor: '#DDE8DD', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarText: { color: colors.primary, fontSize: 25, fontWeight: '800' },
  profileName: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  profileRole: { color: '#B8C9DC', fontSize: 13, marginTop: 4 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.line },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  editButton: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 9, backgroundColor: colors.primaryWash },
  editButtonText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  cardTitle: { color: colors.ink, fontSize: 17, fontWeight: '700' },
  label: { color: colors.inkSoft, fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 10 },
  input: { height: 48, borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 13, color: colors.ink, fontSize: 14, backgroundColor: '#FCFCFA' },
  readOnly: { color: colors.muted, backgroundColor: colors.surfaceSoft },
  saveButton: { minHeight: 46, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  formActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 10 },
  cancelButton: { minHeight: 46, justifyContent: 'center', paddingHorizontal: 16, marginTop: 18, borderRadius: 10, borderWidth: 1, borderColor: colors.line },
  cancelText: { color: colors.inkSoft, fontSize: 13, fontWeight: '700' },
  saveText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  infoCard: { flexDirection: 'row', backgroundColor: colors.primaryWash, borderRadius: 13, padding: 16, marginTop: 16 },
  infoContent: { flex: 1, marginLeft: 11 },
  infoTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  infoText: { color: colors.inkSoft, fontSize: 12, lineHeight: 18, marginTop: 4 },
});
