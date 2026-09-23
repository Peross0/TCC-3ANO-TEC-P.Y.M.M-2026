import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

function getApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (Platform.OS === 'web') return 'http://localhost:3000/api';

  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  const host = hostUri?.split(':')[0];
  if (host) return `http://${host}:3000/api`;

  return Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';
}

export const API_URL = getApiUrl();
const TOKEN_KEY = 'conecta_facil_token';

export async function saveSession(token, user) {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    ['conecta_facil_user', JSON.stringify(user)],
  ]);
}

export async function clearSession() {
  await AsyncStorage.multiRemove([TOKEN_KEY, 'conecta_facil_user']);
}

export async function getSession() {
  const [[, token], [, userJson]] = await AsyncStorage.multiGet([TOKEN_KEY, 'conecta_facil_user']);
  return { token, user: userJson ? JSON.parse(userJson) : null };
}

export async function apiFetch(path, options = {}) {
  const { token } = await getSession();
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = Array.isArray(data.details) ? data.details.map((item) => item.message).join(' ') : '';
    throw new Error(details || data.message || data.mensagem || 'Não foi possível concluir a operação.');
  }
  return data;
}

export { TOKEN_KEY };
