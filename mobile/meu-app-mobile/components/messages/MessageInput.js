import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

const colors = Colors.light;

export default function MessageInput({ value, onChangeText, onSend }) {
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

const styles = StyleSheet.create({
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
    backgroundColor: colors.surfaceSoft,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
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