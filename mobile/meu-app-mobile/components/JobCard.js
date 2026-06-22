import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

export default function JobCard({ vaga }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.empresaContainer}>
          <View style={styles.avatarSmall}>
            <Ionicons name="business" size={16} color="#666" />
          </View>
          <View>
            <Text style={styles.empresaNome}>{vaga.empresa}</Text>
            <Text style={styles.empresaSegmento}>{vaga.segmento}</Text>
          </View>
        </View>
        <Text style={styles.tempo}>{vaga.tempo}</Text>
      </View>

      <Text style={styles.titulo}>{vaga.vaga}</Text>
      <Text style={styles.descricao}>{vaga.desc}</Text>

      <View style={styles.footer}>
        <View style={styles.vagasInfo}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.qtdVagas}>3 vagas</Text>
        </View>
        <View style={styles.footerRight}>
          <Text style={styles.valor}>{vaga.valor}</Text>
          <TouchableOpacity style={styles.interesseButton}>
            <Text style={styles.interesseButtonText}>Tenho interesse</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f7f7f7',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  empresaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSmall: {
    backgroundColor: '#eee',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  empresaNome: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  empresaSegmento: {
    fontSize: 11,
    color: '#777',
  },
  tempo: {
    fontSize: 11,
    color: '#aaa',
  },
  titulo: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#000',
  },
  descricao: {
    fontSize: 13,
    color: '#555',
    marginVertical: 8,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  vagasInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  qtdVagas: {
    fontSize: 12,
    color: '#666',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: 10,
  },
  interesseButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  interesseButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
});