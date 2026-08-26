import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';

import PagInicial from './paginicial';

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

export default function App() {
  // Controla se o usuário está na tela de cadastro
  const [isRegister, setIsRegister] = useState(false);

  // Dados dos campos
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Controla se deve mostrar a página inicial
  const [mostrarPaginaInicial, setMostrarPaginaInicial] = useState(false);

  // Controla a tela de carregamento inicial
  const [carregando, setCarregando] = useState(true);

  // Executado quando o aplicativo é aberto
  useEffect(() => {
    const timer = setTimeout(() => {
      setCarregando(false);
    }, 2500);

    // Limpa o timer caso o componente seja desmontado
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    if (isRegister) {
      console.log('Cadastro');
      console.log('Nome:', nome);
      console.log('Email:', email);
      console.log('Senha:', senha);


      setMostrarPaginaInicial(true);
    } else {
      console.log('Login');
      console.log('Email:', email);
      console.log('Senha:', senha);


      setMostrarPaginaInicial(true);
    }
  };

  // ==========================================
  // TELA DE CARREGAMENTO
  // ==========================================
  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingLogo}>
          Conecta Fácil
        </Text>

        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Carregando...
        </Text>

        <StatusBar style="dark" />
      </View>
    );
  }

  // ==========================================
  // PÁGINA INICIAL
  // ==========================================
  if (mostrarPaginaInicial) {
    return <PagInicial />;
  }

  // ==========================================
  // TELA DE LOGIN / CADASTRO
  // ==========================================
  return (
    <View style={styles.container}>

      <View style={styles.card}>

        <Text style={styles.logo}>
          Conecta Fácil
        </Text>

        <Text style={styles.title}>
          {isRegister ? 'Criar Conta' : 'Entrar'}
        </Text>

        <Text style={styles.subtitle}>
          {isRegister
            ? 'Preencha os dados para se cadastrar'
            : 'Faça login para acessar o sistema'}
        </Text>

        {isRegister && (
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            placeholderTextColor="#999"
            value={nome}
            onChangeText={setNome}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#999"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>
            {isRegister ? 'Cadastrar' : 'Entrar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setIsRegister(!isRegister);
            setNome('');
            setEmail('');
            setSenha('');
          }}
        >
          <Text style={styles.registerText}>
            {isRegister
              ? 'Já possui conta? Entrar'
              : 'Não possui conta? Cadastre-se'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          © 2026 Conecta Fácil
        </Text>

      </View>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({

  // ==========================================
  // TELA DE CARREGAMENTO
  // ==========================================

  loadingContainer: {
    flex: 1,
    backgroundColor: '#2b2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingLogo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#01629e',
    marginBottom: 40,
  },

  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#6B7280',
  },

  // ==========================================
  // TELA DE LOGIN
  // ==========================================

  container: {
    flex: 1,
    backgroundColor: '#E9EEF5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 40,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,

    elevation: 8,
  },

  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563EB',
    textAlign: 'center',
    marginBottom: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
  },

  input: {
    height: 55,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 18,
  },

  button: {
    height: 55,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  registerText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '600',
  },

  footer: {
    textAlign: 'center',
    marginTop: 25,
    color: '#9CA3AF',
    fontSize: 13,
  },
});
