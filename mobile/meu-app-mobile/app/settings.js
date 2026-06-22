import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import CustomHeader from '../components/CustomHeader';
import { itensMenuConfiguracoes } from '../constants/mockData';
import { colors } from '../constants/colors';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <CustomHeader 
        onProfilePress={() => router.push('/profile')} 
        onSettingsPress={() => {}} 
      />
      
      <View style={{ paddingVertical: 10 }}>
        {itensMenuConfiguracoes.map((item, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={styles.menuItem}
            onPress={() => item.label === 'Sobre' ? router.push('/(tabs)/about') : null}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: 15 }}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <Text style={{ fontSize: 18, color: '#000', fontWeight: 'bold' }}>➔</Text>
          </TouchableOpacity>
        ))}
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuLabel: {
    fontSize: 16,
    color: '#333',
  },
});