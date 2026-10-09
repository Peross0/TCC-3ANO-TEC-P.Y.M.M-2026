import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from './lib/theme';

export default function App() {
  const router = useRouter();

  const [isRegister, setIsRegister] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleSubmit = () => {
    if (isRegister) {
      console.log('Cadastro');
      console.log('Nome:', nome);
      console.log('Email:', email);
      console.log('Senha:', senha);

      alert('Cadastro realizado com sucesso!');
    } else {
      console.log('Login');
      console.log('Email:', email);
      console.log('Senha:', senha);

      // Vai para a tela Home
      router.push('/home.js');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>Conecta Fácil</Text>

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
            placeholderTextColor={colors.muted}
            value={nome}
            onChangeText={setNome}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Digite seu e-mail"
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          placeholderTextColor={colors.muted}
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

        <Text style={styles.footer}>© 2026 Conecta Fácil</Text>
      </View>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
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
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
  },

  input: {
    height: 55,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 18,
  },

  button: {
    height: 55,
    backgroundColor: colors.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: 'bold',
  },

  registerText: {
    textAlign: 'center',
    marginTop: 20,
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },

  footer: {
    textAlign: 'center',
    marginTop: 25,
    color: colors.muted,
    fontSize: 13,
  },
});