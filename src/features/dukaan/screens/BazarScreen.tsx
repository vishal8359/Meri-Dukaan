import { useApp } from '@/src/context/AppContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput // 1. Added TextInput
  ,

  TouchableOpacity,
  View
} from 'react-native';
import { STORE_TYPES } from '../../../assets/mockData';
import { radius, shadows, spacing } from '../../../theme/colors';
import { StoreCardGrid } from '../components/StoreCardVertical';

export default function BazarScreen() {
  const { allStores } = useApp();

  // States
  const [selectedType, setSelectedType] = useState('All');
  const [distLimit, setDistLimit] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [categorySearch, setCategorySearch] = useState(''); // 2. Search State

  // Lazy Loading States
  const [limit, setLimit] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 3. Filter Categories for the Modal
  const searchedCategories = useMemo(() => {
    if (!categorySearch) return STORE_TYPES;
    return STORE_TYPES.filter(type => 
      type.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categorySearch]);

  // Filter Store Logic
  const filteredData = useMemo(() => {
    return allStores.filter(store => {
      const matchType = selectedType === 'All' || store.type === selectedType;
      const storeDist = parseFloat(store.distance);
      const matchDist = distLimit ? storeDist <= distLimit : true;
      return matchType && matchDist;
    });
  }, [selectedType, distLimit, allStores]);

  const displayData = useMemo(() => filteredData.slice(0, limit), [filteredData, limit]);

  useEffect(() => {
    setLimit(10);
  }, [selectedType, distLimit]);

  const handleLoadMore = () => {
    if (limit < filteredData.length && !isLoadingMore) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setLimit(prev => prev + 10);
        setIsLoadingMore(false);
      }, 500);
    }
  };

  const selectCategory = (type: string) => {
    setSelectedType(type);
    setCategorySearch(''); // Clear search after selection
    setIsModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* 1. FILTER BAR */}
      <View style={styles.filterHeader}>
        <TouchableOpacity 
          style={styles.mainFilterBtn} 
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="apps-outline" size={20} color="#FFF" />
          <Text style={styles.mainFilterText} numberOfLines={1}>
            {selectedType === 'All' ? 'Select Store Type' : selectedType}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.distRow}>
          {[0.5, 1, 3].map(d => (
            <TouchableOpacity 
              key={d} 
              onPress={() => setDistLimit(distLimit === d ? null : d)}
              style={[styles.distBtn, distLimit === d && styles.activeDistBtn]}
            >
              <Text style={styles.distBtnText}>{d < 1 ? '500m' : d+'km'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 2. POP-UP MODAL WITH SEARCH */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>All Categories</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#143e47" />
              </TouchableOpacity>
            </View>

            {/* SEARCH INPUT */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#94a3b8" />
              <TextInput 
                placeholder="Search category (e.g. Pizza, Gym)"
                style={styles.searchInput}
                value={categorySearch}
                onChangeText={setCategorySearch}
                placeholderTextColor="#94a3b8"
              />
              {categorySearch !== '' && (
                <TouchableOpacity onPress={() => setCategorySearch('')}>
                  <Ionicons name="close-outline" size={20} color="#94a3b8" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              {/* Show "All Stores" only if it matches search or search is empty */}
              {(!categorySearch || "all stores".includes(categorySearch.toLowerCase())) && (
                <TouchableOpacity style={styles.categoryItem} onPress={() => selectCategory('All')}>
                  <Text style={styles.categoryLabel}>All Stores</Text>
                  {selectedType === 'All' && <Ionicons name="checkmark-circle" size={20} color="#143e47" />}
                </TouchableOpacity>
              )}
              
              {searchedCategories.map((type) => (
                <TouchableOpacity key={type} style={styles.categoryItem} onPress={() => selectCategory(type)}>
                  <Text style={styles.categoryLabel}>{type}</Text>
                  {selectedType === type && <Ionicons name="checkmark-circle" size={20} color="#143e47" />}
                </TouchableOpacity>
              ))}

              {searchedCategories.length === 0 && (
                 <Text style={styles.noResultText}>No categories found matching "{categorySearch}"</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 3. STORE GRID */}
      <FlatList
        data={displayData}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => <StoreCardGrid store={item} />}
        contentContainerStyle={styles.listPadding}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={isLoadingMore ? <ActivityIndicator size="small" color="#143e47" style={{ marginVertical: 20 }} /> : null}
        ListEmptyComponent={<Text style={styles.emptyText}>No shops found in this category.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  filterHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: spacing.md, 
    backgroundColor: '#FFF',
    justifyContent: 'space-between',
    ...shadows.small 
  },
  mainFilterBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#143e47', // Peacock Blue
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    borderRadius: radius.md,
    gap: 8,
    flex: 1,
    marginRight: 10
  },
  mainFilterText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  distRow: { flexDirection: 'row', gap: 5 },
  distBtn: { backgroundColor: '#E2E8F0', padding: 8, borderRadius: radius.sm },
  activeDistBtn: { backgroundColor: '#B7DEE5' },
  distBtnText: { fontSize: 11, fontWeight: '700', color: '#143e47' },
  
  // Modal Styles
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: '#FFF', 
    borderTopLeftRadius: radius.xl, 
    borderTopRightRadius: radius.xl, 
    height: '70%', 
    padding: spacing.md 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#143e47' },
  modalScroll: { paddingBottom: 40 },
  categoryItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9' 
  },
  categoryLabel: { fontSize: 16, color: '#334155', fontWeight: '500' },
  
  // List Styles
  gridRow: { justifyContent: 'space-between', paddingHorizontal: spacing.md },
  listPadding: { paddingTop: spacing.md, paddingBottom: 100 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#64748b' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#1e293b',
  },
  noResultText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#94a3b8',
    fontSize: 14,
  },
});