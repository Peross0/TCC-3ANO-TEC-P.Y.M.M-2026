import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';

import Header from '../../components/Header';
import NotificationModal from '../../components/NotificationModal';
import ProfileMenuModal from '../../components/ProfileMenuModal';
import JobCard from '../../components/JobCard';

const INITIAL_JOBS = [
  {
    id: '1',
    company: 'Pires',
    category: 'Supermercado',
    timeAgo: 'Há 1 semana',
    createdAt: new Date('2026-07-24T10:00:00'),
    title: 'VAGA DE CAIXA',
    description: 'Procuramos jovens interessados e capacitados de preferência mulher',
    salary: 'R$ 2.120',
    vacancies: '3 vagas',
    logoBg: '#E3F2FD',
    logoTextColor: '#1565C0',
    isRemote: false,
  },
  {
    id: '2',
    company: 'Pinheirão',
    category: 'Supermercado',
    timeAgo: 'Há 2 dias',
    createdAt: new Date('2026-07-29T10:00:00'),
    title: 'VAGA DE REPOSITOR',
    description: 'Procuramos jovens interessados e capacitados para a vaga',
    salary: 'R$ 1.520',
    vacancies: '7 vagas',
    logoBg: '#E8F5E9',
    logoTextColor: '#2E7D32',
    isRemote: false,
  },
  {
    id: '3',
    company: 'iFood',
    category: 'Restaurante',
    timeAgo: 'Há 5 dias',
    createdAt: new Date('2026-07-26T10:00:00'),
    title: 'VAGA DE ENTREGADOR',
    description: 'Procuramos telemotos capacitados para ficar a noite inteira fazendo entregas',
    salary: 'R$ 1.000',
    vacancies: '2 vagas',
    logoBg: '#FFEBEE',
    logoTextColor: '#C62828',
    isRemote: false,
  },
];

export default function HomeScreen() {
  const [selectedFilter, setSelectedFilter] = useState('Para você');
  const [showNotification, setShowNotification] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSettingsActive, setIsSettingsActive] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [jobs, setJobs] = useState([]);

  const router = useRouter();

  useEffect(() => {
    setJobs(INITIAL_JOBS);
  }, []);

  const handleLogout = () => {
    setShowProfileMenu(false);
    setIsLoggingOut(true);

    setTimeout(() => {
      setIsLoggingOut(false);
      router.replace('/');
    }, 1000);
  };

  const handleGoToProfile = () => {
    setShowProfileMenu(false);
    router.push('/perfil');
  };

  const handleGoToSettings = () => {
    setIsSettingsActive(true);
    setShowNotification(false);
    setShowProfileMenu(false);

    setTimeout(() => {
      setIsSettingsActive(false);
      router.push('/configuracoes');
    }, 150);
  };

  const getFilteredJobs = () => {
    if (selectedFilter === 'Remotos') {
      return jobs.filter((job) => job.isRemote);
    }

    if (selectedFilter === 'Recentes') {
      return [...jobs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return jobs;
  };

  const filteredJobs = getFilteredJobs();

  return (
    <SafeAreaView style={styles.homeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <Modal visible={isLoggingOut} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#3BB7FF" />
            <Text style={styles.loadingText}>Saindo...</Text>
          </View>
        </View>
      </Modal>

      <Header
        showNotification={showNotification}
        onToggleNotification={() => {
          setShowProfileMenu(false);
          setShowNotification(!showNotification);
        }}
        onGoToSettings={handleGoToSettings}
        isSettingsActive={isSettingsActive}
        onToggleProfileMenu={() => {
          setShowNotification(false);
          setShowProfileMenu(!showProfileMenu);
        }}
      />

      <NotificationModal
        visible={showNotification}
        onClose={() => setShowNotification(false)}
      />

      <ProfileMenuModal
        visible={showProfileMenu}
        onClose={() => setShowProfileMenu(false)}
        onGoToProfile={handleGoToProfile}
        onLogout={handleLogout}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.homeContent}
      >
        <View style={styles.filterContainer}>
          {['Para você', 'Recentes', 'Remotos'].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.activeFilterChip,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.activeFilterText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filteredJobs.length > 0 ? (
          filteredJobs.map((job, index) => {
            const isHighlight = selectedFilter === 'Recentes' && index === 0;

            return (
              <View
                key={job.id}
                style={isHighlight ? styles.mostRecentHighlight : null}
              >
                {isHighlight && (
                  <View style={styles.recentBadge}>
                    <Text style={styles.recentBadgeText}>Mais recente</Text>
                  </View>
                )}
                <JobCard item={job} />
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Nenhuma vaga encontrada</Text>
            <Text style={styles.emptySubText}>
              Não há vagas disponíveis para a categoria selecionada no momento.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  homeContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#CCCCCC',
    backgroundColor: '#FFFFFF',
  },
  activeFilterChip: {
    backgroundColor: '#3BB7FF',
    borderColor: '#3BB7FF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  mostRecentHighlight: {
    borderWidth: 2,
    borderColor: '#3BB7FF',
    borderRadius: 22,
    marginBottom: 16,
    position: 'relative',
  },
  recentBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#3BB7FF',
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 10,
    zIndex: 1,
  },
  recentBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    elevation: 5,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});