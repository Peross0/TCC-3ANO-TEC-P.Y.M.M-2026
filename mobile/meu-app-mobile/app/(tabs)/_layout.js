import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
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
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Text style={{ fontSize: 20 }}>🏠</Text>
            </View>
          ),
        }} 
      />
      <Tabs.Screen 
        name="messages" 
        options={{
          title: 'Mensagens',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Text style={{ fontSize: 20 }}>✉️</Text>
            </View>
          ),
        }} 
      />
      <Tabs.Screen 
        name="companies" 
        options={{
          title: 'Empresas',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Text style={{ fontSize: 20 }}>🏢</Text>
            </View>
          ),
        }} 
      />
      <Tabs.Screen 
        name="about" 
        options={{
          title: 'Sobre',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Text style={{ fontSize: 20 }}>ℹ️</Text>
            </View>
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
  iconContainer: {
    padding: 6,
    borderRadius: 12,
  },
  iconContainerActive: {
    backgroundColor: '#e3f2fd',
  },
});