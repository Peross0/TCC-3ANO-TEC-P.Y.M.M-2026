import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { SessionContext } from '../context/SessionContext';

export default function RootLayout() {
  const [sessionData, setSessionData] = useState(null);

  return (
    <SessionContext.Provider value={{ sessionData, setSessionData }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="carregando" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SessionContext.Provider>
  );
}