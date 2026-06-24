import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtrosContainer}
      >
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
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20 }}>
        {filtro === 'Remotos' ? (
          <View style={styles.noJobsCard}>
            <Ionicons name="folder-open-outline" size={48} color="#999" />
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
    paddingHorizontal: 15,
    marginVertical: 15,
    gap: 10,
  },
  filtroPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    borderWidth: 0,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filtroPillActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  filtroText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 14,
  },
  filtroTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  noJobsCard: {
    backgroundColor: '#fafafa',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  noJobsText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
    marginTop: 12,
  },
});