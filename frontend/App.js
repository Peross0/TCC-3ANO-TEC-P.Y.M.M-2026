import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';

export default function App() {
  const [isRegister, setIsRegister] = useState(false);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = () => {
    if (isRegister) {
      if (!nome || !email || !senha) {
        Alert.alert(
          'Atenção',
          'Preencha todos os campos para realizar o cadastro.'
        );
        return;
      }

      console.log('Cadastro');
      console.log('Nome:', nome);
      console.log('Email:', email);
      console.log('Senha:', senha);

      Alert.alert(
        'Cadastro',
        'Cadastro realizado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsRegister(false);
              setNome('');
              setEmail('');
              setSenha('');
            },
          },
        ]
      );

      return;
    }

    // LOGIN
    if (!email || !senha) {
      Alert.alert(
        'Atenção',
        'Digite seu e-mail e sua senha.'
      );
      return;
    }

    console.log('Login');
    console.log('Email:', email);
    console.log('Senha:', senha);

    // Abre a tela Home
    router.replace('/home');
  };

  const alternarTela = () => {
    setIsRegister(!isRegister);
    setNome('');
    setEmail('');
    setSenha('');
  };

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

        {/* NOME - somente no cadastro */}
        {isRegister && (
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            placeholderTextColor="#999"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
          />
        )}

        {/* EMAIL */}
        <TextInput
          style={styles.input}
          placeholder="Digite seu e-mail"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* SENHA */}
        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          placeholderTextColor="#999"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        {/* BOTÃO */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {isRegister ? 'Cadastrar' : 'Entrar'}
          </Text>
        </TouchableOpacity>

        {/* ALTERAR LOGIN/CADASTRO */}
        <TouchableOpacity
          onPress={alternarTela}
          activeOpacity={0.7}
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