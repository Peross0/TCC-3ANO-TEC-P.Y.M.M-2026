import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState('candidato');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('./assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ActivityIndicator
          size="large"
          color="#5A7FFF"
          style={styles.loader}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Bloco Superior: Título + Toggle */}
        <View style={styles.topSection}>
          <Text style={styles.mainTitle}>Encontre seu estágio ideal</Text>

          {/* Toggle Candidato / Empresário */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                userType === 'candidato' && styles.activeToggleButton,
              ]}
              onPress={() => setUserType('candidato')}
              activeOpacity={0.9}
            >
              <Feather
                name="user"
                size={20}
                color={userType === 'candidato' ? '#3BB7FF' : '#9E9E9E'}
              />
              <Text
                style={[
                  styles.toggleText,
                  userType === 'candidato'
                    ? styles.activeToggleText
                    : styles.inactiveToggleText,
                ]}
              >
                Candidato
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                userType === 'empresario' && styles.activeToggleButton,
              ]}
              onPress={() => setUserType('empresario')}
              activeOpacity={0.9}
            >
              <Feather
                name="briefcase"
                size={20}
                color={userType === 'empresario' ? '#3BB7FF' : '#9E9E9E'}
              />
              <Text
                style={[
                  styles.toggleText,
                  userType === 'empresario'
                    ? styles.activeToggleText
                    : styles.inactiveToggleText,
                ]}
              >
                Empresário
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bloco Central: Formulário de Login */}
        <View style={styles.formSection}>
          <View style={styles.headerTextGroup}>
            <Text style={styles.welcomeTitle}>Seja bem-vindo</Text>
            <Text style={styles.welcomeSubtitle}>
              Entre na sua conta de {userType}
            </Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="#B0B0B0"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#B0B0B0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.forgotPasswordButton}>
            <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitButton} activeOpacity={0.85}>
            <Text style={styles.submitButtonText}>Entrar</Text>
          </TouchableOpacity>

          <View style={styles.registerGroup}>
            <Text style={styles.registerText}>Não tem conta? </Text>
            <TouchableOpacity>
              <Text style={styles.registerLink}>Criar conta</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bloco Inferior: Termos e Políticas */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            Ao entrar ou criar uma conta você concorda com os{' '}
            <Text style={styles.footerLink}>Termos de Uso</Text> e{' '}
            <Text style={styles.footerLink}>Política de Privacidade</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // SplashScreen Loading
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1E1D25',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 180,
  },
  loader: {
    marginTop: 20,
  },

  // Layout Principal
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },

  // Cabeçalho & Selector
  topSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#9E9E9E',
    textAlign: 'center',
    marginBottom: 28,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#EBEBEB',
    borderRadius: 25,
    padding: 5,
    width: '100%',
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 20,
    gap: 8,
  },
  activeToggleButton: {
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  activeToggleText: {
    color: '#3BB7FF',
  },
  inactiveToggleText: {
    color: '#757575',
  },

  // Formulário
  formSection: {
    width: '100%',
    marginBottom: 20,
  },
  headerTextGroup: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#9E9E9E',
    marginTop: 4,
    fontWeight: '400',
  },
  input: {
    width: '100%',
    height: 54,
    borderWidth: 1.2,
    borderColor: '#E2E2E2',
    borderRadius: 16,
    paddingHorizontal: 18,
    fontSize: 16,
    color: '#222222',
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 2,
    marginBottom: 28,
  },
  forgotPasswordText: {
    color: '#3BB7FF',
    fontSize: 15,
    fontWeight: '500',
  },
  submitButton: {
    width: '100%',
    height: 54,
    backgroundColor: '#3BB7FF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  registerGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  registerText: {
    color: '#9E9E9E',
    fontSize: 15,
  },
  registerLink: {
    color: '#3BB7FF',
    fontSize: 15,
    fontWeight: '600',
  },

  // Rodapé
  footerSection: {
    paddingHorizontal: 12,
  },
  footerText: {
    fontSize: 11,
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 16,
  },
  footerLink: {
    color: '#3BB7FF',
  },
});