import React, { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

export default function PerfilScreen() {
  const params = useLocalSearchParams();
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(params.nome || 'Empresário');
  const [email, setEmail] = useState(params.email || '');

  const salvar = () => {
    if (!nome.trim() || !email.trim()) {
      Alert.alert('Dados incompletos', 'Preencha nome e e-mail.');
      return;
    }
    setEditando(false);
    Alert.alert('Perfil atualizado', 'Seus dados foram atualizados nesta sessão.');
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
          <View style={styles.cardHeader}><Text style={styles.cardTitle}>Dados pessoais</Text><Pressable onPress={() => editando ? salvar() : setEditando(true)}><Feather name={editando ? 'check' : 'edit-2'} size={19} color="#2E56D9" /></Pressable></View>
          <Text style={styles.label}>Nome do responsável</Text>
          <TextInput style={[styles.input, !editando && styles.readOnly]} value={nome} onChangeText={setNome} editable={editando} />
          <Text style={styles.label}>E-mail de acesso</Text>
          <TextInput style={[styles.input, !editando && styles.readOnly]} value={email} onChangeText={setEmail} editable={editando} keyboardType="email-address" autoCapitalize="none" />
          {editando && <Pressable style={styles.saveButton} onPress={salvar}><Text style={styles.saveText}>Salvar alterações</Text></Pressable>}
        </View>

        <View style={styles.infoCard}><Feather name="shield" size={20} color="#2E56D9" /><View style={styles.infoContent}><Text style={styles.infoTitle}>Conta protegida</Text><Text style={styles.infoText}>Seu acesso é exclusivo para a gestão empresarial do Conecta Fácil.</Text></View></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  content: { padding: 20, paddingBottom: 40 },
  headingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  eyebrow: { color: '#2E56D9', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 4 },
  title: { color: '#14213D', fontSize: 27, fontWeight: '800' },
  profileHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#14213D', borderRadius: 18, padding: 20, marginBottom: 18 },
  avatar: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#E8EEFF', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarText: { color: '#2E56D9', fontSize: 25, fontWeight: '800' },
  profileName: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  profileRole: { color: '#B8C9DC', fontSize: 13, marginTop: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#E3EAF2' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  cardTitle: { color: '#14213D', fontSize: 17, fontWeight: '800' },
  label: { color: '#526581', fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 10 },
  input: { height: 48, borderWidth: 1, borderColor: '#DCE5EE', borderRadius: 11, paddingHorizontal: 13, color: '#14213D', fontSize: 14, backgroundColor: '#F9FBFD' },
  readOnly: { color: '#62708A', backgroundColor: '#F4F7FA' },
  saveButton: { height: 46, borderRadius: 11, backgroundColor: '#2E56D9', alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  saveText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  infoCard: { flexDirection: 'row', backgroundColor: '#EAF0FF', borderRadius: 15, padding: 16, marginTop: 18 },
  infoContent: { flex: 1, marginLeft: 11 },
  infoTitle: { color: '#14213D', fontSize: 14, fontWeight: '800' },
  infoText: { color: '#62708A', fontSize: 12, lineHeight: 18, marginTop: 4 },
});
