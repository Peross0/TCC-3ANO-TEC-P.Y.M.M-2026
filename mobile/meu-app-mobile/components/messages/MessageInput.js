import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppPreferences } from '../../context/PreferencesContext';

export default function MessageInput({ value, onChangeText, onSend }) {
  const { colors, preferences } = useAppPreferences();
  const styles = makeStyles(colors, preferences.large_text);

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        placeholder="Escreva uma mensagem..."
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
      />
      <TouchableOpacity style={styles.sendButton} onPress={onSend}>
        <Feather name="send" size={18} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

function makeStyles(colors, largeText) {
  const scale = largeText ? 1.12 : 1;
  return StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14 * scale,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  });
}