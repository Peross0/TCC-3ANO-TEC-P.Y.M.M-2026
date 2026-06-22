import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import CustomHeader from '../../components/CustomHeader';
import ChatRow from '../../components/ChatRow';

export default function MessagesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <CustomHeader 
        onProfilePress={() => router.push('/profile')} 
        onSettingsPress={() => router.push('/settings')} 
      />
      <View style={{ padding: 20 }}>
        <Text style={styles.sectionTitle}>Mensagens</Text>
        
        <ChatRow 
          nome="Pinheirão" 
          status="visto há 23 min" 
          onPress={() => router.push('/chat')} 
        />
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
  sectionTitle: {
    fontSize: 22,
    color: '#555',
    marginBottom: 20,
  },
});