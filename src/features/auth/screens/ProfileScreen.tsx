import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { useApp } from '../../../context/AppContext';
import { colors, radius, spacing } from '../../../theme/colors';

export default function ProfileScreen() {
  const { user, logout } = useApp();

  return (
    <View style={styles.container}>
      <Card style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
             <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
            <Text style={styles.userStatus}>Verified Member</Text>
          </View>
        </View>
      </Card>

      <View style={styles.menuContainer}>
        <Button title="My Orders" variant="outline" onPress={() => {}} style={styles.menuBtn} />
        <Button title="Saved Shops" variant="outline" onPress={() => {}} style={styles.menuBtn} />
        <Button title="Settings" variant="outline" onPress={() => {}} style={styles.menuBtn} />
        <Button title="Logout" variant="secondary" onPress={logout} style={styles.logoutBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ui.background,
    padding: spacing.md,
  },
  profileCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.text.inverse,
    fontSize: 24,
    fontWeight: '700',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  userStatus: {
    color: colors.brand.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  menuContainer: {
    gap: spacing.md,
  },
  menuBtn: {
    width: '100%',
    borderColor: colors.ui.border,
  },
  logoutBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.status.error + '20', // Light red tint
  }
});