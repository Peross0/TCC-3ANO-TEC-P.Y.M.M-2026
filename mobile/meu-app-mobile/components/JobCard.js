import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

const colors = Colors.light;

export default function JobCard({ item }) {
  return (

    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.companyLogo, { backgroundColor: item.logoBg }]}>
          <Text style={[styles.logoText, { color: item.logoTextColor || colors.tint }]}>
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
          <Feather name="users" size={16} color={colors.muted} />
          <Text style={styles.vacancyText}>{item.vacancies}</Text>
        </View>

        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.bookmarkButton}>
            <Feather name="bookmark" size={18} color={colors.muted} />
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
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.line,
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
    color: colors.text,
  },
  companyCategory: {
    fontSize: 12,
    color: colors.muted,
  },
  timeAgo: {
    fontSize: 11,
    color: colors.muted,
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  jobDescription: {
    fontSize: 12,
    color: colors.inkSoft,
    marginBottom: 12,
    lineHeight: 16,
  },
  salary: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
    textAlign: 'right',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 12,
  },
  vacancyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vacancyText: {
    fontSize: 12,
    color: colors.muted,
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
    backgroundColor: colors.primaryWash,
    justifyContent: 'center',
    alignItems: 'center',
  },
  interestButton: {
    borderWidth: 1.5,
    borderColor: colors.tint,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  interestButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
});