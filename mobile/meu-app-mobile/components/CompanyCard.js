import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CompanyCard({ nome }) {
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Ionicons name="business" size={22} color="#666" />
      </View>
      <Text style={styles.nome}>{nome}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  nome: {
    fontSize: 15,
    fontWeight: '500',
  },
});