import React, { useEffect, useState } from 'react';
import { 
  Text, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  SafeAreaView, 
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native'; 
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// ==========================================
// 1. COMPONENTES DAS TELAS (FLUXO PRINCIPAL)
// ==========================================

function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('Login'), 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={[styles.center, { backgroundColor: '#000000' }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.logoPlaceholder}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>TECH P.Y.M.M.</Text>
      </View>
    </View>
  );
}

function LoginScreen({ navigation }) {
  const [tipoUsuario, setTipoUsuario] = useState('Candidato');

  return (
    <SafeAreaView style={styles.loginContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Text style={styles.topSubtitle}>Encontre seu estágio ideal</Text>

      <View style={styles.selectorContainer}>
        <TouchableOpacity 
          style={[styles.selectorButton, tipoUsuario === 'Candidato' && styles.selectorActive]}
          onPress={() => setTipoUsuario('Candidato')}
        >
          <Text style={[styles.selectorText, tipoUsuario === 'Candidato' && styles.selectorTextActive]}>
            👤 Candidato
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.selectorButton, tipoUsuario === 'Empresário' && styles.selectorActive]}
          onPress={() => setTipoUsuario('Empresário')}
        >
          <Text style={[styles.selectorText, tipoUsuario === 'Empresário' && styles.selectorTextActive]}>
            💼 Empresário
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.welcomeText}>Seja bem-vindo</Text>
        <Text style={styles.formInstruction}>Entre na sua conta de {tipoUsuario.toLowerCase()}</Text>

        <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor="#999" />
        <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#999" secureTextEntry />

        <TouchableOpacity style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonEntrar} onPress={() => navigation.replace('Main')}>
          <Text style={styles.buttonEntrarText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function HomeScreen() { 
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Início</Text>
    </View>
  ); 
}

// ==========================================
// TELA DE LISTA DE MENSAGENS (FIEI AO CANVA)
// ==========================================
function MessagesScreen({ navigation }) { 
  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f2f5" />
      
      {/* Top Bar idêntica ao Canva com sombra e cantos retos/suaves */}
      <View style={styles.canvaHeader}>
        <View style={styles.searchBarContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput 
            placeholder="Pesquisar" 
            placeholderTextColor="#a0a0a0" 
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView style={styles.contentScroll}>
        <Text style={styles.pageTitle}>Mensagens</Text>

        {/* Card de Conversa: Pinheirão */}
        <TouchableOpacity 
          style={styles.chatListItem} 
          onPress={() => navigation.navigate('Chat')}
        >
          {/* Se tiver a imagem salva: source={require('./assets/pinheirao.png')} */}
          <Image 
            source={{ uri: 'https://via.placeholder.com/150/0f6836/ffffff?text=Pinheirao' }} 
            style={styles.companyLogo} 
          />
          <View style={styles.chatItemDetails}>
            <Text style={styles.companyNameText}>Pinheirão</Text>
            <Text style={styles.timeAgoText}>visto há 23 min</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  ); 
}

// ==========================================
// TELA DE CHAT DETALHADO (FIEI AO CANVA)
// ==========================================
function ChatScreen({ navigation }) { 
  return (
    <KeyboardAvoidingView 
      style={styles.mainContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header Superior com Seta, Logo da Empresa e Ícones de Mídia */}
        <View style={styles.chatHeaderContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backArrow}>
            <Text style={styles.arrowIconText}>←</Text>
          </TouchableOpacity>

          <Image 
            source={{ uri: 'https://via.placeholder.com/150/0f6836/ffffff?text=Pinheirao' }} 
            style={styles.chatHeaderLogo} 
          />

          <View style={styles.chatHeaderMeta}>
            <Text style={styles.chatHeaderTitle}>Pinheirão</Text>
            <Text style={styles.chatHeaderSubtitle}>Online há 23 min</Text>
          </View>

          <View style={styles.headerMediaIcons}>
            <TouchableOpacity style={styles.mediaIconClick}><Text style={styles.mediaEmoji}>📞</Text></TouchableOpacity>
            <TouchableOpacity style={styles.mediaIconClick}><Text style={styles.mediaEmoji}>📹</Text></TouchableOpacity>
          </View>
        </View>

        {/* Área Central de Conversas (Vazia no Canvas) */}
        <View style={styles.messagesBody} />

        {/* Input Bar Inferior Oval Cinza */}
        <View style={styles.bottomInputWrapper}>
          <View style={styles.canvaInputBubble}>
            <TouchableOpacity style={styles.blueCameraButton}>
              <Text style={styles.cameraIconColor}>📷</Text>
            </TouchableOpacity>
            
            <TextInput 
              placeholder="Mensagem" 
              placeholderTextColor="#909090" 
              style={styles.canvaTextInputField}
            />

            <TouchableOpacity style={styles.rightBubbleIcon}><Text style={{ fontSize: 18 }}>🎙️</Text></TouchableOpacity>
            <TouchableOpacity style={styles.rightBubbleIcon}><Text style={{ fontSize: 18 }}>📑</Text></TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  ); 
}

