import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#777',
        tabBarStyle: styles.tabBar,
        headerShown: false,
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={24} 
              color={focused ? colors.primary : '#777'} 
            />
          ),
        }} 
      />
      <Tabs.Screen 
        name="messages" 
        options={{
          title: 'Mensagens',
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'} 
              size={24} 
              color={focused ? colors.primary : '#777'} 
            />
          ),
        }} 
      />
      <Tabs.Screen 
        name="companies" 
        options={{
          title: 'Empresas',
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name={focused ? 'briefcase' : 'briefcase-outline'} 
              size={24} 
              color={focused ? colors.primary : '#777'} 
            />
          ),
        }} 
      />
      <Tabs.Screen 
        name="about" 
        options={{
          title: 'Sobre',
          tabBarIcon: ({ focused }) => (
            <Ionicons 
              name={focused ? 'information-circle' : 'information-circle-outline'} 
              size={24} 
              color={focused ? colors.primary : '#777'} 
            />
          ),
        }} 
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 65,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});