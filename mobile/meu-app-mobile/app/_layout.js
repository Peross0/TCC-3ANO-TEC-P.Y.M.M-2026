import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  Image, 
  Dimensions 
} from 'react-native'; 
import { NavigationContainer, useNavigation, NavigationIndependentTree } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const { width } = Dimensions.get('window');

// ==========================================
// COMPONENTE DE CABEÇALHO PADRÃO DO APP
// ==========================================
function CustomHeader({ onProfilePress, onSettingsPress }) {
  return (
    <View style={styles.appHeader}>
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput placeholder="Pesquisa" style={styles.searchInput} placeholderTextColor="#888" />
      </View>
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.headerIconButton}>
          <Text style={styles.iconText}>🔔</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIconButton} onPress={onSettingsPress}>
          <Text style={styles.iconText}>⚙️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatarButton} onPress={onProfilePress}>
          <View style={styles.avatarPlaceholder}>
            <Text style={{ fontSize: 16 }}>👤</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ==========================================
// 1. COMPONENTES DAS TELAS REAIS
// ==========================================

function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('Login'), 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={[styles.center, { backgroundColor: '#000' }]}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoTextText}>TECH</Text>
        <Text style={styles.logoSubtext}>— P.Y.M.M. —</Text>
      </View>
    </View>
  );
}

function LoginScreen({ navigation }) {
  const [tipoUser, setTipoUser] = useState('Candidato');

  return (
    <View style={styles.loginContainer}>
      <Text style={styles.loginTopText}>Encontre seu estágio ideal</Text>
      
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleBtn, tipoUser === 'Candidato' && styles.toggleActive]} 
          onPress={() => setTipoUser('Candidato')}
        >
          <Text style={[styles.toggleBtnText, tipoUser === 'Candidato' && styles.toggleActiveText]}>👤 Candidato</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleBtn, tipoUser === 'Empresário' && styles.toggleActive]} 
          onPress={() => setTipoUser('Empresário')}
        >
          <Text style={[styles.toggleBtnText, tipoUser === 'Empresário' && styles.toggleActiveText]}>💼 Empresário</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.welcomeTitle}>Seja bem-vindo</Text>
        <Text style={styles.welcomeSubtitle}>Entre na sua conta de {tipoUser.toLowerCase()}</Text>

        <TextInput placeholder="E-mail" style={styles.input} placeholderTextColor="#aaa" />
        <TextInput placeholder="Senha" secureTextEntry style={styles.input} placeholderTextColor="#aaa" />

        <TouchableOpacity style={{ alignItems: 'flex-end', marginBottom: 30 }}>
          <Text style={styles.forgotText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPrimary} onPress={() => navigation.replace('Main')}>
          <Text style={styles.buttonPrimaryText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ alignItems: 'center', marginTop: 15 }}>
          <Text style={styles.registerText}>Não tem conta? <Text style={{ color: '#2196F3', fontWeight: 'bold' }}>Criar conta</Text></Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerTerms}>
        Ao entrar ou criar uma conta você concorda com os <Text style={{ textDecorationLine: 'underline' }}>Termos de Uso</Text> e <Text style={{ textDecorationLine: 'underline' }}>Política de Privacidade</Text>
      </Text>
    </View>
  );
}

