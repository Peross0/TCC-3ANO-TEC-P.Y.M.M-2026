import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ConfiguracoesScreen() {
  const router = useRouter();

  const menuItems = [
    { title: 'Salvos', icon: <Feather name="bookmark" size={22} color="#000" /> },
    { title: 'Preferencias', icon: <Ionicons name="options-outline" size={22} color="#000" /> },
    { title: 'Tema', icon: <MaterialCommunityIcons name="paint-bucket" size={22} color="#000" /> },
    { title: 'Acessibilidade', icon: <Ionicons name="body-outline" size={22} color="#000" /> },
    { title: 'Ajuda', icon: <Feather name="help-circle" size={22} color="#000" /> },
    { title: 'Sobre', icon: <Feather name="info" size={22} color="#000" /> },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Botão de Voltar Simples */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuCard} activeOpacity={0.7}>
            <View style={styles.menuLeft}>
              {item.icon}
              <Text style={styles.menuText}>{item.title}</Text>
            </View>
            <Feather name="chevron-right" size={24} color="#000" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: { paddingRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  content: { paddingHorizontal: 24, paddingTop: 20 },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  menuText: { fontSize: 18, fontWeight: '500', color: '#222' },
});