import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Redirect, Tabs } from 'expo-router';
import { useContext } from 'react';
import { Platform } from 'react-native';
import { useAppPreferences } from '../../context/PreferencesContext';
import { SessionContext } from '../../context/SessionContext';

function blurFocusedWebElement() {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.activeElement?.blur?.();
  }
}

export default function TabLayout() {
  const { sessionData } = useContext(SessionContext);
  const { colors } = useAppPreferences();

  if (sessionData?.user?.user_type !== 'CANDIDATE') {
    return <Redirect href="/carregando" />;
  }

  return (
    <Tabs
      screenListeners={{
        blur: blurFocusedWebElement,
      }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.line },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index1"
        options={{
          title: 'Mensagens',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="mail" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index2"
        options={{
          title: 'Empresas',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="business" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index3"
        options={{
          title: 'Conta e configurações',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}