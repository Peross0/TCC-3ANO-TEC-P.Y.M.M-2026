import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function JobCard({ item }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.companyLogo, { backgroundColor: item.logoBg }]}>
          <Text style={[styles.logoText, { color: item.logoTextColor || '#1565C0' }]}>
            {item.company}
          </Text>
        </View>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{item.company}</Text>
          <Text style={styles.companyCategory}>{item.category}</Text>
        </View>
        <Text style={styles.timeAgo}>{item.timeAgo}</Text>
      </View>

      <Text style={styles.jobTitle}>{item.title}</Text>
      <Text style={styles.jobDescription}>{item.description}</Text>
      <Text style={styles.salary}>{item.salary}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.vacancyInfo}>
          <Feather name="users" size={16} color="#8E8E93" />
          <Text style={styles.vacancyText}>{item.vacancies}</Text>
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
  );
}

const styles = StyleSheet.create({
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