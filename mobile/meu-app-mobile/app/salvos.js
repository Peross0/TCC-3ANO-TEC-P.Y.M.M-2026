import React, { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import AnimatedScreen from '../components/layout/AnimatedScreen';
import { useAppPreferences } from '../context/PreferencesContext';
import { SessionContext } from '../context/SessionContext';
import { apiFetch, getAssetUrl } from '../lib/api';
import { formatBrasiliaDateTime } from '../lib/dateTime';
import JobCard from '../components/jobs/JobCard';

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'Salário a combinar';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(amount);
};

const normalizeFavorite = (vacancy, colors) => ({
  id: String(vacancy.id),
  vacancyId: vacancy.id,
  company: vacancy.company_name || 'Empresa',
  logoUri: getAssetUrl(vacancy.company_logo_url),
  category: vacancy.company_sector || 'Empresa',
  timeAgo: vacancy.created_at ? 'Publicada em' : 'Data indisponível',
  dateTimeLabel: formatBrasiliaDateTime(vacancy.created_at),
  title: (vacancy.job_title || 'Vaga disponível').toUpperCase(),
  description: vacancy.job_description || 'Descrição não informada.',
  salary: vacancy.salary_min || vacancy.salary_max
    ? `${formatCurrency(vacancy.salary_min || vacancy.salary_max)}${vacancy.salary_min && vacancy.salary_max ? ` - ${formatCurrency(vacancy.salary_max)}` : ''}`
    : 'Salário a combinar',
  vacancies: '1 vaga',
  logoBg: colors.primaryWash,
  logoTextColor: colors.text,
  isRemote: vacancy.work_model === 'REMOTE',
});

export default function SavedVacanciesScreen() {
  const router = useRouter();
  const { sessionData, setSessionData } = useContext(SessionContext);
  const { colors, preferences } = useAppPreferences();
  const styles = makeStyles(colors, preferences.large_text);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const [applyingId, setApplyingId] = useState(null);
  const [appliedIds, setAppliedIds] = useState(
    (sessionData?.applications || []).map((application) => String(application.vacancy_id)),
  );

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const result = await apiFetch('/candidates/favorites');
      const items = result.favorites || [];
      setFavorites(items.map((vacancy) => normalizeFavorite(vacancy, colors)));
      const favoriteIds = items.map((vacancy) => String(vacancy.id));
      setSessionData((current) => current
        ? { ...current, favoriteVacancyIds: favoriteIds }
        : current);
    } catch (error) {
      setErrorMessage(error.message || 'Não foi possível carregar suas vagas salvas.');
    } finally {
      setLoading(false);
    }
  }, [colors, setSessionData]);

  useFocusEffect(useCallback(() => {
    loadFavorites();
  }, [loadFavorites]));

  const removeFavorite = async (vacancyId) => {
    if (removingId !== null) return;
    setRemovingId(String(vacancyId));
    try {
      await apiFetch(`/candidates/vacancies/${vacancyId}/favorite`, { method: 'DELETE' });
      setFavorites((current) => current.filter((favorite) => String(favorite.vacancyId) !== String(vacancyId)));
      setSessionData((current) => current
        ? {
          ...current,
          favoriteVacancyIds: (current.favoriteVacancyIds || [])
            .filter((id) => String(id) !== String(vacancyId)),
        }
        : current);
    } catch (error) {
      Alert.alert('Não foi possível remover a vaga', error.message || 'Tente novamente.');
    } finally {
      setRemovingId(null);
    }
  };

  const applyToVacancy = async (vacancyId) => {
    const id = String(vacancyId);
    if (applyingId !== null || appliedIds.includes(id)) return;

    setApplyingId(id);
    try {
      await apiFetch(`/candidates/vacancies/${vacancyId}/apply`, { method: 'POST' });
      setAppliedIds((current) => [...new Set([...current, id])]);
      Alert.alert('Candidatura enviada', 'A empresa poderá conversar com você pela aba Mensagens.');
    } catch (error) {
      Alert.alert('Não foi possível se candidatar', error.message || 'Tente novamente.');
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <AnimatedScreen>
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={colors.background === '#101822' || colors.background === '#000000' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Vagas salvas</Text>
          <Text style={styles.subtitle}>Suas oportunidades favoritas</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={styles.stateText}>Carregando vagas salvas...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.state}>
          <Feather name="wifi-off" size={28} color={colors.muted} />
          <Text style={styles.stateTitle}>Não foi possível carregar</Text>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadFavorites}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.state}>
          <View style={styles.emptyIcon}>
            <Feather name="bookmark" size={27} color={colors.tint} />
          </View>
          <Text style={styles.stateTitle}>Nenhuma vaga salva ainda</Text>
          <Text style={styles.stateText}>
            Toque no marcador de uma vaga para encontrá-la aqui depois.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.replace('/(tabs)/home')}
          >
            <Text style={styles.retryText}>Explorar vagas</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          <Text style={styles.count}>
            {favorites.length} {favorites.length === 1 ? 'vaga salva' : 'vagas salvas'}
          </Text>
          {favorites.map((job) => (
            <JobCard
              key={job.id}
              item={job}
              onApply={applyToVacancy}
              isApplying={applyingId === String(job.vacancyId)}
              isFavorite
              isSavingFavorite={removingId === String(job.vacancyId)}
              onToggleFavorite={removeFavorite}
              isApplied={appliedIds.includes(String(job.vacancyId))}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
    </AnimatedScreen>
  );
}

function makeStyles(colors, largeText) {
  const scale = largeText ? 1.14 : 1;
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  backButton: { padding: 8, marginRight: 10 },
  headerCopy: { flex: 1 },
  title: { color: colors.text, fontSize: 20 * scale, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 12 * scale, marginTop: 3 },
  list: { padding: 16, paddingBottom: 32 },
  count: { color: colors.muted, fontSize: 13 * scale, fontWeight: '600', marginBottom: 14 },
  state: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: colors.primaryWash,
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    marginBottom: 16,
    width: 60,
  },
  stateTitle: { color: colors.text, fontSize: 17, fontWeight: '700', marginTop: 12, textAlign: 'center' },
  stateText: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 8, textAlign: 'center' },
  retryButton: {
    backgroundColor: colors.tint,
    borderRadius: 10,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  retryText: { color: colors.surface, fontSize: 13, fontWeight: '700' },
  });
}
