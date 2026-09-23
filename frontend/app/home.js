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
import { apiFetch, clearSession } from '../lib/api';

const { width } = Dimensions.get('window');

export default function Home() {
  const { nome, email } = useLocalSearchParams();
  const [menuAberto, setMenuAberto] = useState(false);
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const [empresaModalAberto, setEmpresaModalAberto] = useState(false);
  const [editarEmpresaModalAberto, setEditarEmpresaModalAberto] = useState(false);
  const [vagaModalAberto, setVagaModalAberto] = useState(false);
  const [vagasModalAberto, setVagasModalAberto] = useState(false);
  const [visualizacoesModalAberto, setVisualizacoesModalAberto] = useState(false);
  const [cadastrandoEmpresa, setCadastrandoEmpresa] = useState(false);
  const [carregandoEmpresas, setCarregandoEmpresas] = useState(true);
  const [empresas, setEmpresas] = useState([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [visualizacoes, setVisualizacoes] = useState([]);
  const [vaga, setVaga] = useState({ titulo: '', descricao: '', requisitos: '' });
  const [vagasEmpresa, setVagasEmpresa] = useState([]);
  const [pesquisa, setPesquisa] = useState('');
  const [empresa, setEmpresa] = useState({ nome: '', cnpj: '', email: '', telefone: '', endereco: '' });

  const carregarEmpresas = async () => {
    try {
      const dados = await apiFetch('/recruiters/profile');
      const recrutador = dados.recruiter;
      setEmpresas([{
        id: recrutador.id,
        nome: recrutador.full_name,
        cnpj: recrutador.document_number,
        email: recrutador.email,
        telefone: recrutador.phone || '',
        endereco: '',
      }]);
    } catch (erro) {
      console.error('Não foi possível carregar empresas:', erro);
    } finally {
      setCarregandoEmpresas(false);
    }
  };

  useEffect(() => {
    carregarEmpresas();
  }, []);

  const atividades = [
    {
      id: 1,
      titulo: 'Candidatura enviada',
      descricao: 'Você se candidatou a uma nova vaga.',
      data: 'Hoje',
    },
    {
      id: 2,
      titulo: 'Perfil atualizado',
      descricao: 'Suas informações foram atualizadas.',
      data: 'Ontem',
    },
    {
      id: 3,
      titulo: 'Nova oportunidade',
      descricao: 'Uma nova vaga combina com seu perfil.',
      data: 'Ontem',
    },
    {
      id: 4,
      titulo: 'Currículo visualizado',
      descricao: 'Uma empresa visualizou seu currículo.',
      data: '2 dias atrás',
    },
  ];

  const atividadesFiltradas = atividades.filter((item) => {
    const texto = (
      item.titulo +
      ' ' +
      item.descricao +
      ' ' +
      item.data
    ).toLowerCase();

    return texto.includes(pesquisa.toLowerCase());
  });

  const fecharTudo = () => {
    setMenuAberto(false);
    setNotificacoesAbertas(false);
  };

  const sair = () => {
    fecharTudo();
    clearSession();
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

  const formatarCnpj = (valor) => {
    const numeros = valor.replace(/\D/g, '').slice(0, 14);
    return numeros
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };

  const cadastrarEmpresa = async () => {
    const camposObrigatorios = Boolean(empresa.nome.trim());
    if (!camposObrigatorios) {
      Alert.alert('Dados incompletos', 'Preencha todos os campos para cadastrar a empresa.');
      return;
    }

    setCadastrandoEmpresa(true);
    try {
      await apiFetch('/recruiters/profile', {
        method: 'PUT',
        body: JSON.stringify({ full_name: empresa.nome, phone: empresa.telefone }),
      });

      Alert.alert('Empresa cadastrada', 'A empresa foi cadastrada com sucesso.');
      setEmpresa({ nome: '', cnpj: '', email: '', telefone: '', endereco: '' });
      setEmpresaModalAberto(false);
      carregarEmpresas();
    } catch (erro) {
      const mensagem = erro instanceof TypeError
        ? 'Não foi possível conectar ao servidor. Verifique se o backend está ativo.'
        : erro.message;
      Alert.alert('Cadastro não realizado', mensagem);
    } finally {
      setCadastrandoEmpresa(false);
    }
  };

  const abrirVisualizacoes = async (empresaAtual) => {
    setEmpresaSelecionada(empresaAtual);
    setVisualizacoesModalAberto(true);
    setVisualizacoes([]);
  };

  const abrirEdicao = (empresaAtual) => {
    setEmpresaSelecionada(empresaAtual);
    setEmpresa({
      nome: empresaAtual.nome,
      cnpj: empresaAtual.cnpj,
      email: empresaAtual.email,
      telefone: empresaAtual.telefone,
      endereco: empresaAtual.endereco,
    });
    setEditarEmpresaModalAberto(true);
  };

  const salvarEdicao = async () => {
    if (!empresaSelecionada || !empresa.nome.trim()) {
      Alert.alert('Dados incompletos', 'Preencha todos os campos da empresa.');
      return;
    }

    setCadastrandoEmpresa(true);
    try {
      await apiFetch('/recruiters/profile', {
        method: 'PUT',
        body: JSON.stringify({ full_name: empresa.nome, phone: empresa.telefone }),
      });
      Alert.alert('Empresa atualizada', 'Os dados foram salvos com sucesso.');
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
      setVagasEmpresa(dados.vagas);
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

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            setMenuAberto(true);
            setNotificacoesAbertas(false);
          }}
        >
          <Text style={styles.headerIcon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Conecta Fácil
        </Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            setNotificacoesAbertas(!notificacoesAbertas);
            setMenuAberto(false);
          }}
        >
          <Text style={styles.headerIcon}>🔔</Text>
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
          {email ? `Conta empresarial: ${email}` : 'Gerencie sua empresa e acompanhe suas oportunidades.'}
        </Text>

        <TouchableOpacity style={styles.companyCta} onPress={() => setEmpresaModalAberto(true)} activeOpacity={0.85}>
          <View style={styles.companyCtaIcon}>
            <Feather name="plus" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.companyCtaContent}>
            <Text style={styles.companyCtaTitle}>Cadastrar uma empresa</Text>
            <Text style={styles.companyCtaDescription}>Cadastre sua empresa e encontre novos talentos.</Text>
          </View>
          <Feather name="chevron-right" size={22} color="#2E56D9" />
        </TouchableOpacity>

        <View style={styles.section}>
          <View style={styles.companyListHeader}>
            <Text style={styles.sectionTitle}>Minhas empresas</Text>
            <Text style={styles.companyCount}>{empresas.length}</Text>
          </View>
          {carregandoEmpresas ? (
            <Text style={styles.emptyCompanyText}>Carregando empresas...</Text>
          ) : empresas.length === 0 ? (
            <Text style={styles.emptyCompanyText}>Cadastre sua primeira empresa para acompanhar o interesse dos candidatos.</Text>
          ) : empresas.map((empresaAtual) => (
            <View style={styles.companyItem} key={empresaAtual.id}>
              <View style={styles.companyAvatar}><Feather name="briefcase" size={20} color="#2E56D9" /></View>
              <View style={styles.companyItemContent}>
                <Text style={styles.companyItemTitle}>{empresaAtual.nome}</Text>
                <Text style={styles.companyItemDetails}>{empresaAtual.email}</Text>
                <Text style={styles.companyItemViews}>Painel do recrutador</Text>
              </View>
              <View style={styles.companyActions}>
                <TouchableOpacity style={styles.companyActionButton} onPress={() => abrirEdicao(empresaAtual)} accessibilityLabel="Editar empresa">
                  <Feather name="edit-2" size={17} color="#526581" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.companyActionButton, styles.addJobButton]} onPress={() => abrirCadastroVaga(empresaAtual)} accessibilityLabel="Adicionar vaga">
                  <Feather name="plus" size={18} color="#2E56D9" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.companyActionButton} onPress={() => abrirVagas(empresaAtual)} accessibilityLabel="Ver vagas cadastradas">
                  <Feather name="list" size={17} color="#526581" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.companyActionButton} onPress={() => abrirVisualizacoes(empresaAtual)} accessibilityLabel="Ver interessados">
                  <Feather name="eye" size={17} color="#2E56D9" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* CARDS */}
        <View style={styles.cardsContainer}>

          <View style={styles.card}>
            <Text style={styles.cardNumber}>24</Text>
            <Text style={styles.cardTitle}>
              Atividades
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardNumber}>8</Text>
            <Text style={styles.cardTitle}>
              Candidaturas
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardNumber}>12</Text>
            <Text style={styles.cardTitle}>
              Vagas
            </Text>
          </View>

        </View>

        {/* GRÁFICO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Desempenho
          </Text>

          <View style={styles.chartContainer}>

            <View style={styles.chartBars}>
              <View style={[styles.bar, { height: 45 }]} />
              <View style={[styles.bar, { height: 70 }]} />
              <View style={[styles.bar, { height: 55 }]} />
              <View style={[styles.bar, { height: 90 }]} />
              <View style={[styles.bar, { height: 110 }]} />
              <View style={[styles.bar, { height: 100 }]} />
            </View>

            <View style={styles.chartLabels}>
              <Text style={styles.chartLabel}>Abr</Text>
              <Text style={styles.chartLabel}>Mai</Text>
              <Text style={styles.chartLabel}>Jun</Text>
              <Text style={styles.chartLabel}>Jul</Text>
              <Text style={styles.chartLabel}>Ago</Text>
              <Text style={styles.chartLabel}>Set</Text>
            </View>

          </View>
        </View>

        {/* ATIVIDADES */}
        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Atividades recentes
          </Text>

          {/* PESQUISA */}
          <TextInput
            style={styles.search}
            placeholder="Pesquisar atividade..."
            placeholderTextColor="#8792AC"
            value={pesquisa}
            onChangeText={setPesquisa}
          />

          {atividadesFiltradas.length === 0 ? (

            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>
                Nenhuma atividade encontrada.
              </Text>
            </View>

          ) : (

            atividadesFiltradas.map((atividade) => (

              <View
                key={atividade.id}
                style={styles.activity}
              >

                <View style={styles.activityIcon}>
                  <Text>✓</Text>
                </View>

                <View style={styles.activityContent}>

                  <Text style={styles.activityTitle}>
                    {atividade.titulo}
                  </Text>

                  <Text style={styles.activityDescription}>
                    {atividade.descricao}
                  </Text>

                  <Text style={styles.activityDate}>
                    {atividade.data}
                  </Text>

                </View>

              </View>

            ))
          )}

        </View>

      </ScrollView>

      <Modal visible={empresaModalAberto} transparent animationType="slide" onRequestClose={() => setEmpresaModalAberto(false)}>
        <View style={styles.companyModalOverlay}>
          <View style={styles.companyModal}>
            <View style={styles.companyModalHeader}>
              <View>
                <Text style={styles.companyModalTitle}>Cadastrar empresa</Text>
                <Text style={styles.companyModalSubtitle}>Informe os dados para começar.</Text>
              </View>
              <TouchableOpacity onPress={() => setEmpresaModalAberto(false)} style={styles.modalCloseButton} accessibilityLabel="Fechar cadastro">
                <Feather name="x" size={23} color="#14213D" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {[
                ['nome', 'Nome da empresa', 'Ex.: Conecta Tecnologia', 'briefcase'],
                ['cnpj', 'CNPJ', '00.000.000/0000-00', 'credit-card'],
                ['email', 'E-mail corporativo', 'contato@empresa.com', 'mail'],
                ['telefone', 'Telefone celular', '(00) 00000-0000', 'phone'],
                ['endereco', 'Endereço completo', 'Rua, número, cidade e estado', 'map-pin'],
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
                      onChangeText={(valor) => atualizarEmpresa(campo, campo === 'telefone' ? formatarTelefone(valor) : campo === 'cnpj' ? formatarCnpj(valor) : valor)}
                      keyboardType={campo === 'email' ? 'email-address' : campo === 'telefone' || campo === 'cnpj' ? 'phone-pad' : 'default'}
                      autoCapitalize={campo === 'email' ? 'none' : 'sentences'}
                    />
                  </View>
                </View>
              ))}

              <TouchableOpacity style={[styles.companySubmit, cadastrandoEmpresa && styles.companySubmitDisabled]} onPress={cadastrarEmpresa} disabled={cadastrandoEmpresa}>
                <Text style={styles.companySubmitText}>{cadastrandoEmpresa ? 'Cadastrando...' : 'Cadastrar empresa'}</Text>
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
                <Text style={styles.companyModalTitle}>Editar empresa</Text>
                <Text style={styles.companyModalSubtitle}>Atualize os dados cadastrais.</Text>
              </View>
              <TouchableOpacity onPress={() => setEditarEmpresaModalAberto(false)} style={styles.modalCloseButton} accessibilityLabel="Fechar edição">
                <Feather name="x" size={23} color="#14213D" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {[
                ['nome', 'Nome da empresa', 'Ex.: Conecta Tecnologia', 'briefcase'],
                ['cnpj', 'CNPJ', '00.000.000/0000-00', 'credit-card'],
                ['email', 'E-mail corporativo', 'contato@empresa.com', 'mail'],
                ['telefone', 'Telefone celular', '(00) 00000-0000', 'phone'],
                ['endereco', 'Endereço completo', 'Rua, número, cidade e estado', 'map-pin'],
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
                      onChangeText={(valor) => atualizarEmpresa(campo, campo === 'telefone' ? formatarTelefone(valor) : campo === 'cnpj' ? formatarCnpj(valor) : valor)}
                      keyboardType={campo === 'email' ? 'email-address' : campo === 'telefone' || campo === 'cnpj' ? 'phone-pad' : 'default'}
                      autoCapitalize={campo === 'email' ? 'none' : 'sentences'}
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
                <Feather name="x" size={23} color="#14213D" />
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

      <Modal visible={visualizacoesModalAberto} transparent animationType="slide" onRequestClose={() => setVisualizacoesModalAberto(false)}>
        <View style={styles.companyModalOverlay}>
          <View style={styles.viewersModal}>
            <View style={styles.companyModalHeader}>
              <View>
                <Text style={styles.companyModalTitle}>Quem visualizou</Text>
                <Text style={styles.companyModalSubtitle}>{empresaSelecionada?.nome}</Text>
              </View>
              <TouchableOpacity onPress={() => setVisualizacoesModalAberto(false)} style={styles.modalCloseButton}>
                <Feather name="x" size={23} color="#14213D" />
              </TouchableOpacity>
            </View>
            {visualizacoes.length === 0 ? (
              <Text style={styles.emptyCompanyText}>Ainda não há candidatos identificados visualizando esta empresa.</Text>
            ) : visualizacoes.map((visualizacao) => (
              <View style={styles.viewerItem} key={visualizacao.id}>
                <View style={styles.viewerAvatar}><Feather name="user" size={18} color="#2E56D9" /></View>
                <View>
                  <Text style={styles.viewerName}>{visualizacao.usuario_nome}</Text>
                  <Text style={styles.viewerEmail}>{visualizacao.usuario_email || 'E-mail não informado'}</Text>
                </View>
              </View>
            ))}
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
                <Feather name="x" size={23} color="#14213D" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {vagasEmpresa.length === 0 ? (
                <View style={styles.emptyJobs}>
                  <Feather name="briefcase" size={32} color="#B6C2D0" />
                  <Text style={styles.emptyCompanyText}>Nenhuma vaga cadastrada para esta empresa.</Text>
                </View>
              ) : vagasEmpresa.map((vagaAtual) => (
                <View style={styles.jobItem} key={vagaAtual.id}>
                  <View style={styles.jobIcon}><Feather name="briefcase" size={17} color="#2E56D9" /></View>
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

              <Text style={styles.sidebarTitle}>
                Conecta Fácil
              </Text>

              <TouchableOpacity
                onPress={fecharTudo}
              >
                <Text style={styles.closeButton}>
                  ×
                </Text>
              </TouchableOpacity>

            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => fecharTudo()}
            >
              <Text style={styles.menuIcon}>⌂</Text>
              <Text style={styles.menuText}>
                Início
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navegarMenu('/candidaturas')}
            >
              <Text style={styles.menuIcon}>📄</Text>
              <Text style={styles.menuText}>
                Candidaturas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navegarMenu('/vagas')}
            >
              <Text style={styles.menuIcon}>💼</Text>
              <Text style={styles.menuText}>
                Vagas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navegarMenu('/perfil')}
            >
              <Text style={styles.menuIcon}>👤</Text>
              <Text style={styles.menuText}>
                Meu perfil
              </Text>
            </TouchableOpacity>

            <View style={styles.menuSeparator} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={sair}
            >
              <Text style={styles.menuIcon}>↪</Text>
              <Text style={styles.menuText}>
                Sair
              </Text>
            </TouchableOpacity>

          </View>

        </View>

      </Modal>

      {/* NOTIFICAÇÕES */}
      {notificacoesAbertas && (
        <View style={styles.notificationPanel}>

          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>
              Notificações
            </Text>

            <TouchableOpacity
              onPress={() => setNotificacoesAbertas(false)}
            >
              <Text style={styles.closeNotification}>
                ×
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.notification}>
            <Text style={styles.notificationText}>
              Você possui novas oportunidades.
            </Text>
          </View>

          <View style={styles.notification}>
            <Text style={styles.notificationText}>
              Seu perfil foi atualizado.
            </Text>
          </View>

        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  header: {
    height: 65,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  headerButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
  },

  headerIcon: {
    fontSize: 23,
    color: '#14213D',
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#14213D',
  },

  scroll: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  welcome: {
    fontSize: 28,
    fontWeight: '700',
    color: '#14213D',
    marginBottom: 5,
  },

  description: {
    fontSize: 15,
    color: '#8792AC',
    marginBottom: 22,
  },

  companyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF0FF',
    borderWidth: 1,
    borderColor: '#C9D7FF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },

  companyCtaIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#2E56D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  companyCtaContent: {
    flex: 1,
  },

  companyCtaTitle: {
    color: '#14213D',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 3,
  },

  companyCtaDescription: {
    color: '#62708A',
    fontSize: 12,
    lineHeight: 17,
  },

  companyListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  companyCount: {
    minWidth: 28,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#E8EEFF',
    color: '#2E56D9',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyCompanyText: {
    color: '#8792AC',
    fontSize: 13,
    lineHeight: 19,
  },

  companyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F4',
  },

  companyAvatar: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#E8EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  companyItemContent: {
    flex: 1,
  },

  companyItemTitle: {
    color: '#14213D',
    fontSize: 15,
    fontWeight: '800',
  },

  companyItemDetails: {
    color: '#8792AC',
    fontSize: 12,
    marginTop: 3,
  },

  companyItemViews: {
    color: '#2E56D9',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },

  companyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  companyActionButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F4F8',
  },

  addJobButton: {
    backgroundColor: '#E8EEFF',
  },

  viewersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },

  viewersButtonText: {
    color: '#2E56D9',
    fontSize: 12,
    fontWeight: '800',
  },

  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#FFFFFF',
    width: '31%',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',

    elevation: 3,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  cardNumber: {
    fontSize: 27,
    fontWeight: '700',
    color: '#2E56D9',
  },

  emptyJobs: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 10,
  },

  jobItem: {
    flexDirection: 'row',
    padding: 13,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2EAF4',
    backgroundColor: '#F8FAFD',
  },

  jobIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#E8EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  jobContent: {
    flex: 1,
  },

  jobTitle: {
    color: '#14213D',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },

  jobLabel: {
    color: '#2E56D9',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 2,
  },

  jobText: {
    color: '#62708A',
    fontSize: 13,
    lineHeight: 18,
  },

  jobsBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8EEFF',
  },

  jobsBadgeText: {
    color: '#2E56D9',
    fontSize: 14,
    fontWeight: '800',
  },

  cardTitle: {
    fontSize: 12,
    color: '#8792AC',
    marginTop: 5,
    textAlign: 'center',
  },

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,

    elevation: 2,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#14213D',
    marginBottom: 15,
  },

  chartContainer: {
    height: 170,
    justifyContent: 'flex-end',
  },

  chartBars: {
    height: 130,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },

  bar: {
    width: 25,
    backgroundColor: '#2E56D9',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },

  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },

  chartLabel: {
    fontSize: 11,
    color: '#8792AC',
  },

  search: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    backgroundColor: '#F9FAFB',
    marginBottom: 15,
  },

  activity: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F4',
  },

  activityIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8EEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  activityContent: {
    flex: 1,
  },

  activityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#14213D',
    marginBottom: 4,
  },

  activityDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },

  activityDate: {
    fontSize: 11,
    color: '#8792AC',
  },

  noResults: {
    paddingVertical: 25,
    alignItems: 'center',
  },

  noResultsText: {
    color: '#8792AC',
    fontSize: 14,
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
    paddingTop: 55,
    paddingHorizontal: 20,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    elevation: 10,
  },

  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },

  sidebarTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2563EB',
  },

  closeButton: {
    fontSize: 32,
    color: '#14213D',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },

  menuIcon: {
    fontSize: 20,
    width: 35,
  },

  menuText: {
    fontSize: 16,
    color: '#14213D',
    fontWeight: '500',
  },

  menuSeparator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },

  notificationPanel: {
    position: 'absolute',
    top: 75,
    right: 15,
    width: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    elevation: 8,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  notificationTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#14213D',
  },

  closeNotification: {
    fontSize: 25,
    color: '#8792AC',
  },

  notification: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F4',
  },

  notificationText: {
    fontSize: 13,
    color: '#6B7280',
  },

  companyModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 33, 61, 0.52)',
    padding: 18,
  },

  companyModal: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },

  companyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },

  companyModalTitle: {
    color: '#14213D',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  companyModalSubtitle: {
    color: '#8792AC',
    fontSize: 14,
    marginTop: 5,
    lineHeight: 20,
  },

  modalCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  companyField: {
    marginBottom: 14,
  },

  companyLabel: {
    color: '#243B53',
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
    borderColor: '#D5DDE8',
    borderRadius: 12,
    backgroundColor: '#F9FBFD',
    paddingHorizontal: 14,
  },

  companyInput: {
    flex: 1,
    height: 50,
    color: '#14213D',
    paddingHorizontal: 11,
    fontSize: 14,
  },

  textArea: {
    minHeight: 92,
    borderWidth: 1,
    borderColor: '#D5DDE8',
    borderRadius: 12,
    backgroundColor: '#F9FBFD',
    color: '#14213D',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 14,
  },

  companySubmit: {
    height: 53,
    borderRadius: 12,
    backgroundColor: '#2E56D9',
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 12,
  },

  viewerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F4',
  },

  viewerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  viewerName: {
    color: '#14213D',
    fontSize: 14,
    fontWeight: '800',
  },

  viewerEmail: {
    color: '#8792AC',
    fontSize: 12,
    marginTop: 3,
  },

});