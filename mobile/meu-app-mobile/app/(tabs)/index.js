import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import CustomHeader from '../../components/CustomHeader';
import JobCard from '../../components/JobCard';
import { vagas } from '../../constants/mockData';
import { colors } from '../../constants/colors';

export default function HomeScreen() {
  const router = useRouter();
  const [filtro, setFiltro] = useState('Para você');

  return (
    <View style={styles.container}>
      <CustomHeader 
        onProfilePress={() => router.push('/profile')} 
        onSettingsPress={() => router.push('/settings')} 
      />
      
      <View style={styles.filtrosContainer}>
        {['Para você', 'Recentes', 'Remotos'].map((item) => (
          <TouchableOpacity 
            key={item} 
            style={[styles.filtroPill, filtro === item && styles.filtroPillActive]}
            onPress={() => setFiltro(item)}
          >
            <Text style={[styles.filtroText, filtro === item && styles.filtroTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20 }}>
        {filtro === 'Remotos' ? (
          <View style={styles.noJobsCard}>
            <Text style={styles.noJobsText}>Nenhuma vaga encontrada</Text>
          </View>
        ) : (
          vagas.map((vaga) => (
            <JobCard key={vaga.id} vaga={vaga} />
          ))
        )}
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
  filtrosContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  filtroPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
  },
  filtroPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filtroText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 13,
  },
  filtroTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noJobsCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  noJobsText: {
    fontSize: 16,
    color: '#777',
    fontWeight: '500',
  },
});