import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { API_URL, apiFetch, clearSession, getSession } from '../lib/api';
import { colors } from '../lib/theme';

const PAGE_SIZE = 50;

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-BR');
}

function formatDocument(type, value) {
  if (!value) return '';
  const digits = String(value).replace(/\D/g, '');
  if (type === 'CNPJ' && digits.length === 14) {
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }
  if (type === 'CPF' && digits.length === 11) {
    return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }
  return value;
}

function InfoField({ label, value, emptyText = 'Você ainda não adicionou este dado.' }) {
  return (
    <View style={styles.infoField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={[styles.fieldValue, !value && styles.emptyValue]} selectable>
        {value || emptyText}
      </Text>
    </View>
  );
}

function SectionHeading({ title, subtitle, action }) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionHeadingCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

function Metric({ icon, label, value }) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricIcon}><Feather name={icon} size={17} color={colors.primaryDark} /></View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export default function PerfilScreen() {
  const params = useLocalSearchParams();
  const [recruiter, setRecruiter] = useState(null);
  const [vacancies, setVacancies] = useState([]);
  const [vacancyTotal, setVacancyTotal] = useState(null);
  const [candidateTotal, setCandidateTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [companyLogoUploading, setCompanyLogoUploading] = useState(false);
  const [companySaving, setCompanySaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ full_name: '', phone: '' });
  const [companyEditing, setCompanyEditing] = useState(false);
  const [companyDraft, setCompanyDraft] = useState({ company_name: '', company_description: '', company_sector: '', location: '' });
  const [feedback, setFeedback] = useState(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordStep, setPasswordStep] = useState('request');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [notificationBusy, setNotificationBusy] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const session = await getSession();
      if (!session.token) {
        router.replace('/login');
        return;
      }

      const [profileData, vacanciesData] = await Promise.all([
        apiFetch('/recruiters/profile'),
        apiFetch(`/recruiters/vacancies?page=1&limit=${PAGE_SIZE}`),
      ]);
      const profile = profileData.recruiter;
      const items = vacanciesData.vacancies || [];
      setRecruiter(profile);
      setDraft({ full_name: profile.full_name || '', phone: profile.phone || '' });
      setVacancies(items);
      setVacancyTotal(Number(vacanciesData.pagination?.total ?? items.length));

      const totalPages = Number(vacanciesData.pagination?.totalPages || 1);
      const remainingPages = await Promise.all(
        Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) =>
          apiFetch(`/recruiters/vacancies?page=${index + 2}&limit=${PAGE_SIZE}`)
        )
      );
      const allVacancies = [
        ...items,
        ...remainingPages.flatMap((page) => page.vacancies || []),
      ];
      setVacancies(allVacancies);

      const candidateCounts = await Promise.all(
        allVacancies.map(async (vacancy) => {
          const data = await apiFetch(`/recruiters/vacancies/${vacancy.id}/candidates?page=1&limit=1`);
          return Number(data.pagination?.total || 0);
        })
      );
      setCandidateTotal(candidateCounts.reduce((total, count) => total + count, 0));
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof TypeError
          ? 'Não foi possível conectar ao servidor. Verifique a conexão e tente novamente.'
          : error.message || 'Não foi possível carregar os dados do perfil.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const latestVacancy = useMemo(
    () => vacancies.find((vacancy) => vacancy.company_name || vacancy.company_sector || vacancy.location),
    [vacancies]
  );
  const openVacancies = useMemo(
    () => vacancies.filter((vacancy) => vacancy.status === 'OPEN').length,
    [vacancies]
  );
  const companyName = latestVacancy?.company_name || '';
  const companyDescription = latestVacancy?.company_description || '';
  const companySector = latestVacancy?.company_sector || '';
  const companyLocation = latestVacancy?.location || '';
  const beginCompanyEditing = () => {
    setCompanyDraft({
      company_name: companyName,
      company_description: companyDescription,
      company_sector: companySector,
      location: companyLocation,
    });
    setFeedback(null);
    setCompanyEditing(true);
  };
  const cancelCompanyEditing = () => {
    setCompanyDraft({
      company_name: companyName,
      company_description: companyDescription,
      company_sector: companySector,
      location: companyLocation,
    });
    setCompanyEditing(false);
    setFeedback(null);
  };
  const saveCompany = async () => {
    if (companyDraft.company_name.trim().length < 2) {
      setFeedback({ type: 'error', message: 'Informe o nome da empresa com pelo menos 2 caracteres.' });
      return;
    }
    if (companyDraft.company_description.trim().length > 1000 || companyDraft.company_sector.trim().length > 100 || companyDraft.location.trim().length > 255) {
      setFeedback({ type: 'error', message: 'Confira os limites de caracteres da apresentação, segmento e localização.' });
      return;
    }

    setCompanySaving(true);
    setFeedback(null);
    try {
      const response = await apiFetch('/recruiters/company', {
        method: 'PUT',
        body: JSON.stringify({
          company_name: companyDraft.company_name.trim(),
          company_description: companyDraft.company_description.trim(),
          company_sector: companyDraft.company_sector.trim(),
          location: companyDraft.location.trim(),
        }),
      });
      setVacancies((current) => current.map((vacancy) => ({
        ...vacancy,
        company_name: companyDraft.company_name.trim(),
        company_description: companyDraft.company_description.trim() || null,
        company_sector: companyDraft.company_sector.trim() || null,
        location: companyDraft.location.trim() || null,
      })));
      setCompanyEditing(false);
      setFeedback({
        type: 'success',
        message: `${response.message} ${response.updated_vacancies} vaga(s) atualizada(s).`,
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof TypeError
          ? 'Não foi possível conectar ao servidor. Tente novamente.'
          : error.message || 'Não foi possível atualizar os dados da empresa.',
      });
    } finally {
      setCompanySaving(false);
    }
  };
  const companyDocument = recruiter?.document_type === 'CNPJ'
    ? formatDocument(recruiter.document_type, recruiter.document_number)
    : '';
  const toImageUri = (value) => {
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    const path = value.startsWith('/') ? value : `/uploads/${value}`;
    return `${API_URL.replace(/\/api\/?$/, '')}${path}`;
  };
  const avatarUri = toImageUri(recruiter?.avatar_url);
  const companyLogoUri = toImageUri(recruiter?.company_logo_url);

  const chooseAndUploadImage = async ({ endpoint, field, setBusy, onUploaded }) => {
    setFeedback(null);
    try {
      const selection = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (selection.canceled || !selection.assets?.length) return;

      const asset = selection.assets[0];
      const formData = new FormData();
      if (asset.file) {
        formData.append(field, asset.file, asset.fileName || 'image.jpg');
      } else {
        formData.append(field, {
          uri: asset.uri,
          name: asset.fileName || 'image.jpg',
          type: asset.mimeType || 'image/jpeg',
        });
      }

      setBusy(true);
      const response = await apiFetch(endpoint, { method: 'POST', body: formData });
      onUploaded(response);
      setFeedback({ type: 'success', message: response.message || 'Imagem atualizada com sucesso.' });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof TypeError
          ? 'Não foi possível conectar ao servidor. Tente novamente.'
          : error.message || 'Não foi possível atualizar a imagem.',
      });
    } finally {
      setBusy(false);
    }
  };

  const beginEditing = () => {
    setDraft({
      full_name: recruiter?.full_name || '',
      phone: recruiter?.phone || '',
    });
    setFeedback(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft({
      full_name: recruiter?.full_name || '',
      phone: recruiter?.phone || '',
    });
    setEditing(false);
    setFeedback(null);
  };

  const saveProfile = async () => {
    if (draft.full_name.trim().length < 2) {
      setFeedback({ type: 'error', message: 'Informe um nome com pelo menos 2 caracteres.' });
      return;
    }
    if (draft.phone.trim().length > 20) {
      setFeedback({ type: 'error', message: 'O telefone deve ter no máximo 20 caracteres.' });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const { recruiter: updatedRecruiter } = await apiFetch('/recruiters/profile', {
        method: 'PUT',
        body: JSON.stringify({
          full_name: draft.full_name.trim(),
          phone: draft.phone.trim(),
        }),
      });
      setRecruiter(updatedRecruiter);
      setDraft({
        full_name: updatedRecruiter.full_name || '',
        phone: updatedRecruiter.phone || '',
      });
      setEditing(false);
      setFeedback({ type: 'success', message: 'Alterações salvas com sucesso.' });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof TypeError
          ? 'Não foi possível conectar ao servidor. Tente novamente.'
          : error.message || 'Não foi possível salvar as alterações.',
      });
    } finally {
      setSaving(false);
    }
  };

  const requestPasswordReset = async () => {
    if (!recruiter?.email) return;
    setPasswordBusy(true);
    setFeedback(null);
    try {
      const response = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: recruiter.email }),
      });
      setPasswordStep('reset');
      setFeedback({ type: 'success', message: response.message || 'Se a conta estiver cadastrada, você receberá um código de recuperação.' });
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Não foi possível solicitar a recuperação de senha.' });
    } finally {
      setPasswordBusy(false);
    }
  };

  const resetPassword = async () => {
    if (!/^\d{6}$/.test(resetCode)) {
      setFeedback({ type: 'error', message: 'Informe o código de 6 dígitos enviado para seu e-mail.' });
      return;
    }
    if (newPassword.length < 8) {
      setFeedback({ type: 'error', message: 'A nova senha deve ter pelo menos 8 caracteres.' });
      return;
    }

    setPasswordBusy(true);
    setFeedback(null);
    try {
      const response = await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: recruiter.email,
          code: resetCode,
          password: newPassword,
        }),
      });
      setPasswordOpen(false);
      setPasswordStep('request');
      setResetCode('');
      setNewPassword('');
      setFeedback({ type: 'success', message: response.message || 'Senha alterada com sucesso.' });
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Não foi possível alterar a senha.' });
    } finally {
      setPasswordBusy(false);
    }
  };

  const toggleNotifications = async () => {
    setNotificationBusy(true);
    setFeedback(null);
    try {
      const { recruiter: updatedRecruiter } = await apiFetch('/recruiters/profile', {
        method: 'PUT',
        body: JSON.stringify({ active_notification: !recruiter.active_notification }),
      });
      setRecruiter(updatedRecruiter);
      setFeedback({
        type: 'success',
        message: updatedRecruiter.active_notification
          ? 'Preferência de notificações ativada.'
          : 'Preferência de notificações desativada.',
      });
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Não foi possível atualizar esta preferência.' });
    } finally {
      setNotificationBusy(false);
    }
  };

  const signOut = async () => {
    await clearSession();
    router.replace('/');
  };

  const backToHome = () => {
    router.replace({
      pathname: '/home',
      params: {
        nome: recruiter?.full_name || params.nome || '',
        email: recruiter?.email || params.email || '',
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.headingRow}>
          <Pressable onPress={backToHome} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Voltar para início">
            <Feather name="arrow-left" size={19} color={colors.ink} />
          </Pressable>
          <View style={styles.headingCopy}>
            <Text style={styles.eyebrow}>CONTA EMPRESARIAL</Text>
            <Text style={styles.pageTitle}>Meu perfil</Text>
            <Text style={styles.pageSubtitle}>Gerencie suas informações profissionais e os dados associados à sua empresa.</Text>
          </View>
        </View>

        {feedback && (
          <View style={[styles.feedback, feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess]} accessibilityRole="alert">
            <Feather name={feedback.type === 'error' ? 'alert-circle' : 'check-circle'} size={17} color={feedback.type === 'error' ? colors.danger : colors.limeDark} />
            <Text style={[styles.feedbackText, feedback.type === 'error' && styles.feedbackErrorText]}>{feedback.message}</Text>
            {feedback.type === 'error' && !loading && (
              <Pressable onPress={loadProfile} accessibilityRole="button" accessibilityLabel="Tentar carregar novamente">
                <Feather name="refresh-cw" size={16} color={colors.primaryDark} />
              </Pressable>
            )}
          </View>
        )}

        {loading ? (
          <View style={styles.loadingPanel}>
            <Feather name="loader" size={19} color={colors.primaryDark} />
            <Text style={styles.loadingText}>Carregando dados do perfil...</Text>
          </View>
        ) : recruiter ? (
          <>
            <View style={styles.profileCard}>
              <View style={styles.profileIdentity}>
                <Pressable
                  style={styles.avatar}
                  onPress={() => chooseAndUploadImage({
                    endpoint: '/users/me/avatar',
                    field: 'avatar',
                    setBusy: setAvatarUploading,
                    onUploaded: (response) => setRecruiter((current) => ({ ...current, avatar_url: response.user.avatar_url })),
                  })}
                  disabled={avatarUploading}
                  accessibilityRole="button"
                  accessibilityLabel={avatarUploading ? 'Enviando foto do perfil' : 'Adicionar ou alterar foto do perfil'}
                >
                  {avatarUri
                    ? <Image source={{ uri: avatarUri }} style={styles.avatarImage} accessibilityLabel="Foto do perfil" />
                    : <Text style={styles.avatarText}>{recruiter.full_name?.trim().charAt(0).toUpperCase() || 'R'}</Text>}
                  <View style={styles.imageEditBadge}>
                    <Feather name={avatarUploading ? 'loader' : 'camera'} size={12} color={colors.ink} />
                  </View>
                </Pressable>
                <View style={styles.profileCopy}>
                  <Text style={styles.profileName}>{recruiter.full_name}</Text>
                  <Text style={styles.profileRole}>Administrador da empresa</Text>
                  <Text style={styles.profileEmail}>{recruiter.email}</Text>
                  {recruiter.phone ? <Text style={styles.profilePhone}>{recruiter.phone}</Text> : null}
                </View>
              </View>
              <View style={styles.profileActions}>
                <View style={styles.statusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Conta ativa</Text>
                </View>
                <Pressable style={styles.primaryButton} onPress={editing ? cancelEditing : beginEditing} accessibilityRole="button">
                  <Feather name={editing ? 'x' : 'edit-2'} size={15} color={colors.ink} />
                  <Text style={styles.primaryButtonText}>{editing ? 'Cancelar edição' : 'Editar perfil'}</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.mainGrid}>
              <View style={styles.mainColumn}>
                <View style={styles.sectionCard}>
                  <SectionHeading
                    title="Dados do responsável"
                    subtitle="Informações profissionais vinculadas ao seu acesso."
                    action={!editing && <Pressable onPress={beginEditing} style={styles.textAction} accessibilityRole="button"><Feather name="edit-2" size={14} color={colors.primaryDark} /><Text style={styles.textActionLabel}>Editar</Text></Pressable>}
                  />
                  {editing ? (
                    <View style={styles.formGrid}>
                      <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>Nome completo</Text>
                        <TextInput
                          style={styles.input}
                          value={draft.full_name}
                          onChangeText={(value) => setDraft((current) => ({ ...current, full_name: value }))}
                          placeholder="Seu nome completo"
                          placeholderTextColor={colors.muted}
                          maxLength={255}
                          autoCapitalize="words"
                        />
                      </View>
                      <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>E-mail de acesso · somente leitura</Text>
                        <TextInput style={[styles.input, styles.readOnly]} value={recruiter.email || ''} editable={false} />
                      </View>
                      <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>Telefone</Text>
                        <TextInput
                          style={styles.input}
                          value={draft.phone}
                          onChangeText={(value) => setDraft((current) => ({ ...current, phone: value }))}
                          placeholder="Telefone de contato"
                          placeholderTextColor={colors.muted}
                          maxLength={20}
                          keyboardType="phone-pad"
                        />
                      </View>
                      <InfoField label="Cargo" value="Administrador da empresa" />
                      <InfoField label={recruiter.document_type || 'Documento'} value={formatDocument(recruiter.document_type, recruiter.document_number)} />
                      <InfoField label="Data de cadastro" value={formatDate(recruiter.created_at)} />
                    </View>
                  ) : (
                    <View style={styles.infoGrid}>
                      <InfoField label="Nome completo" value={recruiter.full_name} />
                      <InfoField label="E-mail" value={recruiter.email} />
                      <InfoField label="Telefone" value={recruiter.phone} />
                      <InfoField label="Cargo" value="Administrador da empresa" />
                      <InfoField label={recruiter.document_type || 'Documento'} value={formatDocument(recruiter.document_type, recruiter.document_number)} />
                      <InfoField label="Data de cadastro" value={formatDate(recruiter.created_at)} />
                    </View>
                  )}
                  {editing && (
                    <View style={styles.formActions}>
                      <Pressable style={styles.secondaryButton} onPress={cancelEditing} disabled={saving} accessibilityRole="button">
                        <Text style={styles.secondaryButtonText}>Cancelar</Text>
                      </Pressable>
                      <Pressable style={[styles.primaryButton, saving && styles.disabledButton]} onPress={saveProfile} disabled={saving} accessibilityRole="button">
                        <Feather name={saving ? 'loader' : 'check'} size={15} color={colors.ink} />
                        <Text style={styles.primaryButtonText}>{saving ? 'Salvando...' : 'Salvar alterações'}</Text>
                      </Pressable>
                    </View>
                  )}
                </View>

                <View style={styles.sectionCard}>
                  <SectionHeading
                    title="Dados da empresa"
                    subtitle="As alterações serão aplicadas a todas as vagas desta conta."
                    action={!companyEditing && vacancies.length > 0 && (
                      <Pressable onPress={beginCompanyEditing} style={styles.textAction} accessibilityRole="button">
                        <Feather name="edit-2" size={14} color={colors.primaryDark} />
                        <Text style={styles.textActionLabel}>Editar empresa</Text>
                      </Pressable>
                    )}
                  />
                  <View style={styles.companyIdentity}>
                    <View style={styles.companyLogo}>
                      {companyLogoUri
                        ? <Image source={{ uri: companyLogoUri }} style={styles.companyLogoImage} accessibilityLabel="Ícone da empresa" />
                        : <Feather name="briefcase" size={21} color={colors.primaryDark} />}
                    </View>
                    <View style={styles.companyIdentityCopy}>
                      <Text style={styles.companyName}>{companyName || 'Empresa não informada'}</Text>
                      <Text style={styles.companyCaption}>{companyName ? 'Empresa identificada nas vagas publicadas' : 'Você ainda não publicou vagas com os dados da empresa.'}</Text>
                    </View>
                    <Pressable
                      style={[styles.logoButton, companyLogoUploading && styles.disabledButton]}
                      onPress={() => chooseAndUploadImage({
                        endpoint: '/recruiters/company/logo',
                        field: 'company_logo',
                        setBusy: setCompanyLogoUploading,
                        onUploaded: (response) => setRecruiter((current) => ({ ...current, company_logo_url: response.company_logo_url })),
                      })}
                      disabled={companyLogoUploading}
                      accessibilityRole="button"
                      accessibilityLabel={companyLogoUploading ? 'Enviando ícone da empresa' : 'Adicionar ou alterar ícone da empresa'}
                    >
                      <Feather name={companyLogoUploading ? 'loader' : 'camera'} size={13} color={colors.primaryDark} />
                      <Text style={styles.logoButtonText}>{companyLogoUploading ? 'Enviando...' : companyLogoUri ? 'Alterar ícone' : 'Adicionar ícone'}</Text>
                    </Pressable>
                  </View>
                  {companyEditing ? (
                    <View style={styles.formGrid}>
                      <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>Nome da empresa</Text>
                        <TextInput
                          style={styles.input}
                          value={companyDraft.company_name}
                          onChangeText={(value) => setCompanyDraft((current) => ({ ...current, company_name: value }))}
                          placeholder="Nome da empresa"
                          placeholderTextColor={colors.muted}
                          maxLength={255}
                        />
                      </View>
                      <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>Segmento</Text>
                        <TextInput
                          style={styles.input}
                          value={companyDraft.company_sector}
                          onChangeText={(value) => setCompanyDraft((current) => ({ ...current, company_sector: value }))}
                          placeholder="Ex.: Tecnologia"
                          placeholderTextColor={colors.muted}
                          maxLength={100}
                        />
                      </View>
                      <View style={[styles.formField, styles.companyDescriptionField]}>
                        <Text style={styles.fieldLabel}>Apresentação da empresa</Text>
                        <TextInput
                          style={[styles.input, styles.companyDescriptionInput]}
                          value={companyDraft.company_description}
                          onChangeText={(value) => setCompanyDraft((current) => ({ ...current, company_description: value }))}
                          placeholder="Conte brevemente sobre a empresa, sua atuação e seus valores."
                          placeholderTextColor={colors.muted}
                          maxLength={1000}
                          multiline
                          textAlignVertical="top"
                        />
                        <Text style={styles.descriptionCounter}>{companyDraft.company_description.length}/1000</Text>
                      </View>
                      <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>Localização</Text>
                        <TextInput
                          style={styles.input}
                          value={companyDraft.location}
                          onChangeText={(value) => setCompanyDraft((current) => ({ ...current, location: value }))}
                          placeholder="Cidade, estado"
                          placeholderTextColor={colors.muted}
                          maxLength={255}
                        />
                      </View>
                      <InfoField label="CNPJ" value={companyDocument} />
                      <View style={styles.formActions}>
                        <Pressable style={styles.secondaryButton} onPress={cancelCompanyEditing} disabled={companySaving} accessibilityRole="button">
                          <Text style={styles.secondaryButtonText}>Cancelar</Text>
                        </Pressable>
                        <Pressable style={[styles.primaryButton, companySaving && styles.disabledButton]} onPress={saveCompany} disabled={companySaving} accessibilityRole="button">
                          <Feather name={companySaving ? 'loader' : 'check'} size={15} color={colors.ink} />
                          <Text style={styles.primaryButtonText}>{companySaving ? 'Salvando...' : 'Salvar empresa'}</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.infoGrid}>
                      <InfoField label="Nome da empresa" value={companyName} />
                      <InfoField label="CNPJ" value={companyDocument} />
                      <InfoField label="Segmento" value={companySector} />
                      <InfoField label="Localização" value={companyLocation} />
                      <InfoField label="E-mail corporativo" value="" />
                      <InfoField label="Site" value="" />
                      <InfoField label="Descrição" value="" />
                    </View>
                  )}
                  <Text style={styles.helperText}>
                    {vacancies.length
                      ? 'Nome, segmento e localização são compartilhados pelas vagas vinculadas a esta conta. O ícone da empresa é salvo na conta do responsável.'
                      : 'Publique uma vaga para cadastrar e editar os dados compartilhados da empresa. O ícone pode ser adicionado a qualquer momento.'}
                  </Text>
                </View>
              </View>

              <View style={styles.sideColumn}>
                <View style={styles.sectionCard}>
                  <SectionHeading title="Resumo da empresa" subtitle="Indicadores calculados a partir dos dados cadastrados." />
                  <View style={styles.metricsGrid}>
                    <Metric icon="briefcase" label="Vagas publicadas" value={vacancyTotal ?? '—'} />
                    <Metric icon="users" label="Candidatos recebidos" value={candidateTotal ?? '—'} />
                    <Metric icon="check-circle" label="Vagas ativas" value={openVacancies} />
                  </View>
                  {(companySector || companyLocation) && (
                    <View style={styles.summaryDetails}>
                      {companySector ? <View style={styles.summaryLine}><Feather name="layers" size={15} color={colors.primaryDark} /><Text style={styles.summaryText}>{companySector}</Text></View> : null}
                      {companyLocation ? <View style={styles.summaryLine}><Feather name="map-pin" size={15} color={colors.primaryDark} /><Text style={styles.summaryText}>{companyLocation}</Text></View> : null}
                    </View>
                  )}
                </View>

                <View style={styles.sectionCard}>
                  <SectionHeading title="Atividade da conta" />
                  <View style={styles.activityList}>
                    <View style={styles.activityRow}>
                      <Feather name="calendar" size={16} color={colors.primaryDark} />
                      <View style={styles.activityCopy}><Text style={styles.activityLabel}>Data de cadastro</Text><Text style={styles.activityValue}>{formatDate(recruiter.created_at) || 'Não disponível'}</Text></View>
                    </View>
                    <View style={styles.activityRow}>
                      <Feather name="check-circle" size={16} color={recruiter.verified_email ? colors.limeDark : colors.muted} />
                      <View style={styles.activityCopy}><Text style={styles.activityLabel}>E-mail</Text><Text style={styles.activityValue}>{recruiter.verified_email ? 'Verificado' : 'Status não disponível'}</Text></View>
                    </View>
                    <View style={styles.activityRow}>
                      <Feather name="briefcase" size={16} color={colors.primaryDark} />
                      <View style={styles.activityCopy}><Text style={styles.activityLabel}>Conta vinculada</Text><Text style={styles.activityValue}>{companyName || 'Dados da empresa pendentes'}</Text></View>
                    </View>
                  </View>
                </View>

                <View style={styles.sectionCard}>
                  <SectionHeading title="Preferências e acesso" />
                  <View style={styles.preferenceRow}>
                    <View style={styles.preferenceCopy}>
                      <Text style={styles.activityLabel}>Notificações por e-mail</Text>
                      <Text style={styles.preferenceDescription}>Receba atualizações relacionadas à sua conta.</Text>
                    </View>
                    <Pressable
                      style={[styles.toggle, recruiter.active_notification && styles.toggleActive, notificationBusy && styles.disabledButton]}
                      onPress={toggleNotifications}
                      disabled={notificationBusy}
                      accessibilityRole="switch"
                      accessibilityState={{ checked: Boolean(recruiter.active_notification), disabled: notificationBusy }}
                      accessibilityLabel="Notificações por e-mail"
                    >
                      <View style={[styles.toggleKnob, recruiter.active_notification && styles.toggleKnobActive]} />
                    </Pressable>
                  </View>
                  <Pressable style={styles.signOutButton} onPress={signOut} accessibilityRole="button">
                    <Feather name="log-out" size={15} color={colors.danger} />
                    <Text style={styles.signOutText}>Sair da conta</Text>
                  </Pressable>
                </View>

                <View style={styles.securityCard}>
                  <View style={styles.securityHeading}>
                    <View style={styles.securityIcon}><Feather name="shield" size={18} color={colors.primaryDark} /></View>
                    <View style={styles.securityHeadingCopy}>
                      <Text style={styles.sectionTitle}>Segurança da conta</Text>
                      <Text style={styles.sectionSubtitle}>Seu acesso empresarial está protegido.</Text>
                    </View>
                  </View>
                  <View style={styles.securityCheck}><Feather name="check" size={15} color={colors.limeDark} /><Text style={styles.securityCheckText}>Conta ativa</Text></View>
                  <View style={styles.securityCheck}><Feather name={recruiter.verified_email ? 'check' : 'minus'} size={15} color={recruiter.verified_email ? colors.limeDark : colors.muted} /><Text style={styles.securityCheckText}>{recruiter.verified_email ? 'E-mail verificado' : 'E-mail cadastrado'}</Text></View>
                  <View style={styles.securityCheck}><Feather name="check" size={15} color={colors.limeDark} /><Text style={styles.securityCheckText}>Acesso empresarial protegido</Text></View>
                  <Pressable
                    style={styles.securityButton}
                    onPress={() => {
                      setPasswordOpen((current) => !current);
                      setPasswordStep('request');
                      setResetCode('');
                      setNewPassword('');
                      setFeedback(null);
                    }}
                    accessibilityRole="button"
                  >
                    <Feather name="lock" size={15} color={colors.primaryDark} />
                    <Text style={styles.securityButtonText}>{passwordOpen ? 'Fechar alteração de senha' : 'Alterar senha'}</Text>
                  </Pressable>
                  {passwordOpen && (
                    <View style={styles.passwordPanel}>
                      {passwordStep === 'request' ? (
                        <>
                          <Text style={styles.passwordHint}>Enviaremos um código de recuperação para {recruiter.email}.</Text>
                          <Pressable style={[styles.primaryButton, passwordBusy && styles.disabledButton]} onPress={requestPasswordReset} disabled={passwordBusy} accessibilityRole="button">
                            <Text style={styles.primaryButtonText}>{passwordBusy ? 'Enviando...' : 'Enviar código'}</Text>
                          </Pressable>
                        </>
                      ) : (
                        <>
                          <Text style={styles.passwordHint}>Informe o código de 6 dígitos recebido e escolha uma senha com pelo menos 8 caracteres.</Text>
                          <TextInput
                            style={styles.input}
                            value={resetCode}
                            onChangeText={(value) => setResetCode(value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="Código de recuperação"
                            placeholderTextColor={colors.muted}
                            keyboardType="number-pad"
                            maxLength={6}
                          />
                          <TextInput
                            style={[styles.input, styles.passwordInput]}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Nova senha"
                            placeholderTextColor={colors.muted}
                            secureTextEntry
                            maxLength={128}
                          />
                          <Pressable style={[styles.primaryButton, passwordBusy && styles.disabledButton]} onPress={resetPassword} disabled={passwordBusy} accessibilityRole="button">
                            <Text style={styles.primaryButtonText}>{passwordBusy ? 'Salvando...' : 'Salvar nova senha'}</Text>
                          </Pressable>
                        </>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  page: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 28, paddingBottom: 52 },
  headingRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 22 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', marginRight: 13 },
  headingCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.primaryDark, fontSize: 10, fontWeight: '800', letterSpacing: 1.25, marginBottom: 4 },
  pageTitle: { color: colors.ink, fontSize: 29, fontWeight: '700', letterSpacing: -0.7 },
  pageSubtitle: { color: colors.inkSoft, fontSize: 13, lineHeight: 19, marginTop: 5, maxWidth: 620 },
  feedback: { flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderRadius: 10, paddingHorizontal: 13, paddingVertical: 11, marginBottom: 14 },
  feedbackSuccess: { backgroundColor: colors.limeWash, borderColor: colors.line },
  feedbackError: { backgroundColor: colors.surface, borderColor: colors.line },
  feedbackText: { flex: 1, color: colors.inkSoft, fontSize: 12, lineHeight: 17 },
  feedbackErrorText: { color: colors.danger },
  loadingPanel: { minHeight: 170, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 15, padding: 24 },
  loadingText: { color: colors.inkSoft, fontSize: 14 },
  profileCard: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20, padding: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 16, marginBottom: 16 },
  profileIdentity: { flexDirection: 'row', alignItems: 'center', gap: 15, flex: 1, minWidth: 240 },
  avatar: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryWash },
  avatarImage: { width: '100%', height: '100%', borderRadius: 18 },
  imageEditBadge: { position: 'absolute', right: -4, bottom: -4, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.surface },
  avatarText: { color: colors.primaryDark, fontSize: 27, fontWeight: '800' },
  profileCopy: { flex: 1, minWidth: 0 },
  profileName: { color: colors.ink, fontSize: 21, fontWeight: '800', letterSpacing: -0.3 },
  profileRole: { color: colors.inkSoft, fontSize: 13, marginTop: 4 },
  profileEmail: { color: colors.primaryDark, fontSize: 13, marginTop: 9 },
  profilePhone: { color: colors.muted, fontSize: 12, marginTop: 3 },
  profileActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: 11 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.limeWash, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 20 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.limeDark },
  statusText: { color: colors.inkSoft, fontSize: 11, fontWeight: '700' },
  primaryButton: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 14, borderRadius: 9, backgroundColor: colors.primary },
  primaryButtonText: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  disabledButton: { opacity: 0.6 },
  mainGrid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 16 },
  mainColumn: { flex: 1.7, flexBasis: 560, minWidth: 0, gap: 16 },
  sideColumn: { flex: 1, flexBasis: 300, minWidth: 0, gap: 16 },
  sectionCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 15, padding: 20 },
  sectionHeading: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18 },
  sectionHeadingCopy: { flex: 1, minWidth: 0 },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  sectionSubtitle: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 4 },
  textAction: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, paddingHorizontal: 7 },
  textActionLabel: { color: colors.primaryDark, fontSize: 12, fontWeight: '700' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 20 },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14 },
  infoField: { flexBasis: '50%', minWidth: 190, paddingRight: 14 },
  formField: { flexBasis: '50%', minWidth: 210, paddingRight: 14 },
  companyDescriptionField: { flexBasis: '100%' },
  fieldLabel: { color: colors.muted, fontSize: 11, fontWeight: '700', marginBottom: 5 },
  fieldValue: { color: colors.ink, fontSize: 13, lineHeight: 19 },
  emptyValue: { color: colors.muted, fontStyle: 'italic', fontSize: 12 },
  input: { minHeight: 42, borderWidth: 1, borderColor: colors.line, borderRadius: 9, paddingHorizontal: 11, color: colors.ink, fontSize: 13, backgroundColor: colors.surface, outlineStyle: 'none' },
  companyDescriptionInput: { minHeight: 96, paddingVertical: 10 },
  descriptionCounter: { alignSelf: 'flex-end', color: colors.muted, fontSize: 10, marginTop: 4 },
  readOnly: { color: colors.muted, backgroundColor: colors.surfaceSoft },
  formActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 9, marginTop: 18, paddingTop: 15, borderTopWidth: 1, borderTopColor: colors.line },
  secondaryButton: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 14, borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.surface },
  secondaryButtonText: { color: colors.inkSoft, fontSize: 12, fontWeight: '700' },
  companyIdentity: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 17, borderBottomWidth: 1, borderBottomColor: colors.line },
  companyLogo: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 14, backgroundColor: colors.primaryWash },
  companyLogoImage: { width: '100%', height: '100%' },
  companyIdentityCopy: { flex: 1, minWidth: 0 },
  companyName: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  companyCaption: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 4 },
  logoButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 7, backgroundColor: colors.surfaceSoft },
  logoButtonText: { color: colors.primaryDark, fontSize: 10, fontWeight: '700' },
  helperText: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 17 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metricCard: { flex: 1, minWidth: 90, backgroundColor: colors.surfaceSoft, borderRadius: 11, padding: 12 },
  metricIcon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: colors.primaryWash, marginBottom: 12 },
  metricValue: { color: colors.ink, fontSize: 22, fontWeight: '800' },
  metricLabel: { color: colors.inkSoft, fontSize: 10, lineHeight: 14, marginTop: 3 },
  summaryDetails: { gap: 10, marginTop: 17, paddingTop: 15, borderTopWidth: 1, borderTopColor: colors.line },
  summaryLine: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  summaryText: { flex: 1, color: colors.inkSoft, fontSize: 12 },
  activityList: { gap: 14 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  activityCopy: { flex: 1 },
  activityLabel: { color: colors.muted, fontSize: 10, fontWeight: '600' },
  activityValue: { color: colors.ink, fontSize: 12, fontWeight: '700', marginTop: 2 },
  preferenceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: colors.line },
  preferenceCopy: { flex: 1 },
  preferenceDescription: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  toggle: { width: 42, height: 24, justifyContent: 'center', padding: 3, borderRadius: 12, backgroundColor: colors.line },
  toggleActive: { backgroundColor: colors.primary },
  toggleKnob: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.surface },
  toggleKnobActive: { alignSelf: 'flex-end' },
  signOutButton: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingTop: 15 },
  signOutText: { color: colors.danger, fontSize: 12, fontWeight: '700' },
  securityCard: { padding: 19, borderWidth: 1, borderColor: colors.line, borderRadius: 15, backgroundColor: colors.primaryWash },
  securityHeading: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 16 },
  securityIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  securityHeadingCopy: { flex: 1 },
  securityCheck: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 9 },
  securityCheckText: { color: colors.inkSoft, fontSize: 11 },
  securityButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 7, borderWidth: 1, borderColor: colors.line, borderRadius: 9, backgroundColor: colors.surface },
  securityButtonText: { color: colors.primaryDark, fontSize: 11, fontWeight: '800' },
  passwordPanel: { gap: 9, marginTop: 13, paddingTop: 13, borderTopWidth: 1, borderTopColor: colors.line },
  passwordHint: { color: colors.inkSoft, fontSize: 11, lineHeight: 16, marginBottom: 2 },
  passwordInput: { marginTop: 1 },
});
