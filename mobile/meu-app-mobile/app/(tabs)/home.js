import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function HomeScreen() {
  const [selectedFilter, setSelectedFilter] = useState('Para você');

  return (
    <SafeAreaView style={styles.homeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#8E8E93" />
          <TextInput
            placeholder="Pesquisa"
            placeholderTextColor="#8E8E93"
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity style={styles.headerIconBtn}>
          <Feather name="bell" size={24} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIconBtn}>
          <Feather name="settings" size={24} color="#555" />
        </TouchableOpacity>
        <View style={styles.avatarContainer}>
          <Feather name="user" size={24} color="#333" />
        </View>
      </View>

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

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.companyLogo, { backgroundColor: '#E3F2FD' }]}>
              <Text style={styles.logoText}>Pires</Text>
            </View>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>Pires</Text>
              <Text style={styles.companyCategory}>Supermercado</Text>
            </View>
            <Text style={styles.timeAgo}>Há 1 semana</Text>
          </View>
          <Text style={styles.jobTitle}>VAGA DE CAIXA</Text>
          <Text style={styles.jobDescription}>
            Procuramos jovens interessados e capacitados de preferência mulher
          </Text>
          <Text style={styles.salary}>R$ 2.120</Text>
          <View style={styles.cardFooter}>
            <View style={styles.vacancyInfo}>
              <Feather name="users" size={16} color="#8E8E93" />
              <Text style={styles.vacancyText}>3 vagas</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.bookmarkButton}>
                <Feather name="bookmark" size={18} color="#8E8E93" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.interestButton}>
                <Text style={styles.interestButtonText}>Tenho interesse</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.companyLogo, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.logoText, { color: '#2E7D32' }]}>
                Pinheirão
              </Text>
            </View>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>Pinheirão</Text>
              <Text style={styles.companyCategory}>Supermercado</Text>
            </View>
            <Text style={styles.timeAgo}>Há 2 dias</Text>
          </View>
          <Text style={styles.jobTitle}>VAGA DE REPOSITOR</Text>
          <Text style={styles.jobDescription}>
            Procuramos jovens interessados e capacitados para a vaga
          </Text>
          <Text style={styles.salary}>R$ 1.520</Text>
          <View style={styles.cardFooter}>
            <View style={styles.vacancyInfo}>
              <Feather name="users" size={16} color="#8E8E93" />
              <Text style={styles.vacancyText}>7 vagas</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.bookmarkButton}>
                <Feather name="bookmark" size={18} color="#8E8E93" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.interestButton}>
                <Text style={styles.interestButtonText}>Tenho interesse</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.companyLogo, { backgroundColor: '#FFEBEE' }]}>
              <Text style={[styles.logoText, { color: '#C62828' }]}>iFood</Text>
            </View>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>iFood</Text>
              <Text style={styles.companyCategory}>Restaurante</Text>
            </View>
            <Text style={styles.timeAgo}>Há 1 semana</Text>
          </View>
          <Text style={styles.jobTitle}>VAGA DE ENTREGADOR</Text>
          <Text style={styles.jobDescription}>
            Procuramos telemotos capacitados para ficar a noite inteira fazendo entregas
          </Text>
          <Text style={styles.salary}>R$ 1.000</Text>
          <View style={styles.cardFooter}>
            <View style={styles.vacancyInfo}>
              <Feather name="users" size={16} color="#8E8E93" />
              <Text style={styles.vacancyText}>2 vagas</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.bookmarkButton}>
                <Feather name="bookmark" size={18} color="#8E8E93" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.interestButton}>
                <Text style={styles.interestButtonText}>Tenho interesse</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FAFAFA',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333333',
  },
  headerIconBtn: {
    padding: 4,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8BB4F7',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
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
  card: {
    backgroundColor: '#F7F7F7',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1565C0',
  },
  companyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
  },
  companyCategory: {
    fontSize: 12,
    color: '#8E8E93',
  },
  timeAgo: {
    fontSize: 11,
    color: '#8E8E93',
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 6,
  },
  jobDescription: {
    fontSize: 12,
    color: '#777777',
    marginBottom: 12,
    lineHeight: 16,
  },
  salary: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3BB7FF',
    textAlign: 'right',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EBEBEB',
    paddingTop: 12,
  },
  vacancyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vacancyText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bookmarkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBEBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  interestButton: {
    borderWidth: 1.5,
    borderColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  interestButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007AFF',
  },
});