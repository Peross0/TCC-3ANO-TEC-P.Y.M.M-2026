import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { SessionContext } from '../context/SessionContext';

function blurFocusedWebElement() {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.activeElement?.blur?.();
  }
}

export default function RootLayout() {
  const [sessionData, setSessionData] = useState(null);

  return (
    <SessionContext.Provider value={{ sessionData, setSessionData }}>
      <Stack
        screenListeners={{ blur: blurFocusedWebElement }}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="carregando" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SessionContext.Provider>
  );
}