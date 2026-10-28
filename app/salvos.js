import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useContext, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import JobCard from '../components/jobs/JobCard';
import { useAppPreferences } from '../context/PreferencesContext';
import { SessionContext } from '../context/SessionContext';
import { apiFetch, getAssetUrl } from '../lib/api';

const normalizeFavorite = (vacancy, colors) => ({
  id: String(vacancy.id),
  vacancyId: vacancy.id,
  company: vacancy.company_name || 'Empresa',
  logoUri: getAssetUrl(vacancy.company_logo_url),
  category: vacancy.company_sector || '',
  timeAgo: vacancy.created_at ? new Date(vacancy.created_at).toLocaleDateString('pt-BR') : 'Data indisponível',
  title: (vacancy.job_title || 'Vaga disponível').toUpperCase(),
  description: vacancy.job_description || 'Descrição não informada.',
  salary: vacancy.salary_min || vacancy.salary_max
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(vacancy.salary_min || vacancy.salary_max))
    : 'Salário a combinar',
  location: vacancy.location || '',
  workModel: ({ REMOTE: 'Remoto', HYBRID: 'Híbrido', ONSITE: 'Presencial' })[vacancy.work_model] || '',
  contractType: ({ CLT: 'CLT', PJ: 'PJ', INTERNSHIP: 'Estágio', FREELANCE: 'Freelancer' })[vacancy.contract_type] || '',
  logoBg: colors.primaryWash,
  logoTextColor: colors.text,
  isRemote: vacancy.work_model === 'REMOTE',
});

