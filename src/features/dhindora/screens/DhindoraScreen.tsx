import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../components/common/Card';
import { colors, radius, spacing } from '../../../theme/colors';

// Mock data for community announcements
const MOCK_ANNOUNCEMENTS = [
  {
    id: '1',
    shopName: 'Sharma General Store',
    message: 'Fresh batch of organic A2 Ghee just arrived! 10% discount for the first 5 customers today. 🧈',
    time: '2 hours ago',
    image: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: '2',
    shopName: 'Green Grocers',
    message: 'Farm fresh Alphanso mangoes are now in stock. Sweet, ripe, and chemical-free. 🥭',
    time: '5 hours ago',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=500&auto=format&fit=crop',
  },
];

export default function DhindhoraScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_ANNOUNCEMENTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Dhindhora 📢</Text>
            <Text style={styles.subtitle}>What's happening in your neighborhood</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.shopIcon}>
                <Ionicons name="storefront" size={20} color={colors.text.inverse} />
              </View>
              <View>
                <Text style={styles.shopName}>{item.shopName}</Text>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
            </View>
            
            <Text style={styles.message}>{item.message}</Text>
            
            <Image source={{ uri: item.image }} style={styles.postImage} />
            
            <View style={styles.footer}>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="heart-outline" size={20} color={colors.brand.primary} />
                <Text style={styles.actionText}>Like</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="share-social-outline" size={20} color={colors.brand.primary} />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ui.background,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  postCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  shopIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  timeText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  message: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.ui.border,
    paddingTop: spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  actionText: {
    marginLeft: 6,
    color: colors.brand.primary,
    fontWeight: '600',
  }
});

// Added TouchableOpacity import for the action buttons
import { TouchableOpacity } from 'react-native';

