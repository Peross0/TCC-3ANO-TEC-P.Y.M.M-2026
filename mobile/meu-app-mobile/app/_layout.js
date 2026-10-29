import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { SessionContext } from '../context/SessionContext';
import { PreferencesProvider } from '../context/PreferencesContext';

function blurFocusedWebElement() {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.activeElement?.blur?.();
  }
}

export default function RootLayout() {
  const [sessionData, setSessionData] = useState(null);

  return (
    <SessionContext.Provider value={{ sessionData, setSessionData }}>
      <PreferencesProvider userId={sessionData?.user?.id}>
        <Stack
          screenListeners={{
            blur: blurFocusedWebElement,
          }}
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            // Opcional: define uma cor de fundo padrão para evitar flashes brancos durante a transição de tela
            contentStyle: { backgroundColor: 'transparent' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="carregando" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </PreferencesProvider>
    </SessionContext.Provider>
  );
}