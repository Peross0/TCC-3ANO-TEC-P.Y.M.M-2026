import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={{ padding: 20 }}>
        <Text style={[styles.sectionTitle, { fontSize: 32, textDecorationLine: 'underline' }]}>
          Sobre
        </Text>
        <Text style={styles.paragraph}>
          Nós da Tec P.Y.M.M somos uma empresa voltada para tecnologia e inovação no mercado.
        </Text>
        <Text style={styles.paragraph}>
          esse aplicativo tem a intenção de facilitar o caminho para o jovem interessado em arrumar seu primeiro estágio.
        </Text>
        <Text style={styles.paragraph}>
          focamos no bem estar dos nossos clientes e o publico dos nossos clientes.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#555',
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 20,
  },
});