import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Platform } from 'react-native';
import { useAppPreferences } from '../../context/PreferencesContext';

function blurFocusedWebElement() {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.activeElement?.blur?.();
  }
}

export default function TabLayout() {
  const { colors } = useAppPreferences();

  return (
    <Tabs
      screenListeners={{
        blur: blurFocusedWebElement,
      }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.muted,
        // Remove os rótulos de texto de todas as abas globalmente
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          height: Platform.OS === 'ios' ? 84 : 64, // Altura confortável sem os texto
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index1"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="mail" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index2"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="business" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index3"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}