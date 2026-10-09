import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/theme';
import { apiFetch, getAssetUrl } from '../../lib/api';

const colors = Colors.light;

export default function EmpresasScreen() {
  const [empresas, setEmpresas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);

  const carregarEmpresas = useCallback(async () => {
    setCarregando(true);
    try {
      const dados = await apiFetch('/candidates/companies');
      setEmpresas((dados.companies || []).map((company) => ({
        id: company.id,
        nome: company.company_name || 'Empresa',
        descricao: company.company_description || '',
        segmento: company.company_sector || '',
        endereco: company.location || 'Localização não informada',
        logoUri: getAssetUrl(company.company_logo_url),
      })));
    } catch (error) {
      Alert.alert('Erro', error.message || 'Não foi possível conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    carregarEmpresas();
  }, [carregarEmpresas]));

  const abrirEmpresa = (empresa) => {
    setEmpresaSelecionada(empresa);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Empresas</Text>
        <Text style={styles.subtitle}>Conheça oportunidades perto de você</Text>
      </View>
      {carregando ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.tint} /></View>
      ) : (
        <FlatList
          data={empresas}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.companyCard} onPress={() => abrirEmpresa(item)} activeOpacity={0.8}>
              <View style={styles.companyIcon}>
                {item.logoUri
                  ? <Image source={{ uri: item.logoUri }} style={styles.companyLogoImage} resizeMode="cover" />
                  : <Feather name="briefcase" size={22} color={colors.text} />}
              </View>
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>{item.nome}</Text>
                <Text style={styles.companyAddress}>{item.endereco}</Text>
                <Text style={styles.companyAction}>Ver empresa</Text>
              </View>
              <Feather name="chevron-right" size={21} color={colors.muted} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={<View style={styles.center}><Feather name="briefcase" size={42} color={colors.line} /><Text style={styles.emptyTitle}>Nenhuma empresa cadastrada</Text><Text style={styles.emptyText}>Novas empresas aparecerão aqui.</Text></View>}
          onRefresh={carregarEmpresas}
          refreshing={carregando}
        />
      )}
      <Modal
        visible={Boolean(empresaSelecionada)}
        transparent
        animationType="fade"
        onRequestClose={() => setEmpresaSelecionada(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setEmpresaSelecionada(null)}
            accessibilityLabel="Fechar detalhes da empresa"
          />
          <View style={styles.detailModal}>
            <View style={styles.detailHeader}>
              <View style={styles.detailIcon}><Feather name="briefcase" size={22} color={colors.primaryDark} /></View>
              <TouchableOpacity onPress={() => setEmpresaSelecionada(null)} accessibilityLabel="Fechar detalhes">
                <Feather name="x" size={22} color={colors.muted} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.detailTitle}>{empresaSelecionada?.nome}</Text>
              {empresaSelecionada?.segmento ? <Text style={styles.detailSector}>{empresaSelecionada.segmento}</Text> : null}
              <Text style={styles.detailSectionTitle}>Sobre a empresa</Text>
              <Text style={styles.detailDescription}>
                {empresaSelecionada?.descricao || 'Esta empresa ainda não adicionou uma apresentação.'}
              </Text>
              <View style={styles.detailLocation}>
                <Feather name="map-pin" size={16} color={colors.primaryDark} />
                <Text style={styles.detailLocationText}>{empresaSelecionada?.endereco}</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.line },
  title: { color: colors.text, fontSize: 27, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 14, marginTop: 5 },
  list: { padding: 16, paddingBottom: 30 },
  companyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: colors.line },
  companyIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryWash, marginRight: 13 },
  companyLogoImage: { width: '100%', height: '100%', borderRadius: 14 },
  companyInfo: { flex: 1 },
  companyName: { color: colors.text, fontSize: 16, fontWeight: '800' },
  companyAddress: { color: colors.muted, fontSize: 12, marginTop: 4 },
  companyAction: { color: colors.primaryDark, fontSize: 12, fontWeight: '700', marginTop: 7 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyTitle: { color: colors.inkSoft, fontSize: 16, fontWeight: '700', marginTop: 14 },
  emptyText: { color: colors.muted, fontSize: 13, marginTop: 5 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 22, backgroundColor: 'rgba(0,0,0,0.35)' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  detailModal: { width: '100%', maxWidth: 440, maxHeight: '80%', padding: 20, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  detailIcon: { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primaryWash },
  detailTitle: { color: colors.text, fontSize: 21, fontWeight: '800' },
  detailSector: { color: colors.primaryDark, fontSize: 13, fontWeight: '700', marginTop: 4 },
  detailSectionTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginTop: 21, marginBottom: 6 },
  detailDescription: { color: colors.inkSoft, fontSize: 14, lineHeight: 21 },
  detailLocation: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.line },
  detailLocationText: { flex: 1, color: colors.muted, fontSize: 13 },
});
