import { Stack } from 'expo-router';
import { useState } from 'react';
import { Platform } from 'react-native';
import { PreferencesProvider } from '../context/PreferencesContext';
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
      <PreferencesProvider userId={sessionData?.user?.id}>
        <Stack
          screenListeners={{ blur: blurFocusedWebElement }}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="carregando" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </PreferencesProvider>
    </SessionContext.Provider>
  );
}