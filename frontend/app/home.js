import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Platform,
  Pressable,
  useWindowDimensions,
} from 'react-native';

import { Badge, Card, IconButton, SectionHeader, Skeleton, StatCard } from '../components/ui/Primitives';
import { API_URL, apiFetch, getSession } from '../lib/api';
import { colors } from '../lib/theme';

function getImageUri(value) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const path = value.startsWith('/') ? value : `/uploads/${value}`;
  return `${API_URL.replace(/\/api\/?$/, '')}${path}`;
}

function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? new Intl.NumberFormat('pt-BR').format(number) : '—';
}

function formatProfileCount(value) {
  const count = Number(value);
  if (!Number.isFinite(count)) return 'Quantidade de perfis indisponível';
  const formattedCount = formatNumber(count);
  return count === 1
    ? `${formattedCount} perfil de recrutador cadastrado`
    : `${formattedCount} perfis de recrutador cadastrados`;
}

function formatActivityDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function Home() {
  const { width } = useWindowDimensions();
  const summaryCardWidth = width >= 1280 ? '23%' : width >= 600 ? '47%' : '100%';
  const [editarEmpresaModalAberto, setEditarEmpresaModalAberto] = useState(false);
  const [vagaModalAberto, setVagaModalAberto] = useState(false);
  const [vagasModalAberto, setVagasModalAberto] = useState(false);
  const [cadastrandoEmpresa, setCadastrandoEmpresa] = useState(false);
  const [carregandoEmpresas, setCarregandoEmpresas] = useState(true);
  const [erroEmpresas, setErroEmpresas] = useState('');
  const [empresas, setEmpresas] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [carregandoDashboard, setCarregandoDashboard] = useState(true);
  const [erroDashboard, setErroDashboard] = useState('');
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [vaga, setVaga] = useState({ nomeEmpresa: '', descricaoEmpresa: '', titulo: '', descricao: '', requisitos: '' });
  const [vagasEmpresa, setVagasEmpresa] = useState([]);
  const [empresa, setEmpresa] = useState({ nome: '', telefone: '' });

  const atualizarEmpresa = (campo, valor) => {
    setEmpresa((atual) => ({ ...atual, [campo]: valor }));
  };

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, '').slice(0, 11);
    if (!numeros) return '';
    if (numeros.length <= 2) return `(${numeros}`;
    if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  };

  async function carregarEmpresas() {
    setCarregandoEmpresas(true);
    setCarregandoDashboard(true);
    setErroEmpresas('');
    setErroDashboard('');
    setEmpresas([]);
    setDashboard(null);
    const [profileResult, dashboardResult] = await Promise.allSettled([
      apiFetch('/recruiters/profile'),
      apiFetch('/recruiters/dashboard'),
    ]);

    if (profileResult.status === 'fulfilled') {
      const recrutador = profileResult.value.recruiter;
      setAvatarUrl(getImageUri(recrutador.avatar_url));
      setEmpresas([{
        id: recrutador.id,
        nome: recrutador.full_name,
        email: recrutador.email,
        telefone: recrutador.phone || '',
      }]);
    } else {
      const erro = profileResult.reason;
      setErroEmpresas(erro instanceof TypeError
        ? 'Não foi possível conectar ao servidor. Tente novamente.'
        : erro.message || 'Não foi possível carregar o perfil agora.');
    }

    if (dashboardResult.status === 'fulfilled') {
      setDashboard(dashboardResult.value);
    } else {
      const erro = dashboardResult.reason;
      setErroDashboard(erro instanceof TypeError
        ? 'Não foi possível conectar ao servidor.'
        : erro.message || 'Não foi possível carregar o resumo.');
    }

    setCarregandoEmpresas(false);
    setCarregandoDashboard(false);
  }

  useFocusEffect(useCallback(() => {
    let active = true;
    getSession().then(({ token }) => {
      if (!active) return;
      if (!token) {
        router.replace('/login');
        return;
      }
      carregarEmpresas();
    });
    return () => {
      active = false;
    };
  }, []));

  const abrirEdicao = (empresaAtual) => {
    setEmpresaSelecionada(empresaAtual);
    setEmpresa({
      nome: empresaAtual.nome,
      telefone: empresaAtual.telefone,
    });
    setEditarEmpresaModalAberto(true);
  };

  const salvarEdicao = async () => {
    if (!empresaSelecionada || !empresa.nome.trim()) {
      Alert.alert('Nome obrigatório', 'Informe o nome do responsável para continuar.');
      return;
    }

    setCadastrandoEmpresa(true);
    try {
      await apiFetch('/recruiters/profile', {
        method: 'PUT',
        body: JSON.stringify({ full_name: empresa.nome, phone: empresa.telefone }),
      });
      Alert.alert('Perfil atualizado', 'Os dados do responsável foram salvos.');
      setEditarEmpresaModalAberto(false);
      carregarEmpresas();
    } catch (erro) {
      Alert.alert('Edição não realizada', erro instanceof TypeError ? 'Não foi possível conectar ao servidor.' : erro.message);
    } finally {
      setCadastrandoEmpresa(false);
    }
  };

  const abrirCadastroVaga = (empresaAtual) => {
    setEmpresaSelecionada(empresaAtual);
    setVaga({ nomeEmpresa: '', descricaoEmpresa: '', titulo: '', descricao: '', requisitos: '' });
    setVagaModalAberto(true);
  };

  const abrirVagas = async (empresaAtual) => {
    setEmpresaSelecionada(empresaAtual);
    setVagasEmpresa([]);
    setVagasModalAberto(true);
    try {
      const dados = await apiFetch('/recruiters/vacancies?limit=50&status=OPEN');
      const ativas = (dados.vacancies || dados.vagas || []).filter((vaga) => vaga.status === 'OPEN' || !vaga.status);
      setVagasEmpresa(ativas);
    } catch (erro) {
      setVagasModalAberto(false);
      Alert.alert('Erro', erro instanceof TypeError ? 'Não foi possível conectar ao servidor.' : erro.message);
    }
  };

  const cadastrarVaga = async () => {
    if (!empresaSelecionada || !Object.values(vaga).every((campo) => campo.trim())) {
      Alert.alert('Dados incompletos', 'Preencha título, descrição e requisitos da vaga.');
      return;
    }

    setCadastrandoEmpresa(true);
    try {
      await apiFetch('/recruiters/vacancies', {
        method: 'POST',
        body: JSON.stringify({
          job_title: vaga.titulo,
          company_name: vaga.nomeEmpresa.trim(),
          company_description: vaga.descricaoEmpresa.trim(),
          job_description: vaga.descricao,
          requirements: vaga.requisitos,
        }),
      });
      Alert.alert('Vaga adicionada', 'A vaga foi publicada para os candidatos.');
      setVagaModalAberto(false);
      carregarEmpresas();
    } catch (erro) {
      Alert.alert('Cadastro não realizado', erro instanceof TypeError ? 'Não foi possível conectar ao servidor.' : erro.message);
    } finally {
      setCadastrandoEmpresa(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* CONTEÚDO */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.welcome}>
          {empresas[0]?.nome ? `Bem-vindo, ${empresas[0].nome}!` : 'Bem-vindo!'}
        </Text>

        <Text style={styles.description}>
          {empresas[0]?.email ? `Sua conta empresarial · ${empresas[0].email}` : 'Painel do recrutador'}
        </Text>

        <Card style={styles.section}>
          <SectionHeader
            title="Perfil do recrutador"
            action={(
              <Badge
                accessibilityLabel={carregandoEmpresas ? 'Carregando quantidade de perfis' : erroEmpresas || !dashboard ? 'Quantidade de perfis indisponível' : formatProfileCount(dashboard.profileCount)}
                title="Quantidade de perfis de recrutador cadastrados"
              >
                {carregandoEmpresas ? '…' : erroEmpresas || !dashboard ? '—' : formatNumber(dashboard.profileCount)}
              </Badge>
            )}
          />
          {carregandoEmpresas ? (
            <View style={styles.profileLoading} accessibilityLabel="Carregando perfil do recrutador">
              <Skeleton style={styles.profileSkeletonName} />
              <Skeleton style={styles.profileSkeletonDetails} />
            </View>
          ) : erroEmpresas ? (
            <View style={styles.profileError}><Text style={styles.emptyCompanyText}>{erroEmpresas}</Text><TouchableOpacity onPress={carregarEmpresas} style={styles.retryButton}><Text style={styles.retryText}>Tentar novamente</Text></TouchableOpacity></View>
          ) : empresas.length === 0 ? (
            <Text style={styles.emptyCompanyText}>Não foi possível carregar o perfil agora. Tente novamente em instantes.</Text>
          ) : empresas.map((empresaAtual) => (
            <View style={[styles.companyItem, width < 600 && styles.companyItemMobile]} key={empresaAtual.id}>
              <View style={styles.companyIdentity}>
                <View style={styles.companyAvatar}>
                  {avatarUrl
                    ? <Image source={{ uri: avatarUrl }} style={styles.companyAvatarImage} onError={() => setAvatarUrl(null)} accessibilityLabel="Foto do recrutador" />
                    : <Feather name="briefcase" size={20} color={colors.onPrimary} />}
                </View>
                <View style={styles.companyItemContent}>
                  <Text style={styles.companyItemTitle}>{empresaAtual.nome}</Text>
                  <Text style={styles.companyItemDetails}>{empresaAtual.email}</Text>
                  {empresaAtual.telefone ? <Text style={styles.companyItemViews}>{empresaAtual.telefone}</Text> : null}
                </View>
              </View>
              <View style={styles.companyActions}>
                <IconButton
                  icon="edit-2"
                  label="Editar perfil do recrutador"
                  onPress={() => abrirEdicao(empresaAtual)}
                  style={styles.companyActionButton}
                />
                <IconButton
                  icon="plus"
                  label="Adicionar vaga"
                  onPress={() => abrirCadastroVaga(empresaAtual)}
                  iconColor={colors.onPrimary}
                  style={[styles.companyActionButton, styles.addJobButton]}
                />
                <IconButton
                  icon="list"
                  label="Ver vagas ativas cadastradas"
                  onPress={() => abrirVagas(empresaAtual)}
                  style={styles.companyActionButton}
                />
              </View>
            </View>
          ))}
        </Card>

        <View style={styles.dashboardSection}>
          <SectionHeader title="Resumo" />
          {carregandoDashboard ? (
            <View style={styles.summaryGrid}>
              {['Vagas ativas', 'Candidaturas recebidas', 'Processos em andamento', 'Vagas encerradas'].map((label) => (
                <View key={label} style={[styles.summaryLoading, { width: summaryCardWidth }]} accessibilityLabel={`Carregando ${label.toLowerCase()}`}>
                  <View style={styles.summarySkeletons}>
                    <Skeleton style={styles.summarySkeletonLabel} />
                    <Skeleton style={styles.summarySkeletonValue} />
                    <Skeleton style={styles.summarySkeletonHint} />
                  </View>
                </View>
              ))}
            </View>
          ) : erroDashboard ? (
            <View style={styles.dashboardMessage}>
              <Text style={styles.emptyCompanyText}>Não foi possível carregar o resumo.</Text>
              <TouchableOpacity onPress={carregarEmpresas} style={styles.retryButton} accessibilityRole="button">
                <Text style={styles.retryText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.summaryGrid}>
              <StatCard
                label="Vagas ativas"
                value={formatNumber(dashboard?.vacancies?.open)}
                helper={dashboard?.vacancies?.open === 0 ? 'Você ainda não possui vagas ativas.' : ' '}
                style={{ width: summaryCardWidth }}
              />
              <StatCard
                label="Candidaturas recebidas"
                value={formatNumber(dashboard?.applications?.total)}
                helper={dashboard?.applications?.total === 0 ? 'Nenhuma candidatura recebida.' : ' '}
                style={{ width: summaryCardWidth }}
              />
              <StatCard
                label="Processos em andamento"
                value="-"
                helper="O sistema não registra essa etapa."
                neutral
                style={{ width: summaryCardWidth }}
              />
              <StatCard
                label="Vagas encerradas"
                value={formatNumber(dashboard?.vacancies?.closed)}
                helper=" "
                style={{ width: summaryCardWidth }}
              />
            </View>
          )}
        </View>

        <View style={styles.dashboardSection}>
          <SectionHeader title="Atividades recentes" />
          <Card style={styles.activityList}>
            {carregandoDashboard ? (
              <View style={styles.activityLoading} accessibilityLabel="Carregando atividades recentes">
                <Skeleton style={styles.activitySkeletonTitle} />
                <Skeleton style={styles.activitySkeletonDescription} />
              </View>
            ) : erroDashboard ? (
              <View style={styles.activityEmpty}>
                <Feather name="alert-circle" size={20} color={colors.warning} />
                <Text style={styles.emptyCompanyText}>Não foi possível carregar as atividades.</Text>
                <TouchableOpacity onPress={carregarEmpresas} style={styles.retryButton} accessibilityRole="button">
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            ) : !dashboard?.activities?.length ? (
              <View style={styles.activityEmpty}>
                <Feather name="activity" size={20} color={colors.textMuted} />
                <Text style={styles.emptyCompanyText}>Ainda não há atividades para mostrar.</Text>
              </View>
            ) : dashboard.activities.map((activity, index) => (
              <Pressable
                key={`${activity.type}-${activity.created_at}-${index}`}
                accessible={false}
                focusable={false}
                style={({ hovered }) => [styles.activityItem, hovered && styles.activityItemHovered]}
              >
                <View style={styles.activityIcon}>
                  <Feather name={activity.type === 'VACANCY_CREATED' ? 'briefcase' : 'file-text'} size={16} color={colors.onPrimary} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                </View>
                <Text style={styles.activityDate}>{formatActivityDate(activity.created_at)}</Text>
              </Pressable>
            ))}
          </Card>
        </View>

      </ScrollView>

      <Modal visible={editarEmpresaModalAberto} transparent animationType="fade" onRequestClose={() => setEditarEmpresaModalAberto(false)}>
        <View style={styles.companyModalOverlay}>
          <View style={styles.companyModal}>
            <View style={styles.companyModalHeader}>
              <View>
                <Text style={styles.companyModalTitle}>Editar perfil</Text>
                <Text style={styles.companyModalSubtitle}>Atualize nome e telefone de contato.</Text>
              </View>
              <TouchableOpacity onPress={() => setEditarEmpresaModalAberto(false)} style={styles.modalCloseButton} accessibilityLabel="Fechar edição">
                <Feather name="x" size={23} color={colors.ink} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {[
                ['nome', 'Nome do responsável', 'Nome completo', 'user'],
                ['telefone', 'Telefone de contato', '(00) 00000-0000', 'phone'],
              ].map(([campo, rotulo, placeholder, icone]) => (
                <View style={styles.companyField} key={campo}>
                  <Text style={styles.companyLabel}>{rotulo}</Text>
                  <View style={styles.companyInputRow}>
                    <Feather name={icone} size={18} color={colors.muted} />
                    <TextInput
                      style={styles.companyInput}
                      placeholder={placeholder}
                      placeholderTextColor={colors.muted}
                      value={empresa[campo]}
                      onChangeText={(valor) => atualizarEmpresa(campo, campo === 'telefone' ? formatarTelefone(valor) : valor)}
                      keyboardType={campo === 'telefone' ? 'phone-pad' : 'default'}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              ))}
              <TouchableOpacity style={[styles.companySubmit, cadastrandoEmpresa && styles.companySubmitDisabled]} onPress={salvarEdicao} disabled={cadastrandoEmpresa}>
                <Text style={styles.companySubmitText}>{cadastrandoEmpresa ? 'Salvando...' : 'Salvar alterações'}</Text>
                {!cadastrandoEmpresa && <Feather name="check" size={19} color={colors.onPrimary} />}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={vagaModalAberto} transparent animationType="fade" onRequestClose={() => setVagaModalAberto(false)}>
        <View style={styles.companyModalOverlay}>
          <View style={styles.companyModal}>
            <View style={styles.companyModalHeader}>
              <View>
                <Text style={styles.companyModalTitle}>Adicionar vaga</Text>
                <Text style={styles.companyModalSubtitle}>Informe os dados da empresa e da oportunidade.</Text>
              </View>
              <TouchableOpacity onPress={() => setVagaModalAberto(false)} style={styles.modalCloseButton} accessibilityLabel="Fechar cadastro de vaga">
                <Feather name="x" size={23} color={colors.ink} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.companyLabel}>Nome da empresa</Text>
              <View style={styles.companyInputRow}>
                <Feather name="briefcase" size={18} color={colors.muted} />
                <TextInput style={styles.companyInput} placeholder="Ex.: Mercado Central" placeholderTextColor={colors.muted} value={vaga.nomeEmpresa} onChangeText={(valor) => setVaga((atual) => ({ ...atual, nomeEmpresa: valor }))} autoCapitalize="words" />
              </View>
              <Text style={styles.companyLabel}>Breve apresentação da empresa</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Conte em poucas frases o que a empresa faz."
                placeholderTextColor={colors.muted}
                value={vaga.descricaoEmpresa}
                onChangeText={(valor) => setVaga((atual) => ({ ...atual, descricaoEmpresa: valor }))}
                multiline
                maxLength={1000}
                textAlignVertical="top"
              />
              <Text style={styles.companyLabel}>Título da vaga</Text>
              <View style={styles.companyInputRow}>
                <Feather name="briefcase" size={18} color={colors.muted} />
                <TextInput style={styles.companyInput} placeholder="Ex.: Estágio em tecnologia" placeholderTextColor={colors.muted} value={vaga.titulo} onChangeText={(valor) => setVaga((atual) => ({ ...atual, titulo: valor }))} />
              </View>
              <Text style={styles.companyLabel}>Descrição</Text>
              <TextInput style={styles.textArea} placeholder="Descreva as principais atividades" placeholderTextColor={colors.muted} value={vaga.descricao} onChangeText={(valor) => setVaga((atual) => ({ ...atual, descricao: valor }))} multiline textAlignVertical="top" />
              <Text style={styles.companyLabel}>Requisitos</Text>
              <TextInput style={styles.textArea} placeholder="Informe os requisitos necessários" placeholderTextColor={colors.muted} value={vaga.requisitos} onChangeText={(valor) => setVaga((atual) => ({ ...atual, requisitos: valor }))} multiline textAlignVertical="top" />
              <TouchableOpacity style={[styles.companySubmit, cadastrandoEmpresa && styles.companySubmitDisabled]} onPress={cadastrarVaga} disabled={cadastrandoEmpresa}>
                <Text style={styles.companySubmitText}>{cadastrandoEmpresa ? 'Publicando...' : 'Publicar vaga'}</Text>
                {!cadastrandoEmpresa && <Feather name="send" size={18} color={colors.onPrimary} />}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={vagasModalAberto} transparent animationType="fade" onRequestClose={() => setVagasModalAberto(false)}>
        <View style={styles.companyModalOverlay}>
          <View style={styles.viewersModal}>
            <View style={styles.companyModalHeader}>
              <View>
                <Text style={styles.companyModalTitle}>Vagas ativas</Text>
                <Text style={styles.companyModalSubtitle}>{empresaSelecionada?.nome}</Text>
              </View>
              <View style={styles.jobsBadge}>
                <Text style={styles.jobsBadgeText}>{vagasEmpresa.length}</Text>
              </View>
              <TouchableOpacity onPress={() => setVagasModalAberto(false)} style={styles.modalCloseButton} accessibilityLabel="Fechar vagas">
                <Feather name="x" size={23} color={colors.ink} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {vagasEmpresa.length === 0 ? (
                <View style={styles.emptyJobs}>
                  <Feather name="briefcase" size={32} color={colors.muted} />
                  <Text style={styles.emptyCompanyText}>Nenhuma vaga ativa cadastrada para esta empresa.</Text>
                </View>
              ) : vagasEmpresa.map((vagaAtual) => (
                <View style={styles.jobItem} key={vagaAtual.id}>
                  <View style={styles.jobIcon}><Feather name="briefcase" size={17} color={colors.primaryDark} /></View>
                  <View style={styles.jobContent}>
                    <Text style={styles.jobTitle}>{vagaAtual.job_title}</Text>
                    <Text style={styles.jobLabel}>Descrição</Text>
                    <Text style={styles.jobText}>{vagaAtual.job_description}</Text>
                    <Text style={styles.jobLabel}>Requisitos</Text>
                    <Text style={styles.jobText}>{vagaAtual.requirements || 'Não informado'}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },

  scroll: {
    flex: 1,
  },

  content: {
    width: '100%',
    maxWidth: 1080,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 56,
  },

  welcome: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 7,
    letterSpacing: -0.7,
  },

  description: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 26,
  },

  dashboardSection: {
    marginTop: 6,
    marginBottom: 22,
  },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },

  summaryLoading: {
    minHeight: 142,
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    backgroundColor: colors.surface,
  },

  summarySkeletons: { gap: 14 },
  summarySkeletonLabel: { width: '72%' },
  summarySkeletonValue: { width: 58, height: 28, borderRadius: 8 },
  summarySkeletonHint: { width: '92%' },

  dashboardMessage: {
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    backgroundColor: colors.surface,
    gap: 10,
  },

  activityItem: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    ...Platform.select({
      web: { transitionDuration: '150ms' },
      default: {},
    }),
  },
  activityItemHovered: { backgroundColor: colors.surfaceElevated },
  activityList: { overflow: 'hidden' },
  activityEmpty: { minHeight: 100, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20 },
  activityLoading: { minHeight: 100, justifyContent: 'center', gap: 14, padding: 20 },
  activitySkeletonTitle: { width: '35%', height: 16 },
  activitySkeletonDescription: { width: '68%' },

  activityIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.line,
  },

  activityContent: {
    flex: 1,
    minWidth: 0,
  },

  activityTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
  },

  activityDescription: {
    color: colors.inkSoft,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },

  activityDate: {
    color: colors.inkSoft,
    fontSize: 11,
    textAlign: 'right',
    minWidth: 76,
  },

  profileLoading: {
    gap: 12,
    paddingVertical: 10,
  },
  profileSkeletonName: { width: '38%', height: 16 },
  profileSkeletonDetails: { width: '56%' },

  profileError: {
    gap: 12,
    paddingVertical: 8,
  },

  retryButton: {
    alignSelf: 'flex-start',
    borderRadius: 9,
    backgroundColor: colors.primaryWash,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  retryText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },

  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.line,
  },

  emptyCompanyText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },

  companyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },

  companyItemMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 12,
  },

  companyIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  companyAvatar: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
    overflow: 'hidden',
  },
  companyAvatarImage: {
    width: '100%',
    height: '100%',
  },

  companyItemContent: {
    flex: 1,
  },

  companyItemTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },

  companyItemDetails: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },

  companyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },

  companyActionButton: {
    width: 44,
    height: 44,
  },

  addJobButton: {
    backgroundColor: colors.primary,
  },

  jobItem: {
    flexDirection: 'row',
    padding: 13,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },

  jobIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.primaryWash,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  jobContent: {
    flex: 1,
  },

  jobTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },

  jobLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 2,
  },

  jobText: {
    color: colors.inkSoft,
    fontSize: 13,
    lineHeight: 18,
  },

  jobsBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryWash,
  },

  jobsBadgeText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '800',
  },

  cardTitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 5,
    textAlign: 'center',
  },

  companyModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.overlay,
    padding: 18,
  },

  companyModal: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '92%',
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 28,
  },

  companyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },

  companyModalTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  companyModalSubtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 5,
    lineHeight: 20,
  },

  modalCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  companyField: {
    marginBottom: 14,
  },

  companyLabel: {
    color: colors.inkSoft,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 7,
    letterSpacing: 0.2,
  },

  companyInputRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },

  companyInput: {
    flex: 1,
    height: 50,
    color: colors.ink,
    paddingHorizontal: 11,
    fontSize: 14,
  },

  textArea: {
    minHeight: 92,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    backgroundColor: colors.surface,
    color: colors.ink,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 14,
  },

  companySubmit: {
    height: 53,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },

  companySubmitDisabled: {
    opacity: 0.6,
  },

  companySubmitText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '800',
  },

  viewersModal: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '75%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 28,
  },

});