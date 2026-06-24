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
            style={[
              styles.filtroPill, 
              filtro === item && styles.filtroPillActive
            ]}
            onPress={() => setFiltro(item)}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.filtroText, 
              filtro === item && styles.filtroTextActive
            ]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filtro === 'Remotos' ? (
          <View style={styles.noJobsCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="folder-open-outline" size={56} color="#bbb" />
            </View>
            <Text style={styles.noJobsTitle}>Nenhuma vaga encontrada</Text>
            <Text style={styles.noJobsSubtitle}>
              Tente mudar os filtros para ver mais oportunidades
            </Text>
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
    backgroundColor: '#ffffff',
    paddingTop: 30,
  },
  filtrosContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filtroPill: {
    paddingHorizontal: 17,
    paddingVertical: 2,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtroPillActive: {
    backgroundColor: colors.primary,
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  noJobsCard: {
    backgroundColor: '#fafafa',
    borderRadius: 24,
    paddingVertical: 185,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderWidth: 0,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  noJobsTitle: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  noJobsSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});