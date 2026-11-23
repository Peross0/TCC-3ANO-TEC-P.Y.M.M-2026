import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getApiUrl() {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '');
  if (configuredUrl) return configuredUrl;
  if (Platform.OS === 'web') {
    return process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api' : '';
  }

  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  const host = hostUri?.split(':')[0];
  if (host) return `http://${host}:3000/api`;

  return Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';
}

export const API_URL = getApiUrl();
const TOKEN_KEY = 'conecta_facil_token';

export async function saveSession(token, user) {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem('conecta_facil_user', JSON.stringify(user));
  } catch (error) {
    console.error("Erro ao salvar sessão:", error);
  }
}
// export async function saveSession(token, user) {
//   await AsyncStorage.multiSet([
//     [TOKEN_KEY, token],
//     ['conecta_facil_user', JSON.stringify(user)],
//   ]);
// }

export async function clearSession() {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem('conecta_facil_user');
  } catch (error) {
    console.error("Erro ao limpar sessão:", error);
  }
}

// export async function clearSession() {
//   await AsyncStorage.multiRemove([TOKEN_KEY, 'conecta_facil_user']);
// }

export async function getSession() {
  try {
    // Busca os dados de forma individual (Altamente seguro e compatível com Web/Mobile)
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const userJson = await AsyncStorage.getItem('conecta_facil_user');

    return {
      token,
      user: userJson ? JSON.parse(userJson) : null
    };
  } catch (error) {
    console.error("Erro ao buscar sessão:", error);
    return { token: null, user: null };
  }
}
// export async function getSession() {  

//   const [[, token], [, userJson]] = await AsyncStorage.multiGet([TOKEN_KEY, 'conecta_facil_user']);
//   return { token, user: userJson ? JSON.parse(userJson) : null };
// }

export async function apiFetch(path, options = {}) {
  if (!API_URL) {
    throw new Error('API não configurada. Defina EXPO_PUBLIC_API_URL com a URL pública do backend e gere novamente o frontend.');
  }

  const { token } = await getSession();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const { responseType, ...fetchOptions } = options;
  const headers = {
    ...(options.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const response = await fetch(`${API_URL}${path}`, { ...fetchOptions, headers });
  if (responseType === 'blob') {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const details = Array.isArray(data.details) ? data.details.map((item) => item.message).join(' ') : '';
      throw new Error(details || data.message || data.mensagem || 'Não foi possível concluir a operação.');
    }
    return response.blob();
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = Array.isArray(data.details) ? data.details.map((item) => item.message).join(' ') : '';
    throw new Error(details || data.message || data.mensagem || 'Não foi possível concluir a operação.');
  }
  return data;
}

export { TOKEN_KEY };

