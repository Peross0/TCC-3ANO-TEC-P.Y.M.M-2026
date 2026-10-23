import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';
import { apiFetch } from '../lib/api';

const DEFAULT_PREFERENCES = {
  theme: 'system',
  large_text: false,
  high_contrast: false,
  reduce_motion: false,
};

const PreferencesContext = createContext({
  preferences: DEFAULT_PREFERENCES,
  colors: Colors.light,
  isDark: false,
  loading: false,
  saving: false,
  syncError: '',
  refreshPreferences: async () => false,
  updatePreferences: async () => {},
});

export function PreferencesProvider({ userId, children }) {
  const systemColorScheme = useColorScheme();
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncError, setSyncError] = useState('');

  const refreshPreferences = useCallback(async () => {
    if (!userId) {
      setPreferences(DEFAULT_PREFERENCES);
      setSyncError('');
      return false;
    }

    setLoading(true);
    setSyncError('');
    try {
      const result = await apiFetch('/users/me/preferences');
      setPreferences({ ...DEFAULT_PREFERENCES, ...result.preferences });
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
    if (!userId) throw new Error('Entre na sua conta para salvar as preferências.');

    setSaving(true);
    setSyncError('');
    try {
      const result = await apiFetch('/users/me/preferences', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setPreferences({ ...DEFAULT_PREFERENCES, ...result.preferences });
      return result.preferences;
    } catch (error) {
      setSyncError(error.message || 'Não foi possível salvar suas preferências.');
      throw error;
    } finally {
      setSaving(false);
    }
  }, [userId]);

  const activeTheme = preferences.theme === 'system'
    ? systemColorScheme || 'light'
    : preferences.theme;
  const isDark = activeTheme === 'dark';
  const baseColors = activeTheme === 'dark' ? Colors.dark : Colors.light;
  const colors = useMemo(() => preferences.high_contrast
    ? {
      ...baseColors,
      background: activeTheme === 'dark' ? '#000000' : '#FFFFFF',
      surface: activeTheme === 'dark' ? '#080808' : '#FFFFFF',
      text: activeTheme === 'dark' ? '#FFFFFF' : '#000000',
      muted: activeTheme === 'dark' ? '#FFFFFF' : '#111111',
      line: activeTheme === 'dark' ? '#FFFFFF' : '#111111',
    }
    : baseColors, [activeTheme, baseColors, preferences.high_contrast]);
  const contextValue = useMemo(() => ({
    preferences,
    colors,
    isDark,
    loading,
    saving,
    syncError,
    refreshPreferences,
    updatePreferences,
  }), [preferences, colors, isDark, loading, saving, syncError, refreshPreferences, updatePreferences]);

  return (
    <PreferencesContext.Provider value={contextValue}>
      {children}
    </PreferencesContext.Provider>
  );
}

export const useAppPreferences = () => useContext(PreferencesContext);
