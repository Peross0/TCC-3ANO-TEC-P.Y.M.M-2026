import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ChatRow({ nome, status, onPress }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.avatar}>
        <Ionicons name="business" size={24} color="#666" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.nome}>{nome}</Text>
        <Text style={styles.status}>{status}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  nome: {
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});