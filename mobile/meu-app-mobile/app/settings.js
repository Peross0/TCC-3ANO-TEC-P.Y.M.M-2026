import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
              <View style={styles.menuIcon}>
                {getIcon(item.icon)}
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function getIcon(iconName) {
  const iconMap = {
    '🔖': 'bookmark-outline',
    '🎛️': 'options-outline',
    '🖌️': 'color-palette-outline',
    '♿': 'accessibility-outline',
    '❓': 'help-circle-outline',
    'ℹ️': 'information-circle-outline',
  };
  
  const ioniconName = iconMap[iconName] || 'information-circle-outline';
  return <Ionicons name={ioniconName} size={22} color="#333" />;
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
  menuIcon: {
    width: 32,
    marginRight: 15,
  },
  menuLabel: {
    fontSize: 16,
    color: '#333',
  },
});