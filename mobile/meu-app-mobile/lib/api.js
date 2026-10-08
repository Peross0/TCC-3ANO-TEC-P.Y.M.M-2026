import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'conecta_facil_token';
const ONBOARDING_KEY = 'conecta_facil_onboarding_seen';

function getApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }
  if (Platform.OS === 'web') return 'http://localhost:3000/api';

  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  const host = hostUri?.split(':')[0];
  if (host) return `http://${host}:3000/api`;

  return Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';
}

export const API_URL = getApiUrl();

export function getAssetUrl(value) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const path = value.startsWith('/') ? value : `/uploads/${value}`;
  return `${API_URL.replace(/\/api\/?$/, '')}${path}`;
}

async function readStoredValue(key) {
  if (Platform.OS === 'web') return globalThis.localStorage?.getItem(key) ?? null;
  return SecureStore.getItemAsync(key);
}

async function writeStoredValue(key, value) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteStoredValue(key) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const getToken = () => readStoredValue(TOKEN_KEY);
export const saveToken = (token) => writeStoredValue(TOKEN_KEY, token);
export const clearToken = () => deleteStoredValue(TOKEN_KEY);
export const hasSeenOnboarding = async () => (await readStoredValue(ONBOARDING_KEY)) === 'true';
export const markOnboardingSeen = () => writeStoredValue(ONBOARDING_KEY, 'true');

export async function apiFetch(path, options = {}) {
  const { token: explicitToken, timeoutMs = 15000, ...requestOptions } = options;
  const token = explicitToken === undefined ? await getToken() : explicitToken;
  const hasBody = requestOptions.body !== undefined;
  const isFormData = typeof FormData !== 'undefined' && requestOptions.body instanceof FormData;
  const headers = {
    ...(hasBody && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...requestOptions.headers,
  };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...requestOptions,
      headers,
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const details = Array.isArray(data.details)
        ? data.details.map((item) => item.message).join(' ')
        : '';
      const error = new Error(details || data.message || data.mensagem || 'Não foi possível concluir a operação.');
      error.status = response.status;
      throw error;
    }
    return data;
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('O servidor demorou para responder. Tente novamente.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
