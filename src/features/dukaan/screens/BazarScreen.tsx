import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { mockProducts } from '../../../assets/mockData';
import { useApp } from '../../../context/AppContext';
import { colors, spacing } from '../../../theme/colors';
import { ProductCard } from '../components/ProductCard';

export default function BazarScreen() {
  const { addToCart } = useApp();

  return (
    <View style={styles.container}>
      <FlatList
        data={mockProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ProductCard
            {...item}
            onAddToCart={() => addToCart(item)}
            onPress={(id) => console.log('View product', id)}
          />
        )}
        ListHeaderComponent={
          <Text style={styles.headerText}>Explore the Bazar</Text>
        }
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
    paddingBottom: 100, // Extra padding so bottom bar doesn't cover last items
  },
  row: {
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
});