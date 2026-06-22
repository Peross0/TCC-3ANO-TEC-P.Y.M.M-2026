import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

export default function ChatScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.avatarSmall} />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={styles.headerTitle}>Pinheirão</Text>
          <Text style={styles.headerSubtitle}>Online há 23 min</Text>
        </View>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="call-outline" size={22} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="videocam-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.messagesContainer}>
        {/* Mensagens aqui */}
      </View>

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.cameraButton}>
          <Ionicons name="camera" size={20} color="#fff" />
        </TouchableOpacity>
        <TextInput placeholder="Mensagem" style={styles.input} placeholderTextColor="#888" />
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="mic-outline" size={22} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="attach-outline" size={22} color="#666" />
        </TouchableOpacity>
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
    padding: 4,
    marginRight: 10,
  },
  avatarSmall: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#ddd',
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
  headerIcon: {
    padding: 4,
    marginLeft: 10,
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
  iconButton: {
    padding: 6,
  },
});