export default function SavedVacanciesScreen() {
  const router = useRouter();
  const { setSessionData } = useContext(SessionContext);
  const { colors, isDark } = useAppPreferences();
  const styles = makeStyles(colors);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [feedback, setFeedback] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const result = await apiFetch('/candidates/favorites');
      const items = result.favorites || [];
      setFavorites(items.map((vacancy) => normalizeFavorite(vacancy, colors)));
      setSessionData((current) => current
        ? { ...current, favoriteVacancyIds: items.map((vacancy) => String(vacancy.id)) }
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

  const removeFavorite = async (job) => {
    const vacancyId = String(job.vacancyId);
    if (savingId) return;
    setSavingId(vacancyId);
    try {
      await apiFetch(`/candidates/vacancies/${vacancyId}/favorite`, { method: 'DELETE' });
      setFavorites((current) => current.filter((favorite) => String(favorite.vacancyId) !== vacancyId));
      setSessionData((current) => current
        ? { ...current, favoriteVacancyIds: (current.favoriteVacancyIds || []).filter((id) => String(id) !== vacancyId) }
        : current);
      setFeedback('Vaga removida dos salvos.');
    } catch (error) {
      setErrorMessage(error.message || 'Não foi possível remover esta vaga.');
    } finally {
      setSavingId(null);
    }
  };

  const openDetails = async (job) => {
    setSelectedVacancy({ loading: true, job });
    setLoadingDetails(true);
    try {
      const result = await apiFetch(`/candidates/vacancies/${job.vacancyId}`);
      setSelectedVacancy(result.vacancy);
    } catch (error) {
      setSelectedVacancy(null);
      setErrorMessage(error.message || 'Não foi possível carregar os detalhes da vaga.');
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Voltar">
          <Feather name="arrow-left" size={21} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Vagas salvas</Text>
          <Text style={styles.subtitle}>Oportunidades da sua conta</Text>
        </View>
      </View>
      {feedback ? <Text style={styles.feedback} accessibilityLiveRegion="polite">{feedback}</Text> : null}

      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={styles.stateText}>Carregando vagas salvas...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.state}>
          <Feather name="wifi-off" size={26} color={colors.muted} />
          <Text style={styles.stateTitle}>Não foi possível carregar</Text>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={loadFavorites} accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.state}>
          <View style={styles.emptyIcon}><Feather name="bookmark" size={25} color={colors.tint} /></View>
          <Text style={styles.stateTitle}>Você ainda não salvou nenhuma vaga</Text>
          <Text style={styles.stateText}>Marque oportunidades na busca para encontrá-las aqui depois.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/(tabs)/home')} accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Buscar oportunidades</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          <Text style={styles.count}>{favorites.length} {favorites.length === 1 ? 'vaga salva' : 'vagas salvas'}</Text>
          {favorites.map((job) => (
            <JobCard
              key={job.id}
              item={job}
              onSave={removeFavorite}
              onOpenDetails={openDetails}
              isSaved
              isSaving={savingId === String(job.vacancyId)}
            />
          ))}
        </ScrollView>
      )}

      <Modal visible={Boolean(selectedVacancy)} transparent animationType="fade" onRequestClose={() => setSelectedVacancy(null)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setSelectedVacancy(null)} accessibilityLabel="Fechar detalhes da vaga" />
          <View style={styles.detailSheet}>
            <View style={styles.detailHeader}>
              <Text style={styles.stateTitle}>Detalhes da oportunidade</Text>
              <TouchableOpacity onPress={() => setSelectedVacancy(null)} accessibilityRole="button" accessibilityLabel="Fechar detalhes">
                <Feather name="x" size={21} color={colors.muted} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {loadingDetails ? <ActivityIndicator color={colors.tint} /> : null}
              <Text style={styles.detailTitle}>{selectedVacancy?.job_title || selectedVacancy?.job?.title}</Text>
              <Text style={styles.detailCompany}>{selectedVacancy?.company_name || selectedVacancy?.job?.company}</Text>
              {selectedVacancy?.location ? <Text style={styles.detailMeta}>{selectedVacancy.location}</Text> : null}
              {selectedVacancy?.work_model ? <Text style={styles.detailMeta}>{({ REMOTE: 'Remoto', HYBRID: 'Híbrido', ONSITE: 'Presencial' })[selectedVacancy.work_model]}</Text> : null}
              <Text style={styles.detailSection}>Descrição</Text>
              <Text style={styles.detailBody}>{selectedVacancy?.job_description || selectedVacancy?.job?.description}</Text>
              {selectedVacancy?.requirements ? <><Text style={styles.detailSection}>Requisitos</Text><Text style={styles.detailBody}>{selectedVacancy.requirements}</Text></> : null}
              {selectedVacancy?.benefits ? <><Text style={styles.detailSection}>Benefícios</Text><Text style={styles.detailBody}>{selectedVacancy.benefits}</Text></> : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
    backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerCopy: { flex: 1 },
    title: { color: colors.text, fontSize: 20, fontWeight: '800' },
    subtitle: { color: colors.muted, fontSize: 12, marginTop: 3 },
    list: { padding: 16, paddingBottom: 36, maxWidth: 760, width: '100%', alignSelf: 'center' },
    count: { color: colors.muted, fontSize: 12, fontWeight: '700', marginBottom: 12 },
    feedback: { color: '#287A4B', fontSize: 12, paddingHorizontal: 18, paddingTop: 10 },
    state: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
    emptyIcon: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 28, backgroundColor: colors.primaryWash, marginBottom: 10 },
    stateTitle: { color: colors.text, fontSize: 16, fontWeight: '800', textAlign: 'center', marginTop: 10 },
    stateText: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 7 },
    primaryButton: { minHeight: 42, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, marginTop: 16, backgroundColor: colors.tint, borderRadius: 8 },
    primaryButtonText: { color: colors.surface, fontSize: 13, fontWeight: '700' },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 18, backgroundColor: 'rgba(0,0,0,0.42)' },
    modalBackdrop: { ...StyleSheet.absoluteFillObject },
    detailSheet: { width: '100%', maxWidth: 560, maxHeight: '86%', backgroundColor: colors.surface, borderRadius: 12, padding: 18 },
    detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    detailTitle: { color: colors.text, fontSize: 20, fontWeight: '800', marginBottom: 5 },
    detailCompany: { color: colors.inkSoft, fontSize: 14, fontWeight: '700' },
    detailMeta: { color: colors.muted, fontSize: 12, marginTop: 6 },
    detailSection: { color: colors.text, fontSize: 14, fontWeight: '800', marginTop: 18, marginBottom: 6 },
    detailBody: { color: colors.inkSoft, fontSize: 13, lineHeight: 20 },
  });
}