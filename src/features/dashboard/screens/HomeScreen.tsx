// src/features/dashboard/screens/HomeScreen.tsx
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { colors, spacing } from '../../../theme/colors';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Meri Dukaan</Text>

      <Button
        title="View My Shop"
        onPress={() => {
          // navigate to shop screen later
        }}
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
});
