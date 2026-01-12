import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, radius, shadows, spacing } from '../../theme/colors';

export const StickyHeader = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Replace Text with Image Logo */}
        <Image 
          source={require('../../assets/Meri_dukaan_logo.png')} // Ensure your logo is named logo.png in assets
          style={styles.logo}
          resizeMode="contain"
        />
        
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Ionicons name="menu-outline" size={28} color={colors.text.inverse} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchSection}>
        <Ionicons name="search" size={18} color={colors.text.secondary} style={styles.searchIcon} />
        <TextInput 
          placeholder="Search items in Bazar..." 
          style={styles.input}
          placeholderTextColor={colors.text.secondary}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.brand.primary, // Peacock Blue
    paddingTop: 40,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    ...shadows.medium,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  logo: {
    width: 150, // Adjust width based on your logo aspect ratio
    height: 40,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ui.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    height: 40,
  },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, height: '100%', color: colors.text.primary },
});