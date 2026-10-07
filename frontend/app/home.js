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
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { API_URL, apiFetch, clearSession, getSession } from '../lib/api';
import { colors } from '../lib/theme';

function getImageUri(value) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const path = value.startsWith('/') ? value : `/uploads/${value}`;
  return `${API_URL.replace(/\/api\/?$/, '')}${path}`;
}

export default function Home() {
  const { nome, email } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const summaryCardWidth = width >= 900 ? '23%' : width >= 600 ? '47%' : '100%';
  const [menuAberto, setMenuAberto] = useState(false);
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
  const [vaga, setVaga] = useState({ titulo: '', descricao: '', requisitos: '' });
  const [vagasEmpresa, setVagasEmpresa] = useState([]);
  const [empresa, setEmpresa] = useState({ nome: '', telefone: '' });

  const fecharTudo = () => setMenuAberto(false);

  const sair = async () => {
    fecharTudo();
    await clearSession();
    router.replace('/');
  };

  const navegarMenu = (rota) => {
    fecharTudo();
    router.push({
      pathname: rota,
      params: {
        nome: empresas[0]?.nome || nome,
        email: empresas[0]?.email || email,
      },
    });
  };

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
    setVaga({ titulo: '', descricao: '', requisitos: '' });
    setVagaModalAberto(true);
  };

  const abrirVagas = async (empresaAtual) => {
    setEmpresaSelecionada(empresaAtual);
    setVagasEmpresa([]);
    setVagasModalAberto(true);
    try {
      const dados = await apiFetch('/recruiters/vacancies?limit=50');
      setVagasEmpresa(dados.vacancies || dados.vagas || []);
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
          company_name: empresaSelecionada.nome,
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

      {/* HEADER */}
      <View style={styles.header}>

        <TouchableOpacity style={styles.headerButton} onPress={() => setMenuAberto(true)} accessibilityLabel="Abrir menu">
          <Feather name="menu" size={21} color={colors.ink} />
        </TouchableOpacity>

        <View style={styles.headerBrand}>
          <View style={styles.headerMark}><Feather name="link-2" size={15} color={colors.ink} /></View>
          <Text style={styles.headerTitle}>Conecta Fácil</Text>
        </View>

        <TouchableOpacity style={styles.headerButton} onPress={() => navegarMenu('/perfil')} accessibilityLabel="Abrir perfil">
          {avatarUrl
            ? <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} onError={() => setAvatarUrl(null)} accessibilityLabel="Foto do perfil" />
            : <Feather name="user" size={19} color={colors.primaryDark} />}
        </TouchableOpacity>

      </View>

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

        <View style={styles.section}>
          <View style={styles.companyListHeader}>
            <Text style={styles.sectionTitle}>Perfil do recrutador</Text>
            <Text style={styles.companyCount}>{carregandoEmpresas ? '…' : erroEmpresas || !dashboard ? '—' : dashboard.profileCount}</Text>
          </View>
          {carregandoEmpresas ? (
            <View style={styles.profileLoading}><Feather name="loader" size={16} color={colors.primaryDark} /><Text style={styles.emptyCompanyText}>Carregando perfil…</Text></View>
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
                    : <Feather name="briefcase" size={20} color={colors.ink} />}
                </View>
                <View style={styles.companyItemContent}>
                  <Text style={styles.companyItemTitle}>{empresaAtual.nome}</Text>
                  <Text style={styles.companyItemDetails}>{empresaAtual.email}</Text>
                  {empresaAtual.telefone ? <Text style={styles.companyItemViews}>{empresaAtual.telefone}</Text> : null}
                </View>
              </View>
              <View style={styles.companyActions}>
                <TouchableOpacity style={styles.companyActionButton} onPress={() => abrirEdicao(empresaAtual)} accessibilityRole="button" accessibilityLabel="Editar perfil do recrutador">
                  <Feather name="edit-2" size={17} color={colors.inkSoft} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.companyActionButton, styles.addJobButton]} onPress={() => abrirCadastroVaga(empresaAtual)} accessibilityRole="button" accessibilityLabel="Adicionar vaga">
                  <Feather name="plus" size={18} color={colors.primaryDark} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.companyActionButton} onPress={() => abrirVagas(empresaAtual)} accessibilityRole="button" accessibilityLabel="Gerenciar vagas cadastradas">
                  <Feather name="list" size={17} color={colors.inkSoft} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.dashboardSection}>
          <Text style={styles.sectionTitle}>Resumo</Text>
          {carregandoDashboard ? (
            <View style={styles.summaryGrid}>
              {['Vagas ativas', 'Candidaturas recebidas', 'Processos em andamento', 'Vagas encerradas'].map((label) => (
                <View key={label} style={[styles.summaryLoading, { width: summaryCardWidth }]}>
                  <Text style={styles.summaryLabel}>{label}</Text>
                  <View style={styles.summaryLoadingStatus}>
                    <Feather name="loader" size={15} color={colors.primary} />
                    <Text style={styles.summaryHint}>Carregando dados</Text>
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
              <View style={[styles.summaryCard, { width: summaryCardWidth }]}>
                <Text style={styles.summaryLabel}>Vagas ativas</Text>
                <Text style={styles.summaryValue}>{dashboard?.vacancies?.open ?? '—'}</Text>
                {dashboard?.vacancies?.open === 0 ? <Text style={styles.summaryHint}>Você ainda não possui vagas ativas.</Text> : null}
              </View>
              <View style={[styles.summaryCard, { width: summaryCardWidth }]}>
                <Text style={styles.summaryLabel}>Candidaturas recebidas</Text>
                <Text style={styles.summaryValue}>{dashboard?.applications?.total ?? '—'}</Text>
                {dashboard?.applications?.total === 0 ? <Text style={styles.summaryHint}>Nenhuma candidatura recebida.</Text> : null}
              </View>
              <View style={[styles.summaryCard, { width: summaryCardWidth }]}>
                <Text style={styles.summaryLabel}>Processos em andamento</Text>
                <Text style={styles.summaryUnavailable}>Não disponível</Text>
                <Text style={styles.summaryHint}>O sistema não registra essa etapa.</Text>
              </View>
              <View style={[styles.summaryCard, { width: summaryCardWidth }]}>
                <Text style={styles.summaryLabel}>Vagas encerradas</Text>
                <Text style={styles.summaryValue}>{dashboard?.vacancies?.closed ?? '—'}</Text>
              </View>
            </View>
          )}
        </View>

        {!carregandoDashboard && !erroDashboard ? (
          <View style={styles.dashboardSection}>
            <Text style={styles.sectionTitle}>Atividades recentes</Text>
            {!dashboard?.activities?.length ? (
              <View style={styles.dashboardMessage}>
                <Text style={styles.emptyCompanyText}>Nenhuma atividade recente.</Text>
              </View>
            ) : dashboard.activities.map((activity, index) => (
              <View key={`${activity.type}-${activity.created_at}-${index}`} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Feather name={activity.type === 'VACANCY_CREATED' ? 'briefcase' : 'file-text'} size={16} color={colors.ink} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                </View>
                <Text style={styles.activityDate}>{activity.created_at ? new Date(activity.created_at).toLocaleDateString('pt-BR') : ''}</Text>
              </View>
            ))}
          </View>
        ) : null}

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
                {!cadastrandoEmpresa && <Feather name="check" size={19} color={colors.ink} />}
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
                <Text style={styles.companyModalSubtitle}>{empresaSelecionada?.nome}</Text>
              </View>
              <TouchableOpacity onPress={() => setVagaModalAberto(false)} style={styles.modalCloseButton} accessibilityLabel="Fechar cadastro de vaga">
                <Feather name="x" size={23} color={colors.ink} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
                {!cadastrandoEmpresa && <Feather name="send" size={18} color={colors.ink} />}
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
                <Text style={styles.companyModalTitle}>Vagas cadastradas</Text>
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
                  <Text style={styles.emptyCompanyText}>Nenhuma vaga cadastrada para esta empresa.</Text>
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

      {/* MENU LATERAL */}
      <Modal
        visible={menuAberto}
        transparent
        animationType="fade"
        onRequestClose={fecharTudo}
      >

        <View style={styles.modalContainer}>

          <TouchableOpacity
            style={styles.overlay}
            onPress={fecharTudo}
          />

          <View style={styles.sidebar}>

            <View style={styles.sidebarHeader}>

              <View style={styles.sidebarBrand}><View style={styles.headerMark}><Feather name="link-2" size={14} color={colors.ink} /></View><Text style={styles.sidebarTitle}>Conecta Fácil</Text></View>

              <TouchableOpacity
                onPress={fecharTudo}
              >
                <Feather name="x" size={21} color={colors.inkSoft} />
              </TouchableOpacity>

            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => fecharTudo()}
            >
              <Feather style={styles.menuIcon} name="home" size={18} color={colors.primaryDark} />
              <Text style={styles.menuText}>
                Início
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navegarMenu('/candidaturas')}
            >
              <Feather style={styles.menuIcon} name="file-text" size={17} color={colors.muted} />
              <Text style={styles.menuText}>
                Candidaturas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navegarMenu('/vagas')}
            >
              <Feather style={styles.menuIcon} name="briefcase" size={17} color={colors.muted} />
              <Text style={styles.menuText}>
                Vagas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navegarMenu('/perfil')}
            >
              <Feather style={styles.menuIcon} name="user" size={17} color={colors.muted} />
              <Text style={styles.menuText}>
                Meu perfil
              </Text>
            </TouchableOpacity>

            <View style={styles.menuSeparator} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={sair}
            >
              <Feather style={styles.menuIcon} name="log-out" size={17} color={colors.danger} />
              <Text style={styles.menuText}>
                Sair
              </Text>
            </TouchableOpacity>

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

  header: {
    minHeight: 68,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },

  headerButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.surfaceSoft,
  },
  headerAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },

  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  headerMark: {
    width: 29,
    height: 29,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.3,
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
    fontSize: 15,
    color: colors.muted,
    fontSize: 14,
    marginBottom: 26,
  },

  companyListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  summaryCard: {
    minHeight: 120,
    justifyContent: 'center',
    padding: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderRadius: 14,
  },

  summaryLabel: {
    color: colors.inkSoft,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },

  summaryValue: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
  },

  summaryUnavailable: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },

  summaryHint: {
    color: colors.inkSoft,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },

  summaryLoading: {
    minHeight: 120,
    justifyContent: 'center',
    padding: 17,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    backgroundColor: colors.surface,
  },

  summaryLoadingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },

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
  },

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
  },

  profileLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 10,
  },

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

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 14,
    letterSpacing: -0.3,
  },

  companyCount: {
    minWidth: 28,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
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
    gap: 5,
  },

  companyActionButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSoft,
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

  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  sidebar: {
    width: '78%',
    maxWidth: 310,
    backgroundColor: colors.surface,
    paddingTop: 28,
    paddingHorizontal: 20,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },

  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 26,
  },

  sidebarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  sidebarTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },

  menuIcon: {
    width: 35,
  },

  menuText: {
    fontSize: 16,
    color: colors.ink,
    fontWeight: '600',
  },

  menuSeparator: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 10,
  },

  companyModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.46)',
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
    color: colors.ink,
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