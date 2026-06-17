import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Button } from 'react-native'; 
import { NavigationContainer, useNavigation, NavigationIndependentTree } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// ==========================================
// 1. COMPONENTES DAS TELAS
// ==========================================

function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('Login'), 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={[styles.center, { backgroundColor: '#2196F3' }]}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#fff' }}>MEU APP</Text>
      <Text style={{ color: '#fff', marginTop: 10 }}>Carregando...</Text>
    </View>
  );
}

function LoginScreen({ navigation }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Tela de Login</Text>
      <Button title="Entrar no App" onPress={() => navigation.replace('Main')} />
    </View>
  );
}

function HomeScreen() { 
  const navigation = useNavigation();
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Início</Text>
      {/* Botões rápidos para testar as telas que têm o botão de voltar */}
      <Button title="Ver Meu Perfil" onPress={() => navigation.navigate('Profile')} />
      <View style={{ height: 10 }} />
      <Button title="Abrir Configurações" onPress={() => navigation.navigate('Settings')} />
    </View>
  ); 
}

function MessagesScreen({ navigation }) { 
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Mensagens</Text>
      <Button title="Abrir Chat" onPress={() => navigation.navigate('Chat')} />
    </View>
  ); 
}

function CompaniesScreen() { 
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Empresas</Text>
    </View>
  ); 
}

function AboutScreen() { 
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Sobre</Text>
    </View>
  ); 
}

// ---- TELAS INTERNAS COM O BOTÃO DE VOLTAR ----

function ChatScreen({ navigation }) { 
  return (
    <View style={styles.containerComVoltar}>
      {/* Barra superior customizada com o botão de voltar */}
      <View style={styles.headerCustom}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>⬅ Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
      </View>

      <View style={styles.center}>
        <Text style={styles.title}>Conversa do Chat</Text>
      </View>
    </View>
  ); 
}

function ProfileScreen({ navigation }) { 
  return (
    <View style={styles.containerComVoltar}>
      <View style={styles.headerCustom}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>⬅ Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
      </View>

      <View style={styles.center}>
        <Text style={styles.title}>Perfil do Usuário</Text>
      </View>
    </View>
  ); 
}

function SettingsScreen({ navigation }) { 
  return (
    <Layout activeTab="Sobre">
      <View style={styles.containerComVoltar}>
        <View style={styles.headerCustom}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>⬅ Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Configurações</Text>
        </View>

        <View style={styles.center}>
          <Text style={styles.title}>Configurações do Sistema</Text>
        </View>
      </View>
    </Layout>
  ); 
}

// ==========================================
// 2. SEU COMPONENTE LAYOUT PERSONALIZADO
// ==========================================

function Layout({ children, activeTab }) {
  const navigation = useNavigation();

  const tabs = [
    { name: 'Início', route: 'Main', tab: 'Início', icon: '🏠' },
    { name: 'Mensagens', route: 'Main', tab: 'Mensagens', icon: '✉️' },
    { name: 'Empresas', route: 'Main', tab: 'Empresas', icon: '🏢' },
    { name: 'Sobre', route: 'Main', tab: 'Sobre', icon: 'ℹ️' },
  ];

  return (
    <View style={styles.layoutContainer}>
      <View style={styles.content}>{children}</View>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={() => {
              if (activeTab !== tab.tab) {
                navigation.navigate(tab.route, { screen: tab.tab });
              }
            }}
          >
            <Text style={[styles.tabIcon, activeTab === tab.tab && styles.activeIcon]}>
              {tab.icon}
            </Text>
            <Text style={[styles.tabLabel, activeTab === tab.tab && styles.activeLabel]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ==========================================
// 3. ESTRUTURA DAS ABAS (BOTTOM TABS)
// ==========================================

const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconName;
          if (route.name === 'Início') iconName = focused ? '🏠' : '🏡';
          else if (route.name === 'Mensagens') iconName = focused ? '💬' : '✉️';
          else if (route.name === 'Empresas') iconName = focused ? '🏢' : '🏗️';
          else if (route.name === 'Sobre') iconName = focused ? 'ℹ️' : 'ⓘ';
          
          return <Text style={{ fontSize: 22 }}>{iconName}</Text>;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#f0f0f0',
          borderTopColor: '#ddd',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Mensagens" component={MessagesScreen} />
      <Tab.Screen name="Empresas" component={CompaniesScreen} />
      <Tab.Screen name="Sobre" component={AboutScreen} />
    </Tab.Navigator>
  );
}

// ==========================================
// 4. FLUXO PRINCIPAL DE NAVEGAÇÃO (STACK)
// ==========================================

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        {/* Ativei o gesto de arrastar para voltar nativo caso queira usar no iOS/Android */}
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false, gestureEnabled: true }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}

// ==========================================
// 5. ESTILOS ATUALIZADOS
// ==========================================

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  // Estilos da nossa barra de voltar customizada
  containerComVoltar: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40, // Espaço para não cobrir a barra de status do celular
  },
  headerCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  backButtonText: {
    color: '#2196F3',
    fontWeight: 'bold',
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  // Estilos do Layout antigo continuam aqui:
  layoutContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    height: 65,
    paddingBottom: 5,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    color: '#888',
  },
  activeIcon: {},
  activeLabel: {
    color: '#2196F3',
    fontWeight: '600',
  },
});