function HomeScreen() { 
  const navigation = useNavigation();
  const [filtro, setFiltro] = useState('Para você');

  const vagas = [
    { id: '1', empresa: 'Pinheirão', segmento: 'Supermercado', vaga: 'VAGA DE REPOSITOR', desc: 'Procuramos jovens interessados e capacitados para a vaga', valor: 'R$ 1.520', tempo: 'Há 2 dias' },
    { id: '2', empresa: 'Pires', segmento: 'Supermercado', vaga: 'VAGA DE CAIXA', desc: 'Procuramos jovens interessados e capacitados de preferencia mulher', valor: 'R$ 2.120', tempo: 'Há 1 semana' },
    { id: '3', empresa: 'Ifood', segmento: 'Restaurante', vaga: 'VAGA DE ENTREGADOR', desc: 'Procuramos telemotos capacitados para ficar a noite inteira fazendo entregas', valor: 'R$ 1.000', tempo: 'Há 1 semana' },
  ];

  return (
    <View style={styles.containerTela}>
      <CustomHeader 
        onProfilePress={() => navigation.navigate('Profile')} 
        onSettingsPress={() => navigation.navigate('Settings')} 
      />
      
      <View style={styles.subHeaderFiltros}>
        {['Para você', 'Recentes', 'Remotos'].map((item) => (
          <TouchableOpacity 
            key={item} 
            style={[styles.filtroPill, filtro === item && styles.filtroPillActive]}
            onPress={() => setFiltro(item)}
          >
            <Text style={[styles.filtroText, filtro === item && styles.filtroTextActive]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20 }}>
        {filtro === 'Remotos' ? (
          <View style={styles.noJobsCard}>
            <Text style={styles.noJobsText}>Nenhuma vaga encontrada</Text>
          </View>
        ) : (
          vagas.map((vaga) => (
            <View key={vaga.id} style={styles.vagaCard}>
              <View style={styles.vagaHeader}>
                <View style={styles.vagaEmpresaBadge}>
                  <View style={[styles.avatarPlaceholder, { width: 30, height: 30, marginRight: 8 }]} />
                  <View>
                    <Text style={styles.vagaEmpresaNome}>{vaga.empresa}</Text>
                    <Text style={styles.vagaEmpresaSeg}>{vaga.segmento}</Text>
                  </View>
                </View>
                <Text style={styles.vagaTempo}>{vaga.tempo}</Text>
              </View>

              <Text style={styles.vagaTituloText}>{vaga.vaga}</Text>
              <Text style={styles.vagaDescricaoText}>{vaga.desc}</Text>

              <View style={styles.vagaFooter}>
                <Text style={styles.vagaQtd}>👥 3 vagas</Text>
                <View style={styles.vagaFooterRight}>
                  <Text style={styles.vagaValor}>{vaga.valor}</Text>
                  <TouchableOpacity style={styles.interesseBtn}>
                    <Text style={styles.interesseBtnText}>Tenho interesse</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  ); 
}

function MessagesScreen({ navigation }) { 
  return (
    <View style={styles.containerTela}>
      <CustomHeader 
        onProfilePress={() => navigation.navigate('Profile')} 
        onSettingsPress={() => navigation.navigate('Settings')} 
      />
      <View style={{ padding: 20 }}>
        <Text style={styles.sectionTitle}>Mensagens</Text>
        
        <TouchableOpacity style={styles.chatRow} onPress={() => navigation.navigate('Chat')}>
          <View style={[styles.avatarPlaceholder, { width: 50, height: 50, marginRight: 15 }]} />
          <View>
            <Text style={styles.chatName}>Pinheirão</Text>
            <Text style={styles.chatStatus}>visto há 23 min</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  ); 
}

function CompaniesScreen() { 
  const navigation = useNavigation();
  return (
    <View style={styles.containerTela}>
      <CustomHeader 
        onProfilePress={() => navigation.navigate('Profile')} 
        onSettingsPress={() => navigation.navigate('Settings')} 
      />
      <View style={{ padding: 20 }}>
        <Text style={styles.sectionTitle}>Empresas parceiras</Text>
        {['Pires', 'Ifood'].map((empresa, idx) => (
          <View key={idx} style={styles.empresaCardSimples}>
            <View style={[styles.avatarPlaceholder, { width: 40, height: 40, marginRight: 15 }]} />
            <Text style={styles.empresaCardNome}>{empresa}</Text>
          </View>
        ))}
      </View>
    </View>
  ); 
}

function AboutScreen() { 
  return (
    <View style={styles.containerTela}>
      <ScrollView style={{ padding: 20 }}>
        <Text style={[styles.sectionTitle, { fontSize: 32, textDecorationLine: 'underline' }]}>Sobre</Text>
        <Text style={styles.aboutParagraph}>
          Nós da Tec P.Y.M.M somos uma empresa voltada para tecnologia e inovação no mercado.
        </Text>
        <Text style={styles.aboutParagraph}>
          esse aplicativo tem a intenção de facilitar o caminho para o jovem interessado em arrumar seu primeiro estágio.
        </Text>
        <Text style={styles.aboutParagraph}>
          focamos no bem estar dos nossos clientes e o publico dos nossos clientes.
        </Text>
      </ScrollView>
    </View>
  ); 
}

// ---- TELAS INTERNAS COM O BOTÃO DE VOLTAR ----

function ChatScreen({ navigation }) { 
  return (
    <View style={styles.containerComVoltar}>
      <View style={styles.headerCustom}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={[styles.avatarPlaceholder, { width: 35, height: 35, marginLeft: 15, marginRight: 10 }]} />
        <View>
          <Text style={styles.headerTitleChat}>Pinheirão</Text>
          <Text style={{ fontSize: 10, color: '#888' }}>Online há 23 min</Text>
        </View>
        <View style={styles.chatHeaderIcons}>
          <Text style={{ fontSize: 20, marginRight: 15 }}>📞</Text>
          <Text style={{ fontSize: 20 }}>📹</Text>
        </View>
      </View>

      <View style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
        {/* Espaço das mensagens do Chat */}
      </View>

      <View style={styles.inputChatContainer}>
        <TouchableOpacity style={styles.chatActionBtn}>
          <Text style={{ fontSize: 20, color: '#fff' }}>📷</Text>
        </TouchableOpacity>
        <TextInput placeholder="Mensagem" style={styles.inputChat} placeholderTextColor="#888" />
        <Text style={{ fontSize: 20, marginRight: 10 }}>🎙️</Text>
        <Text style={{ fontSize: 20 }}>📄</Text>
      </View>
    </View>
  ); 
}

function ProfileScreen({ navigation }) { 
  return (
    <View style={styles.containerComVoltar}>
      <View style={[styles.headerCustom, { justifyContent: 'space-between' }]}>
        <View style={styles.profileHeaderBadge}>
          <Text style={styles.profileHeaderText}>Perfil</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 20, marginRight: 15 }}>🔔</Text>
          <Text style={{ fontSize: 20, marginRight: 15 }}>⚙️</Text>
          <Text style={{ fontSize: 20, color: '#2196F3' }}>✏️</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 20 }}>
        <View style={styles.bigAvatarContainer}>
          <View style={styles.bigAvatar}>
            <Text style={{ fontSize: 60 }}>👤</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Text style={styles.changePhotoText}>Mudar foto</Text>
        </TouchableOpacity>

        <View style={styles.profileInputGroup}>
          <Text style={styles.profileLabel}>Nome</Text>
          <View style={styles.profileLine} />
        </View>

        <View style={styles.profileInputGroup}>
          <Text style={styles.profileLabel}>Gênero</Text>
          <View style={styles.profileLine} />
        </View>

        <View style={[styles.profileInputGroup, { marginTop: 20 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[styles.profileLabel, { color: '#666' }]}>Breve descrição</Text>
            <Text style={{ color: '#aaa' }}>0 / 300</Text>
          </View>
          <View style={[styles.profileLine, { marginTop: 35 }]} />
        </View>

        <View style={styles.curriculoBox}>
          <Text style={styles.curriculoText}>Curriculo</Text>
          <Text style={{ fontSize: 22 }}>📎</Text>
        </View>

        <View style={styles.uploadMockBox}>
          <Text style={{ color: '#aaa', fontSize: 12 }}>Arraste arquivos para fazer upload ou selecione</Text>
          <View style={styles.mockUploadBtn}>
            <Text style={{ color: '#fff', fontSize: 12 }}>Procurar</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  ); 
}

function SettingsScreen({ navigation }) { 
  const itensMenu = [
    { label: 'Salvos', icon: '🔖' },
    { label: 'Preferencias', icon: '🎛️' },
    { label: 'Tema', icon: '🖌️' },
    { label: 'Acessibilidade', icon: '♿' },
    { label: 'Ajuda', icon: '❓' },
    { label: 'Sobre', icon: 'ℹ️', action: () => navigation.navigate('Main', { screen: 'Sobre' }) },
  ];

  return (
    <View style={styles.containerComVoltar}>
      <CustomHeader 
        onProfilePress={() => navigation.navigate('Profile')} 
        onSettingsPress={() => {}} 
      />
      
      <View style={{ paddingVertical: 10 }}>
        {itensMenu.map((item, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={styles.menuItemRow}
            onPress={item.action ? item.action : null}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 15 }}>{item.icon}</Text>
              <Text style={styles.menuItemLabel}>{item.label}</Text>
            </View>
            <Text style={{ fontSize: 18, color: '#000', fontWeight: 'bold' }}>➔</Text>
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
          if (route.name === 'Início') iconName = '🏠';
          else if (route.name === 'Mensagens') iconName = '✉️';
          else if (route.name === 'Empresas') iconName = '🏢';
          else if (route.name === 'Sobre') iconName = 'ℹ️';
          
          return (
            <View style={[styles.tabIconWrapper, focused && styles.tabIconWrapperActive]}>
              <Text style={{ fontSize: 20, color: focused ? '#2196F3' : '#555' }}>{iconName}</Text>
            </View>
          );
        },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#777',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        style: styles.bottomTabBarStyle,
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
// 5. ESTILOS ACURADOS (FIEL AO DESIGN DO PRINT)
// ==========================================

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerTela: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
  },
  containerComVoltar: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
  },
  // SPLASH 
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTextText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
  logoSubtext: {
    color: '#00D2FF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  // LOGIN
  loginContainer: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 25,
    justifyContent: 'center',
  },
  loginTopText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 25,
    padding: 4,
    marginBottom: 35,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 22,
  },
  toggleActive: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  toggleBtnText: {
    color: '#777',
    fontWeight: '500',
  },
  toggleActiveText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 25,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 15,
  },
  forgotText: {
    color: '#2196F3',
    fontSize: 13,
  },
  buttonPrimary: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerText: {
    color: '#666',
    fontSize: 13,
  },
  footerTerms: {
    textAlign: 'center',
    fontSize: 10,
    color: '#aaa',
    marginTop: 40,
    lineHeight: 14,
  },
  // GLOBAL APP HEADER
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingHorizontal: 12,
    flex: 1,
    height: 40,
    marginRight: 15,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    marginRight: 12,
  },
  iconText: {
    fontSize: 22,
  },
  avatarPlaceholder: {
    backgroundColor: '#ddd',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  // HOME / VAGAS
  subHeaderFiltros: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  filtroPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
  },
  filtroPillActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filtroText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 13,
  },
  filtroTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noJobsCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  noJobsText: {
    fontSize: 16,
    color: '#777',
    fontWeight: '500',
  },
  vagaCard: {
    backgroundColor: '#f7f7f7',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  vagaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vagaEmpresaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vagaEmpresaNome: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  vagaEmpresaSeg: {
    fontSize: 11,
    color: '#777',
  },
  vagaTempo: {
    fontSize: 11,
    color: '#aaa',
  },
  vagaTituloText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#000',
  },
  vagaDescricaoText: {
    fontSize: 13,
    color: '#555',
    marginVertical: 8,
    lineHeight: 16,
  },
  vagaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  vagaQtd: {
    fontSize: 12,
    color: '#666',
  },
  vagaFooterRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vagaValor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
    marginRight: 10,
  },
  interesseBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  interesseBtnText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // MESSAGES
  sectionTitle: {
    fontSize: 22,
    color: '#555',
    marginBottom: 20,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
  },
  chatStatus: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  // CHAT INTERNO
  headerCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000',
  },
  headerTitleChat: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  chatHeaderIcons: {
    flexDirection: 'row',
    position: 'absolute',
    right: 15,
  },
  inputChatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  chatActionBtn: {
    backgroundColor: '#2196F3',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  inputChat: {
    flex: 1,
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 36,
    marginRight: 10,
    fontSize: 14,
  },
  // EMPRESAS
  empresaCardSimples: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  empresaCardNome: {
    fontSize: 15,
    fontWeight: '500',
  },
  // ABOUT
  aboutParagraph: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 20,
  },
  // CONFIGURAÇÕES / MENU
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemLabel: {
    fontSize: 16,
    color: '#333',
  },
  // PERFIL
  profileHeaderBadge: {
    backgroundColor: '#eee',
    paddingHorizontal: 30,
    paddingVertical: 6,
    borderRadius: 15,
  },
  profileHeaderText: {
    fontSize: 16,
    fontWeight: '500',
  },
  bigAvatarContainer: {
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 65,
    padding: 3,
  },
  bigAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 10,
    marginBottom: 25,
  },
  profileInputGroup: {
    width: '100%',
    marginBottom: 15,
  },
  profileLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  profileLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#ccc',
    marginTop: 12,
  },
  curriculoBox: {
    flexDirection: 'row',
    width: '100%',
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 20,
    paddingvertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 25,
    height: 50,
  },
  curriculoText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  uploadMockBox: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: '#fafafa',
  },
  mockUploadBtn: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 4,
    marginTop: 10,
  },
  // BOTTOM TABS NATIVAS
  bottomTabBarStyle: {
    height: 65,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tabIconWrapper: {
    padding: 6,
    borderRadius: 12,
  },
  tabIconWrapperActive: {
    backgroundColor: '#e3f2fd',
  }
});