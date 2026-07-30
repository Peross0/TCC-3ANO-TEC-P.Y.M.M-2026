import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Tela de Login/Loading sem abas */}
      <Stack.Screen name="index" />
      {/* Grupo com a navegação por abas */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}