import React, { useState } from 'react';
import {
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

export default function PerfilScreen() {
  const [nome, setNome] = useState('Carlos Silva');
  const [genero, setGenero] = useState('');
  const [descricao, setDescricao] = useState('');
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnIcon}>
          <Feather name="arrow-left" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity style={styles.btnIcon}>
          <Feather name="more-horizontal" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <FontAwesome5 name="user-alt" size={40} color="#666" />
          </View>
          <TouchableOpacity style={styles.camBadge}>
            <Feather name="camera" size={14} color="#FFF" />
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
          <Feather name="file-text" size={20} color="#3BB7FF" />
          <Text style={styles.cardText}>Anexar Currículo (PDF)</Text>
          <Feather name="paperclip" size={18} color="#888" />
        </TouchableOpacity>

        {/* Botão Salvar */}
        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveText}>Salvar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  btnIcon: { padding: 8, borderRadius: 20, backgroundColor: '#F0F0F0' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  content: { padding: 20 },
  avatarWrap: { alignSelf: 'center', marginBottom: 20 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3BB7FF',
    padding: 8,
    borderRadius: 15,
  },
  form: { gap: 8, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginTop: 8 },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
  },
  descHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  counter: { fontSize: 11, color: '#888' },
  descInput: { height: 80, textAlignVertical: 'top' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginBottom: 20,
  },
  cardText: { flex: 1, fontSize: 14, color: '#444' },
  saveBtn: {
    backgroundColor: '#3BB7FF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});