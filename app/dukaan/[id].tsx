// app/dukaan/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../src/theme/colors';

export default function StoreDetailScreen() {
  const { id } = useLocalSearchParams(); // This captures the 'storeId' from the URL

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Store:</Text>
      <Text style={styles.storeId}>{id}</Text>
      <Text style={styles.subtitle}>Products for this specific shop will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: colors.ui.background 
  },
  title: { fontSize: 20, color: colors.text.secondary },
  storeId: { fontSize: 32, fontWeight: '800', color: colors.brand.primary },
  subtitle: { marginTop: 10, color: colors.text.secondary }
});