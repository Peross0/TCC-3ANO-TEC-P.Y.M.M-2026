import React, { useState } from 'react';
import {
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
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function Home() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const [pesquisa, setPesquisa] = useState('');

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
    router.replace('/');
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
          Bem-vindo!
        </Text>

        <Text style={styles.description}>
          Acompanhe suas atividades e oportunidades.
        </Text>

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
              onPress={fecharTudo}
            >
              <Text style={styles.menuIcon}>⌂</Text>
              <Text style={styles.menuText}>
                Início
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={fecharTudo}
            >
              <Text style={styles.menuIcon}>📄</Text>
              <Text style={styles.menuText}>
                Candidaturas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={fecharTudo}
            >
              <Text style={styles.menuIcon}>💼</Text>
              <Text style={styles.menuText}>
                Vagas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={fecharTudo}
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

});