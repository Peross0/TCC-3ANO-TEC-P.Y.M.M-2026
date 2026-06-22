import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../constants/colors';

export default function LoginScreen() {
  const [tipoUser, setTipoUser] = useState('Candidato');
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.topText}>Encontre seu estágio ideal</Text>
      
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleBtn, tipoUser === 'Candidato' && styles.toggleActive]} 
          onPress={() => setTipoUser('Candidato')}
        >
          <Text style={[styles.toggleText, tipoUser === 'Candidato' && styles.toggleTextActive]}>
            👤 Candidato
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleBtn, tipoUser === 'Empresário' && styles.toggleActive]} 
          onPress={() => setTipoUser('Empresário')}
        >
          <Text style={[styles.toggleText, tipoUser === 'Empresário' && styles.toggleTextActive]}>
            💼 Empresário
          </Text>
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

        <TouchableOpacity style={styles.buttonPrimary} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ alignItems: 'center', marginTop: 15 }}>
          <Text style={styles.registerText}>
            Não tem conta? <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Criar conta</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerTerms}>
        Ao entrar ou criar uma conta você concorda com os{' '}
        <Text style={{ textDecorationLine: 'underline' }}>Termos de Uso</Text> e{' '}
        <Text style={{ textDecorationLine: 'underline' }}>Política de Privacidade</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 25,
    justifyContent: 'center',
  },
  topText: {
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
  toggleText: {
    color: '#777',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: colors.primary,
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
    color: colors.primary,
    fontSize: 13,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
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
});