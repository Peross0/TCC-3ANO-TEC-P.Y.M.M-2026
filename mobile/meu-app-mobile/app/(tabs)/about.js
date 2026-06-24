import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sobre</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ padding: 20 }}>
        <View style={styles.logoSection}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>TECH</Text>
            <Text style={styles.logoSubtext}>— P.Y.M.M. —</Text>
          </View>
        </View>

        <Text style={styles.paragraph}>
          Nós da Tec P.Y.M.M somos uma empresa voltada para tecnologia e inovação no mercado.
        </Text>
        <Text style={styles.paragraph}>
          Esse aplicativo tem a intenção de facilitar o caminho para o jovem interessado em arrumar seu primeiro estágio.
        </Text>
        <Text style={styles.paragraph}>
          Focamos no bem estar dos nossos clientes e o público dos nossos clientes.
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#2196F3" />
            <Text style={styles.infoText}>contato@tecpymm.com</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="globe-outline" size={20} color="#2196F3" />
            <Text style={styles.infoText}>www.tecpymm.com</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#2196F3" />
            <Text style={styles.infoText}>Brasil</Text>
          </View>
        </View>

        <Text style={styles.version}>Versão 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  logoBox: {
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
    borderRadius: 15,
    width: '100%',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
  logoSubtext: {
    color: '#00D2FF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  paragraph: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#f7f7f7',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#aaa',
    marginTop: 10,
    marginBottom: 30,
  },
});