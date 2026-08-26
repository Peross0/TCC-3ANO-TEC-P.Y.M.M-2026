import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function MessageHeader({ activeChat, onBack }) {
  if (!activeChat) return null;

  return (
    <View style={styles.chatHeader}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Feather name="arrow-left" size={22} color="#333" />
      </TouchableOpacity>

      <View style={[styles.avatarSmall, { backgroundColor: activeChat.logoBg || '#E3F2FD' }]}>
        <Text style={[styles.avatarTextSmall, { color: activeChat.logoTextColor || '#1565C0' }]}>
          {activeChat.company ? activeChat.company.charAt(0) : 'C'}
        </Text>
      </View>

      <View style={styles.chatHeaderInfo}>
        <Text style={styles.chatHeaderCompany}>{activeChat.company}</Text>
        <Text style={styles.chatHeaderJob}>{activeChat.jobTitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  backBtn: {
    paddingRight: 12,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTextSmall: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  chatHeaderInfo: {
    marginLeft: 10,
  },
  chatHeaderCompany: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
  },
  chatHeaderJob: {
    fontSize: 11,
    color: '#8E8E93',
  },
});