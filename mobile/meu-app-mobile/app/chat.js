import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../constants/colors';

export default function ChatScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.avatarSmall} />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.headerTitle}>Pinheirão</Text>
          <Text style={styles.headerSubtitle}>Online há 23 min</Text>
        </View>
        <View style={styles.headerIcons}>
          <Text style={{ fontSize: 20, marginRight: 15 }}>📞</Text>
          <Text style={{ fontSize: 20 }}>📹</Text>
        </View>
      </View>

      <View style={styles.messagesContainer}>
        {/* Mensagens aqui */}
      </View>

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.cameraButton}>
          <Text style={{ fontSize: 20, color: '#fff' }}>📷</Text>
        </TouchableOpacity>
        <TextInput placeholder="Mensagem" style={styles.input} placeholderTextColor="#888" />
        <Text style={{ fontSize: 20, marginRight: 10 }}>🎙️</Text>
        <Text style={{ fontSize: 20 }}>📄</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    fontSize: 24,
    color: '#000',
  },
  avatarSmall: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#ddd',
    marginLeft: 15,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#888',
  },
  headerIcons: {
    flexDirection: 'row',
    position: 'absolute',
    right: 15,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cameraButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 36,
    marginRight: 10,
    fontSize: 14,
  },
});