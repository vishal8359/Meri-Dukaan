import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { colors, spacing } from '../../../theme/colors';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Namaste!</Text>
      <Text style={styles.subtitle}>Welcome to your Meri Dukaan dashboard.</Text>
      
      <Button 
        title="Go to Bazar" 
        onPress={() => router.push('/bazar')} 
        style={styles.btn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ui.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  welcome: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  btn: { width: '100%' }
});