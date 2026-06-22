import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import CustomHeader from '../../components/CustomHeader';
import CompanyCard from '../../components/CompanyCard';
import { empresasParceiras } from '../../constants/mockData';

export default function CompaniesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <CustomHeader 
        onProfilePress={() => router.push('/profile')} 
        onSettingsPress={() => router.push('/settings')} 
      />
      <View style={{ padding: 20 }}>
        <Text style={styles.sectionTitle}>Empresas parceiras</Text>
        {empresasParceiras.map((empresa, idx) => (
          <CompanyCard key={idx} nome={empresa} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#555',
    marginBottom: 20,
  },
});