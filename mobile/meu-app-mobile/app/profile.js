import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>Perfil</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="notifications-outline" size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="settings-outline" size={22} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="create-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 20 }}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={60} color="#999" />
          </View>
        </View>
        <TouchableOpacity>
          <Text style={styles.changePhotoText}>Mudar foto</Text>
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gênero</Text>
          <View style={styles.line} />
        </View>

        <View style={[styles.inputGroup, { marginTop: 20 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[styles.label, { color: '#666' }]}>Breve descrição</Text>
            <Text style={{ color: '#aaa' }}>0 / 300</Text>
          </View>
          <View style={[styles.line, { marginTop: 35 }]} />
        </View>

        <View style={styles.curriculoBox}>
          <Text style={styles.curriculoText}>Currículo</Text>
          <Ionicons name="document-attach-outline" size={24} color="#666" />
        </View>

        <View style={styles.uploadBox}>
          <Text style={{ color: '#aaa', fontSize: 12, textAlign: 'center' }}>
            Arraste arquivos para fazer upload ou selecione
          </Text>
          <View style={styles.uploadButton}>
            <Text style={{ color: '#fff', fontSize: 12 }}>Procurar</Text>
          </View>
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  headerBadge: {
    backgroundColor: '#eee',
    paddingHorizontal: 30,
    paddingVertical: 6,
    borderRadius: 15,
  },
  headerBadgeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerIcon: {
    padding: 4,
    marginLeft: 10,
  },
  avatarContainer: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 65,
    padding: 3,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 10,
    marginBottom: 25,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  line: {
    width: '100%',
    height: 2,
    backgroundColor: '#ccc',
    marginTop: 12,
  },
  curriculoBox: {
    flexDirection: 'row',
    width: '100%',
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 25,
    height: 50,
  },
  curriculoText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  uploadBox: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: '#fafafa',
  },
  uploadButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 4,
    marginTop: 10,
  },
});