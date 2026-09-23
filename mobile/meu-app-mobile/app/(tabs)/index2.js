import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export default function EmpresasScreen() {
  const { nome, email } = useLocalSearchParams();
  const [empresas, setEmpresas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregarEmpresas = async () => {
    try {
      const resposta = await fetch(`${API_URL}/empresas`);
      const dados = await resposta.json();
      if (!resposta.ok || !dados.sucesso) throw new Error('Não foi possível carregar as empresas.');
      setEmpresas(dados.empresas);
    } catch (error) {
      Alert.alert('Erro', error instanceof TypeError ? 'Não foi possível conectar ao servidor.' : error.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarEmpresas();
  }, []);

  const abrirEmpresa = async (empresa) => {
    try {
      await fetch(`${API_URL}/empresas/${empresa.id}/visualizacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_nome: nome, usuario_email: email }),
      });
      Alert.alert(empresa.nome, `${empresa.endereco}\n\nE-mail: ${empresa.email}\nTelefone: ${empresa.telefone}`);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível registrar esta visualização.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Empresas</Text>
        <Text style={styles.subtitle}>Conheça oportunidades perto de você</Text>
      </View>
      {carregando ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#2F80ED" /></View>
      ) : (
        <FlatList
          data={empresas}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.companyCard} onPress={() => abrirEmpresa(item)} activeOpacity={0.8}>
              <View style={styles.companyIcon}><Feather name="briefcase" size={22} color="#2F80ED" /></View>
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>{item.nome}</Text>
                <Text style={styles.companyAddress}>{item.endereco}</Text>
                <Text style={styles.companyAction}>Ver empresa</Text>
              </View>
              <Feather name="chevron-right" size={21} color="#8EA1B7" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={<View style={styles.center}><Feather name="briefcase" size={42} color="#C5D0DC" /><Text style={styles.emptyTitle}>Nenhuma empresa cadastrada</Text><Text style={styles.emptyText}>Novas empresas aparecerão aqui.</Text></View>}
          onRefresh={carregarEmpresas}
          refreshing={carregando}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FC' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8EEF5' },
  title: { color: '#14213D', fontSize: 27, fontWeight: '800' },
  subtitle: { color: '#8792AC', fontSize: 14, marginTop: 5 },
  list: { padding: 16, paddingBottom: 30 },
  companyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#E6EDF4' },
  companyIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF2FF', marginRight: 13 },
  companyInfo: { flex: 1 },
  companyName: { color: '#14213D', fontSize: 16, fontWeight: '800' },
  companyAddress: { color: '#8792AC', fontSize: 12, marginTop: 4 },
  companyAction: { color: '#2F80ED', fontSize: 12, fontWeight: '700', marginTop: 7 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyTitle: { color: '#526581', fontSize: 16, fontWeight: '700', marginTop: 14 },
  emptyText: { color: '#8792AC', fontSize: 13, marginTop: 5 },
});
