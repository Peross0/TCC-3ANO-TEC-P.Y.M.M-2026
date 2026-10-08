import React, { useState } from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

const colors = Colors.light;

export default function MessageHeader({ activeChat, onBack }) {
  const [failedLogoUri, setFailedLogoUri] = useState(null);
  if (!activeChat) return null;
  const showLogo = activeChat.companyLogoUri && failedLogoUri !== activeChat.companyLogoUri;

  return (
    <View style={styles.chatHeader}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Feather name="arrow-left" size={22} color={colors.text} />
      </TouchableOpacity>

      <View style={[styles.avatarSmall, { backgroundColor: activeChat.logoBg || colors.primaryWash }]}>
        {showLogo
          ? <Image source={{ uri: activeChat.companyLogoUri }} style={styles.companyLogoImage} onError={() => setFailedLogoUri(activeChat.companyLogoUri)} />
          : <Feather name="briefcase" size={18} color={colors.primaryDark} />}
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
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
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
  companyLogoImage: { width: '100%', height: '100%', borderRadius: 18 },
  chatHeaderInfo: {
    marginLeft: 10,
  },
  chatHeaderCompany: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  chatHeaderJob: {
    fontSize: 11,
    color: colors.muted,
  },
});