import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

// Sangam Design System - Kanneen kana koodii keessatti bakka buufna
const COLORS = {
  primary: '#ADC178',
  primaryLight: '#DDE5B6',
  background: '#F0EAD2',
  surface: '#FFFFFF',
  navy: '#073B4C',
};

const SPACING = {
  md: 16,
  xl: 32,
};

// SangamButton - Kompoonantii irra deddeebiin fayyadamuun danda'amu
const SangamButton = ({ title, onPress, variant = 'primary', loading = false, style }: any) => {
  const isOutline = variant === 'outline';
  const isSecondary = variant === 'secondary';

  return (
    <View style={[{ width: '100%' }, style]}>
      <Text 
        onPress={onPress}
        style={[
          styles.buttonBase,
          {
            backgroundColor: isOutline ? 'transparent' : (isSecondary ? COLORS.primaryLight : COLORS.primary),
            borderColor: COLORS.primary,
            borderWidth: isOutline ? 2 : 0,
            color: isOutline ? COLORS.primary : COLORS.navy,
            textAlign: 'center',
            paddingVertical: 15,
            borderRadius: 20,
            overflow: 'hidden',
            fontWeight: 'bold',
            fontSize: 16
          }
        ]}
      >
        {loading ? "Hojiirra jira..." : title}
      </Text>
    </View>
  );
};

export default function App() {
  const [loading, setLoading] = useState(false);

  const handleStart = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      console.log("Locality Selection tti darbaa jira...");
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Placeholder */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
             <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={styles.title}>Sangam</Text>
          <Text style={styles.subtitle}>Waliin ganda kee ijaari</Text>
        </View>

        <View style={styles.buttonContainer}>
          <SangamButton 
            title="Jalqabi" 
            onPress={handleStart} 
            loading={loading}
          />
          
          <SangamButton 
            title="Daldalaa ta'ii dabalamaa" 
            variant="secondary"
            onPress={() => console.log("Gara daldalaatti")} 
            style={{ marginTop: SPACING.md }}
          />

          <SangamButton 
            title="Seeni" 
            variant="outline"
            onPress={() => console.log("Gara login tti")} 
            style={{ marginTop: SPACING.md }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    color: COLORS.surface,
    fontSize: 40,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.navy,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.navy,
    opacity: 0.6,
    marginTop: 8,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400
  },
  buttonBase: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  }
});