function CompaniesScreen() { return <View style={styles.center}><Text style={styles.title}>Empresas</Text></View>; }
function AboutScreen() { return <View style={styles.center}><Text style={styles.title}>Sobre</Text></View>; }
function ProfileScreen() { return <View style={styles.center}><Text style={styles.title}>Perfil</Text></View>; }
function SettingsScreen() { return <View style={styles.center}><Text style={styles.title}>Configurações</Text></View>; }

// ==========================================
// 2. CONFIGURAÇÃO DAS ABAS (BOTTOM TABS)
// ==========================================
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconName;
          if (route.name === 'Início') iconName = focused ? '🔵' : '⚪';
          else if (route.name === 'Mensagens') iconName = focused ? '🔷' : '✉️';
          else if (route.name === 'Empresas') iconName = focused ? '🏢' : '🏗️';
          else if (route.name === 'Sobre') iconName = focused ? 'ℹ️' : 'ⓘ';
          return <Text style={{ fontSize: 20 }}>{iconName}</Text>;
        },
        tabBarActiveTintColor: '#38b6ff',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { height: 65, paddingBottom: 8, paddingTop: 8, backgroundColor: '#e0e0e0' },
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
// 3. ESTRUTURA DE NAVEGAÇÃO
// ==========================================
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ==========================================
// 4. FOLHA DE ESTILOS FIÉIS AO CANVA
// ==========================================
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mainContainer: { flex: 1, backgroundColor: '#ffffff' },
  logoPlaceholder: { width: 150, height: 150, justifyContent: 'center', alignItems: 'center' },
  
  // Estilos Base do Login
  loginContainer: { flex: 1, backgroundColor: '#ffffff', alignItems: 'center', paddingHorizontal: 25 },
  topSubtitle: { fontSize: 16, color: '#888', fontWeight: 'bold', marginTop: 40, marginBottom: 25 },
  selectorContainer: { flexDirection: 'row', backgroundColor: '#eeeeee', borderRadius: 15, padding: 5, width: '100%', marginBottom: 40 },
  selectorButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  selectorActive: { backgroundColor: '#ffffff' },
  selectorText: { fontSize: 15, color: '#777', fontWeight: '600' },
  selectorTextActive: { color: '#38b6ff' },
  formContainer: { width: '100%', flex: 1 },
  welcomeText: { fontSize: 28, fontWeight: 'bold', color: '#000000' },
  formInstruction: { fontSize: 15, color: '#666', marginTop: 4, marginBottom: 25 },
  input: { width: '100%', height: 52, borderWidth: 1, borderColor: '#ccc', borderRadius: 12, paddingHorizontal: 15, marginBottom: 16 },
  forgotPasswordContainer: { alignSelf: 'flex-end', marginBottom: 30 },
  forgotPasswordText: { color: '#38b6ff' },
  buttonEntrar: { width: '100%', height: 54, backgroundColor: '#38b6ff', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonEntrarText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },

  // ALINHAMENTO FIEL - LISTA DE MENSAGENS
  canvaHeader: {
    backgroundColor: '#f6f6f6',
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 44,
    borderWidth: 1,
    borderColor: '#e3e3e3',
  },
  searchIcon: { marginRight: 10, fontSize: 16, color: '#888' },
  searchInput: { flex: 1, fontSize: 16, color: '#000' },
  contentScroll: { flex: 1, paddingHorizontal: 24 },
  pageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8e8e93',
    marginTop: 25,
    marginBottom: 20,
  },
  chatListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  companyLogo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 16,
    backgroundColor: '#f0f0f0',
  },
  chatItemDetails: { flex: 1 },
  companyNameText: { fontSize: 18, fontWeight: 'bold', color: '#1c1c1e' },
  timeAgoText: { fontSize: 14, color: '#9a9a9f', marginTop: 3 },

  // ALINHAMENTO FIEL - JANELA DE CHAT
  chatHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  backArrow: { paddingRight: 14 },
  arrowIconText: { fontSize: 26, color: '#000', fontWeight: '300' },
  chatHeaderLogo: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  chatHeaderMeta: { flex: 1 },
  chatHeaderTitle: { fontSize: 17, fontWeight: '700', color: '#000' },
  chatHeaderSubtitle: { fontSize: 12, color: '#8e8e93', marginTop: 1 },
  headerMediaIcons: { flexDirection: 'row', alignItems: 'center' },
  mediaIconClick: { marginLeft: 16, padding: 4 },
  mediaEmoji: { fontSize: 22 },
  messagesBody: { flex: 1, backgroundColor: '#ffffff' },
  bottomInputWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  canvaInputBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f3',
    borderRadius: 26,
    paddingHorizontal: 8,
    height: 50,
  },
  blueCameraButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#38b6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconColor: { fontSize: 18, color: '#fff' },
  canvaTextInputField: { flex: 1, paddingHorizontal: 14, fontSize: 16, color: '#000' },
  rightBubbleIcon: { paddingHorizontal: 10, paddingVertical: 4 },
  title: { fontSize: 24, fontWeight: 'bold' }
});