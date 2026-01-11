import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, radius, shadows, spacing } from '../../theme/colors';

export const StickyHeader = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.logoText}>Meri Dukaan</Text>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <Ionicons name="menu-outline" size={28} color={colors.text.inverse} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchSection}>
        <Ionicons name="search" size={18} color={colors.text.secondary} style={styles.searchIcon} />
        <TextInput 
          placeholder="Search bazar..." 
          style={styles.input}
          placeholderTextColor={colors.text.secondary}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.brand.primary,
    paddingTop: 50,
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
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.inverse,
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