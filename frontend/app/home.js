import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { apiFetch, clearSession, getSession } from '../lib/api';
import { colors } from '../lib/theme';

const { width } = Dimensions.get('window');

export default function Home() {
  const { nome, email } = useLocalSearchParams();
  const [menuAberto, setMenuAberto] = useState(false);
  const [empresaModalAberto, setEmpresaModalAberto] = useState(false);
  const [editarEmpresaModalAberto, setEditarEmpresaModalAberto] = useState(false);
  const [vagaModalAberto, setVagaModalAberto] = useState(false);
  const [vagasModalAberto, setVagasModalAberto] = useState(false);
  const [cadastrandoEmpresa, setCadastrandoEmpresa] = useState(false);
  const [carregandoEmpresas, setCarregandoEmpresas] = useState(true);
  const [erroEmpresas, setErroEmpresas] = useState('');
  const [empresas, setEmpresas] = useState([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [vaga, setVaga] = useState({ titulo: '', descricao: '', requisitos: '' });
  const [vagasEmpresa, setVagasEmpresa] = useState([]);
  const [empresa, setEmpresa] = useState({ nome: '', telefone: '' });

  useEffect(() => {
    getSession().then(({ token }) => {
      if (!token) {
        router.replace('/login');
        return;
      }
      carregarEmpresas();
    });
  }, []);

  const fecharTudo = () => setMenuAberto(false);

  const sair = async () => {
    fecharTudo();
    await clearSession();
    router.replace('/');
  };

  const navegarMenu = (rota) => {
    fecharTudo();
    router.push({ pathname: rota, params: { nome, email } });
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

  const carregarEmpresas = async () => {
    setCarregandoEmpresas(true);
    setErroEmpresas('');
    try {
      const dados = await apiFetch('/recruiters/profile');
      const recrutador = dados.recruiter;
      setEmpresas([{
        id: recrutador.id,
        nome: recrutador.full_name,
        email: recrutador.email,
        telefone: recrutador.phone || '',
      }]);
    } catch (erro) {
      setErroEmpresas(erro instanceof TypeError
        ? 'Não foi possível conectar ao servidor. Tente novamente.'
        : erro.message || 'Não foi possível carregar o perfil agora.');
    } finally {
      setCarregandoEmpresas(false);
    }
  };

  const cadastrarEmpresa = async () => {
    if (!empresa.nome.trim()) {
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
      setEmpresa({ nome: '', telefone: '' });
      setEmpresaModalAberto(false);
      carregarEmpresas();
    } catch (erro) {
      const mensagem = erro instanceof TypeError
        ? 'Não foi possível conectar ao servidor. Verifique se o backend está ativo.'
        : erro.message;
      Alert.alert('Não foi possível atualizar', mensagem);
    } finally {
      setCadastrandoEmpresa(false);
    }
  };

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
          <Feather name="menu" size={21} color="#243630" />
        </TouchableOpacity>

        <View style={styles.headerBrand}>
          <View style={styles.headerMark}><Feather name="link-2" size={15} color="#FFFFFF" /></View>
          <Text style={styles.headerTitle}>Conecta Fácil</Text>
        </View>

        <TouchableOpacity style={styles.headerButton} onPress={() => navegarMenu('/perfil')} accessibilityLabel="Abrir perfil">
          <Feather name="user" size={19} color="#31594A" />
        </TouchableOpacity>

      </View>

      {/* CONTEÚDO */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.welcome}>
          Bem-vindo{nome ? `, ${nome}` : ''}!
        </Text>

        <Text style={styles.description}>
          {email ? `Sua conta empresarial · ${email}` : 'Gerencie o perfil da empresa e as oportunidades em um só lugar.'}
        </Text>

        <TouchableOpacity style={styles.companyCta} onPress={() => {
          setEmpresa({ nome: empresas[0]?.nome || nome || '', telefone: empresas[0]?.telefone || '' });
          setEmpresaModalAberto(true);
        }} activeOpacity={0.85}>
          <View style={styles.companyCtaIcon}>
            <Feather name="plus" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.companyCtaContent}>
            <Text style={styles.companyCtaTitle}>Atualize os dados do perfil</Text>
            <Text style={styles.companyCtaDescription}>Revise o nome e o telefone de contato antes de publicar oportunidades.</Text>
          </View>
          <Feather name="chevron-right" size={22} color="#31594A" />
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.companyListHeader}>
            <Text style={styles.sectionTitle}>Perfil do recrutador</Text>
            <Text style={styles.companyCount}>{carregandoEmpresas ? '…' : erroEmpresas ? '—' : empresas.length}</Text>
          </View>
          {carregandoEmpresas ? (
            <View style={styles.profileLoading}><Feather name="loader" size={16} color={colors.primary} /><Text style={styles.emptyCompanyText}>Carregando perfil…</Text></View>
          ) : erroEmpresas ? (
            <View style={styles.profileError}><Text style={styles.emptyCompanyText}>{erroEmpresas}</Text><TouchableOpacity onPress={carregarEmpresas} style={styles.retryButton}><Text style={styles.retryText}>Tentar novamente</Text></TouchableOpacity></View>
          ) : empresas.length === 0 ? (
            <Text style={styles.emptyCompanyText}>Não foi possível carregar o perfil agora. Tente novamente em instantes.</Text>
          ) : empresas.map((empresaAtual) => (
            <View style={styles.companyItem} key={empresaAtual.id}>
              <View style={styles.companyAvatar}><Feather name="briefcase" size={20} color="#31594A" /></View>
              <View style={styles.companyItemContent}>
                <Text style={styles.companyItemTitle}>{empresaAtual.nome}</Text>
                <Text style={styles.companyItemDetails}>{empresaAtual.email}</Text>
                <Text style={styles.companyItemViews}>Painel do recrutador</Text>
              </View>
              <View style={styles.companyActions}>
                <TouchableOpacity style={styles.companyActionButton} onPress={() => abrirEdicao(empresaAtual)} accessibilityLabel="Editar empresa">
                  <Feather name="edit-2" size={17} color="#53635B" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.companyActionButton, styles.addJobButton]} onPress={() => abrirCadastroVaga(empresaAtual)} accessibilityLabel="Adicionar vaga">
                  <Feather name="plus" size={18} color="#31594A" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.companyActionButton} onPress={() => abrirVagas(empresaAtual)} accessibilityLabel="Ver vagas cadastradas">
                  <Feather name="list" size={17} color="#53635B" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>

      <Modal visible={empresaModalAberto} transparent animationType="slide" onRequestClose={() => setEmpresaModalAberto(false)}>
        <View style={styles.companyModalOverlay}>
          <View style={styles.companyModal}>
            <View style={styles.companyModalHeader}>
              <View>
                <Text style={styles.companyModalTitle}>Atualizar perfil</Text>
                <Text style={styles.companyModalSubtitle}>Revise o nome e o telefone de contato.</Text>
              </View>
              <TouchableOpacity onPress={() => setEmpresaModalAberto(false)} style={styles.modalCloseButton} accessibilityLabel="Fechar cadastro">
                <Feather name="x" size={23} color="#243630" />
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
                    <Feather name={icone} size={18} color="#718096" />
                    <TextInput
                      style={styles.companyInput}
                      placeholder={placeholder}
                      placeholderTextColor="#9AA8B8"
                      value={empresa[campo]}
                      onChangeText={(valor) => atualizarEmpresa(campo, campo === 'telefone' ? formatarTelefone(valor) : valor)}
                      keyboardType={campo === 'telefone' ? 'phone-pad' : 'default'}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              ))}

              <TouchableOpacity style={[styles.companySubmit, cadastrandoEmpresa && styles.companySubmitDisabled]} onPress={cadastrarEmpresa} disabled={cadastrandoEmpresa}>
                <Text style={styles.companySubmitText}>{cadastrandoEmpresa ? 'Salvando...' : 'Salvar perfil'}</Text>
                {!cadastrandoEmpresa && <Feather name="arrow-right" size={19} color="#FFFFFF" />}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={editarEmpresaModalAberto} transparent animationType="fade" onRequestClose={() => setEditarEmpresaModalAberto(false)}>
        <View style={styles.companyModalOverlay}>
          <View style={styles.companyModal}>
            <View style={styles.companyModalHeader}>
              <View>
                <Text style={styles.companyModalTitle}>Editar perfil</Text>
                <Text style={styles.companyModalSubtitle}>Atualize nome e telefone de contato.</Text>
              </View>
              <TouchableOpacity onPress={() => setEditarEmpresaModalAberto(false)} style={styles.modalCloseButton} accessibilityLabel="Fechar edição">
                <Feather name="x" size={23} color="#243630" />
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
                    <Feather name={icone} size={18} color="#718096" />
                    <TextInput
                      style={styles.companyInput}
                      placeholder={placeholder}
                      placeholderTextColor="#9AA8B8"
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
                {!cadastrandoEmpresa && <Feather name="check" size={19} color="#FFFFFF" />}
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
                <Feather name="x" size={23} color="#243630" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.companyLabel}>Título da vaga</Text>
              <View style={styles.companyInputRow}>
                <Feather name="briefcase" size={18} color="#718096" />
                <TextInput style={styles.companyInput} placeholder="Ex.: Estágio em tecnologia" placeholderTextColor="#9AA8B8" value={vaga.titulo} onChangeText={(valor) => setVaga((atual) => ({ ...atual, titulo: valor }))} />
              </View>
              <Text style={styles.companyLabel}>Descrição</Text>
              <TextInput style={styles.textArea} placeholder="Descreva as principais atividades" placeholderTextColor="#9AA8B8" value={vaga.descricao} onChangeText={(valor) => setVaga((atual) => ({ ...atual, descricao: valor }))} multiline textAlignVertical="top" />
              <Text style={styles.companyLabel}>Requisitos</Text>
              <TextInput style={styles.textArea} placeholder="Informe os requisitos necessários" placeholderTextColor="#9AA8B8" value={vaga.requisitos} onChangeText={(valor) => setVaga((atual) => ({ ...atual, requisitos: valor }))} multiline textAlignVertical="top" />
              <TouchableOpacity style={[styles.companySubmit, cadastrandoEmpresa && styles.companySubmitDisabled]} onPress={cadastrarVaga} disabled={cadastrandoEmpresa}>
                <Text style={styles.companySubmitText}>{cadastrandoEmpresa ? 'Publicando...' : 'Publicar vaga'}</Text>
                {!cadastrandoEmpresa && <Feather name="send" size={18} color="#FFFFFF" />}
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
                <Feather name="x" size={23} color="#243630" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {vagasEmpresa.length === 0 ? (
                <View style={styles.emptyJobs}>
                  <Feather name="briefcase" size={32} color="#A8B1A8" />
                  <Text style={styles.emptyCompanyText}>Nenhuma vaga cadastrada para esta empresa.</Text>
                </View>
              ) : vagasEmpresa.map((vagaAtual) => (
                <View style={styles.jobItem} key={vagaAtual.id}>
                  <View style={styles.jobIcon}><Feather name="briefcase" size={17} color="#31594A" /></View>
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

              <View style={styles.sidebarBrand}><View style={styles.headerMark}><Feather name="link-2" size={14} color="#FFFFFF" /></View><Text style={styles.sidebarTitle}>Conecta Fácil</Text></View>

              <TouchableOpacity
                onPress={fecharTudo}
              >
                <Feather name="x" size={21} color="#53635B" />
              </TouchableOpacity>

            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => fecharTudo()}
            >
              <Feather style={styles.menuIcon} name="home" size={18} color="#31594A" />
              <Text style={styles.menuText}>
                Início
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navegarMenu('/candidaturas')}
            >
              <Feather style={styles.menuIcon} name="file-text" size={17} color="#78857D" />
              <Text style={styles.menuText}>
                Candidaturas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navegarMenu('/vagas')}
            >
              <Feather style={styles.menuIcon} name="briefcase" size={17} color="#78857D" />
              <Text style={styles.menuText}>
                Vagas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navegarMenu('/perfil')}
            >
              <Feather style={styles.menuIcon} name="user" size={17} color="#78857D" />
              <Text style={styles.menuText}>
                Meu perfil
              </Text>
            </TouchableOpacity>

            <View style={styles.menuSeparator} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={sair}
            >
              <Feather style={styles.menuIcon} name="log-out" size={17} color="#B64F46" />
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

  companyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryWash,
    borderWidth: 1,
    borderColor: '#D8E2D8',
    borderRadius: 14,
    padding: 17,
    marginBottom: 23,
  },

  companyCtaIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  companyCtaContent: {
    flex: 1,
  },

  companyCtaTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 3,
  },

  companyCtaDescription: {
    color: colors.inkSoft,
    fontSize: 12,
    lineHeight: 17,
  },

  companyListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    color: colors.primary,
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
    backgroundColor: colors.primaryWash,
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

  companyAvatar: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.primaryWash,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
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
    backgroundColor: colors.primaryWash,
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
    color: colors.primary,
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
    width: Math.min(width * 0.78, 310),
    backgroundColor: '#FFFFFF',
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
    color: '#243630',
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
    color: '#243630',
    fontWeight: '600',
  },

  menuSeparator: {
    height: 1,
    backgroundColor: '#E2E5DC',
    marginVertical: 10,
  },

  companyModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(36, 54, 48, 0.46)',
    padding: 18,
  },

  companyModal: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '92%',
    backgroundColor: '#FFFFFF',
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
    color: '#243630',
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
    backgroundColor: '#F0F1EA',
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
    borderColor: '#E2E5DC',
    borderRadius: 10,
    backgroundColor: '#FCFCFA',
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
    borderColor: '#E2E5DC',
    borderRadius: 10,
    backgroundColor: '#FCFCFA',
    color: colors.ink,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 14,
  },

  companySubmit: {
    height: 53,
    borderRadius: 12,
    backgroundColor: '#31594A',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  viewersModal: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '75%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 28,
  },

});