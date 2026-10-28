import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';
import { apiFetch, getStoredPreferences, saveStoredPreferences } from '../lib/api';

export const DEFAULT_PREFERENCES = {
  theme: 'system',
  large_text: false,
  high_contrast: false,
  reduce_motion: false,
  preferred_sector: null,
  preferred_location: null,
  preferred_work_model: null,
  preferred_contract_type: null,
};

const PreferencesContext = createContext({
  preferences: DEFAULT_PREFERENCES,
  colors: Colors.light,
  isDark: false,
  loading: false,
  saving: false,
  syncError: '',
  updatePreferences: async () => {},
  refreshPreferences: async () => false,
});

export function PreferencesProvider({ userId, children }) {
  const systemColorScheme = useColorScheme();
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncError, setSyncError] = useState('');
  const requestVersion = useRef(0);

  const refreshPreferences = useCallback(async () => {
    const version = ++requestVersion.current;
    setPreferences(DEFAULT_PREFERENCES);
    const stored = await getStoredPreferences(userId);
    if (version !== requestVersion.current) return false;
    if (stored) setPreferences({ ...DEFAULT_PREFERENCES, ...stored });
    if (!userId) return false;

    setLoading(true);
    setSyncError('');
    try {
      const result = await apiFetch('/users/me/preferences');
      if (version !== requestVersion.current) return false;
      const next = { ...DEFAULT_PREFERENCES, ...result.preferences };
      setPreferences(next);
      await saveStoredPreferences(next, userId);
      return true;
    } catch (error) {
      setSyncError(error.message || 'Não foi possível sincronizar suas preferências.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshPreferences();
  }, [refreshPreferences]);

  const updatePreferences = useCallback(async (updates) => {
    setSaving(true);
    setSyncError('');
    try {
      let next = { ...preferences, ...updates };
      if (userId) {
        const result = await apiFetch('/users/me/preferences', {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
        next = { ...DEFAULT_PREFERENCES, ...result.preferences };
      }
      await saveStoredPreferences(next, userId);
      setPreferences(next);
      return next;
    } catch (error) {
      setSyncError(error.message || 'Não foi possível salvar suas preferências.');
      throw error;
    } finally {
      setSaving(false);
    }
  }, [preferences, userId]);

  const activeTheme = preferences.theme === 'system'
    ? systemColorScheme || 'light'
    : preferences.theme;
  const isDark = activeTheme === 'dark';
  const baseColors = isDark ? Colors.dark : Colors.light;
  const colors = useMemo(() => preferences.high_contrast
    ? {
      ...baseColors,
      background: isDark ? '#000000' : '#FFFFFF',
      surface: isDark ? '#080808' : '#FFFFFF',
      surfaceSoft: isDark ? '#111111' : '#F3F5F7',
      text: isDark ? '#FFFFFF' : '#000000',
      ink: isDark ? '#FFFFFF' : '#000000',
      muted: isDark ? '#FFFFFF' : '#111111',
      inkSoft: isDark ? '#FFFFFF' : '#111111',
      line: isDark ? '#FFFFFF' : '#111111',
    }
    : baseColors, [baseColors, isDark, preferences.high_contrast]);

  const value = useMemo(() => ({
    preferences,
    colors,
    isDark,
    loading,
    saving,
    syncError,
    updatePreferences,
    refreshPreferences,
  }), [preferences, colors, isDark, loading, saving, syncError, updatePreferences, refreshPreferences]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export const useAppPreferences = () => useContext(PreferencesContext);