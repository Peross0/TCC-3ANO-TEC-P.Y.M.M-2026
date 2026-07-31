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
  const [nome, setNome] = useState('');
  const [genero, setGenero] = useState('');
  const [descricao, setDescricao] = useState('');

  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Perfil */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.perfilPill}>
          <Text style={styles.perfilPillText}>Perfil</Text>
        </View>
        <TouchableOpacity>
          <Feather name="edit-3" size={22} color="#3BB7FF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar e Mudar foto */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <FontAwesome5 name="user-alt" size={50} color="#555" />
          </View>
          <TouchableOpacity style={styles.mudarFotoBtn}>
            <Text style={styles.mudarFotoText}>Mudar foto</Text>
          </TouchableOpacity>
        </View>

        {/* Inputs de Informação */}
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            placeholderTextColor="#888"
            value={nome}
            onChangeText={setNome}
          />
          <TextInput
            style={styles.input}
            placeholder="Gênero"
            placeholderTextColor="#888"
            value={genero}
            onChangeText={setGenero}
          />
        </View>

        {/* Descrição com Contador 0/300 */}
        <View style={styles.descSection}>
          <View style={styles.descHeader}>
            <Text style={styles.descTitle}>Breve descrição</Text>
            <Text style={styles.descCounter}>{descricao.length} / 300</Text>
          </View>
          <TextInput
            style={styles.descInput}
            multiline
            maxLength={300}
            value={descricao}
            onChangeText={setDescricao}
          />
        </View>

        {/* Anexar Currículo */}
        <TouchableOpacity style={styles.curriculoCard} activeOpacity={0.8}>
          <Text style={styles.curriculoText}>Curriculo</Text>
          <Feather name="paperclip" size={22} color="#333" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  perfilPill: {
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 32,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 1,
  },
  perfilPillText: { fontSize: 16, fontWeight: 'bold', color: '#555' },
  content: { paddingHorizontal: 28, paddingTop: 10, paddingBottom: 30 },
  avatarSection: { alignItems: 'center', marginVertical: 16 },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#8BB4F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  mudarFotoBtn: { paddingVertical: 4 },
  mudarFotoText: { fontSize: 18, color: '#3BB7FF', fontWeight: 'bold' },
  inputGroup: { gap: 12, marginTop: 10 },
  input: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#CCC',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingVertical: 6,
  },
  descSection: { marginTop: 28 },
  descHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  descTitle: { fontSize: 18, fontWeight: 'bold', color: '#444' },
  descCounter: { fontSize: 16, color: '#888', fontWeight: '600' },
  descInput: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#CCC',
    minHeight: 40,
    fontSize: 15,
    color: '#333',
  },
  curriculoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#CCC',
    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 32,
  },
  curriculoText: { fontSize: 20, fontWeight: 'bold', color: '#666' },
});