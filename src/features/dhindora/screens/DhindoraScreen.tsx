import {
  BadgeCheck, Heart, HelpCircle, MessageSquare, Send, Share2, Star, X
} from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Dimensions, FlatList, Image, KeyboardAvoidingView, Modal, Platform,
  ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import Video from 'react-native-video';
import { useApp } from '../../../context/AppContext';

const { width, height } = Dimensions.get('window');

export default function DhindoraSection() {
  const { reels, toggleLikeReel } = useApp();
  const [activeTab, setActiveTab] = useState<'reviews' | 'queries'>('reviews');
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedReelId, setSelectedReelId] = useState<string | null>(null);
  const [viewableItem, setViewableItem] = useState<string | null>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setViewableItem(viewableItems[0].key);
    }
  }).current;

  // Get current reel details for the drawer
  const currentReel = reels.find(r => r._id === selectedReelId);
  const filteredComments = currentReel?.comments?.filter((c: any) => 
    activeTab === 'reviews' ? c.isReview : !c.isReview
  ) || [];

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.videoContainer}>
      <Video
        source={{ uri: item.videoUrl }}
        style={styles.fullVideo}
        resizeMode="cover"
        repeat
        paused={viewableItem !== item._id}
        muted={false}
      />

      <View style={styles.sidebar}>
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => toggleLikeReel(item._id)}
        >
          <View style={styles.iconCircle}>
             <Heart color="white" size={28} fill={item.liked ? "#ff4081" : "none"} strokeWidth={item.liked ? 0 : 2} />
          </View>
          <Text style={styles.actionText}>{item.likesCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => { setSelectedReelId(item._id); setShowDrawer(true); }}
        >
          <View style={styles.iconCircle}>
            <MessageSquare color="white" size={28} />
          </View>
          <Text style={styles.actionText}>{item.comments?.length || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <View style={styles.iconCircle}>
            <Share2 color="white" size={28} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.overlay}>
        <View style={styles.userInfo}>
          <Image source={{ uri: item.user?.avatar }} style={styles.avatar} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.nameRow}>
              <Text style={styles.username}>{item.user?.name}</Text>
              <BadgeCheck size={16} color="#00BAFF" />
            </View>
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          </View>
          <TouchableOpacity style={styles.followBtn}>
            <Text style={styles.followText}>Follow</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <FlatList
        data={reels}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
      />

      <Modal visible={showDrawer} animationType="slide" transparent onRequestClose={() => setShowDrawer(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.drawer}>
            <View style={styles.drawerIndicator} />
            <View style={styles.drawerHeader}>
              <View style={styles.tabRow}>
                <TouchableOpacity onPress={() => setActiveTab('reviews')} style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}>
                  <Star size={18} color={activeTab === 'reviews' ? "#ff4081" : "#666"} />
                  <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
                    Reviews ({currentReel?.comments?.filter(c => c.isReview).length || 0})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveTab('queries')} style={[styles.tab, activeTab === 'queries' && styles.activeTab]}>
                  <HelpCircle size={18} color={activeTab === 'queries' ? "#ff4081" : "#666"} />
                  <Text style={[styles.tabText, activeTab === 'queries' && styles.activeTabText]}>
                    Queries ({currentReel?.comments?.filter(c => !c.isReview).length || 0})
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => setShowDrawer(false)}><X color="#000" size={24} /></TouchableOpacity>
            </View>

            <ScrollView style={styles.drawerBody} showsVerticalScrollIndicator={false}>
              {filteredComments.length > 0 ? filteredComments.map((comment: any, index: number) => (
                <View key={index} style={styles.commentItem}>
                  <Image source={{ uri: comment.user.avatar || 'https://i.pravatar.cc/100' }} style={styles.commentAvatar} />
                  <View style={styles.commentContent}>
                    <Text style={styles.commentUser}>{comment.user.name}</Text>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                </View>
              )) : (
                <View style={styles.emptyState}>
                  <Text style={{ color: '#999' }}>{activeTab === 'reviews' ? "No verified reviews yet." : "No queries yet."}</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.inputArea}>
              <TextInput style={styles.input} placeholder={activeTab === 'reviews' ? "Write a review..." : "Ask a query..."} placeholderTextColor="#999" />
              <TouchableOpacity style={styles.sendBtn}><Send color="white" size={18} /></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ... styles remain the same as your previous snippet

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  videoContainer: { width, height },
  fullVideo: { position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 },
  sidebar: { position: 'absolute', right: 10, bottom: 100, alignItems: 'center', zIndex: 10 },
  iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  actionBtn: { alignItems: 'center', marginBottom: 15 },
  actionText: { color: 'white', fontSize: 12, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  overlay: { position: 'absolute', bottom: 0, width: '100%', padding: 20, paddingBottom: 40, backgroundColor: 'rgba(0,0,0,0.2)' },
  userInfo: { flexDirection: 'row', alignItems: 'flex-end' },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#fff' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  username: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  description: { color: 'white', fontSize: 14, marginTop: 4, lineHeight: 18 },
  followBtn: { borderWidth: 1, borderColor: '#fff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6 },
  followText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  
  // Drawer Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  drawerIndicator: { width: 40, height: 5, backgroundColor: '#ccc', borderRadius: 3, alignSelf: 'center', marginBottom: 10 },
  drawer: { backgroundColor: 'white', height: '75%', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  tabRow: { flexDirection: 'row', gap: 15 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#ff4081' },
  tabText: { fontWeight: '700', color: '#666', fontSize: 13 },
  activeTabText: { color: '#ff4081' },
  drawerBody: { flex: 1 },
  commentItem: { flexDirection: 'row', marginBottom: 20, gap: 12 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#eee' },
  commentContent: { flex: 1 },
  commentUser: { fontWeight: 'bold', fontSize: 13, color: '#333', marginBottom: 2 },
  commentText: { fontSize: 14, color: '#444', lineHeight: 18 },
  emptyState: { flex: 1, alignItems: 'center', marginTop: 100 },
  inputArea: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' },
  input: { flex: 1, backgroundColor: '#f0f2f5', borderRadius: 25, paddingHorizontal: 20, height: 45, color: '#000' },
  sendBtn: { backgroundColor: '#ff4081', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }
});