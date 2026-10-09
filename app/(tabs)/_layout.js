import { useContext } from 'react';
import { Redirect, Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Platform } from 'react-native';
import { Colors } from '../../constants/theme';
import { SessionContext } from '../../context/SessionContext';

function blurFocusedWebElement() {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.activeElement?.blur?.();
  }
}

export default function TabLayout() {
  const { sessionData } = useContext(SessionContext);

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
        tabBarActiveTintColor: Colors.light.tint,
        tabBarInactiveTintColor: Colors.light.muted,
        tabBarStyle: { backgroundColor: Colors.light.surface, borderTopColor: Colors.light.line },
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
          title: 'Sobre',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="info" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}