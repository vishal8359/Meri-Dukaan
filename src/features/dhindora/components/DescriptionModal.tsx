// src/features/dhindora/components/DescriptionModal.tsx
import { BadgeCheck, ExternalLink, MapPin, X } from "lucide-react-native";
import React from "react";
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { ReelStore } from "../types";

interface DescriptionModalProps {
  visible: boolean;
  onClose: () => void;
  description: string;
  store: ReelStore;
  onStorePress: () => void;
  hashtags?: string[];
}

const extractHashtags = (
  text: string,
): { cleanText: string; hashtags: string[] } => {
  const hashtagRegex = /#[\w]+/g;
  const hashtags = text.match(hashtagRegex) || [];
  const cleanText = text.replace(hashtagRegex, "").trim();
  return { cleanText, hashtags };
};

export const DescriptionModal: React.FC<DescriptionModalProps> = ({
  visible,
  onClose,
  description,
  store,
  onStorePress,
}) => {
  const { cleanText, hashtags } = extractHashtags(description);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalContainer}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.modalContent}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header with Store Info */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.storeInfo}
              onPress={() => {
                onClose();
                onStorePress();
              }}
            >
              <Image source={{ uri: store.logo }} style={styles.storeLogo} />
              <View style={styles.storeDetails}>
                <View style={styles.storeNameRow}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  {store.isVerified && (
                    <BadgeCheck size={16} color="#00BAFF" fill="#00BAFF" />
                  )}
                </View>
                <Text style={styles.storeType}>{store.type}</Text>
              </View>
              <ExternalLink
                size={18}
                color="#fff"
                style={styles.externalIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Description Content */}
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.descriptionText}>{cleanText}</Text>

            {/* Hashtags */}
            {hashtags.length > 0 && (
              <View style={styles.hashtagsContainer}>
                {hashtags.map((tag, index) => (
                  <TouchableOpacity key={index} style={styles.hashtagBtn}>
                    <Text style={styles.hashtagText}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Visit Store Button */}
          <TouchableOpacity
            style={styles.visitStoreBtn}
            onPress={() => {
              onClose();
              onStorePress();
            }}
          >
            <MapPin size={18} color="#fff" />
            <Text style={styles.visitStoreBtnText}>Visit Store</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "rgba(30, 30, 30, 0.95)",
    borderRadius: 16,
    width: "100%",
    maxHeight: "60%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  storeLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  storeDetails: {
    marginLeft: 12,
    flex: 1,
  },
  storeNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  storeType: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  externalIcon: {
    marginRight: 8,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
    maxHeight: 200,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#fff",
  },
  hashtagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
    gap: 8,
  },
  hashtagBtn: {
    backgroundColor: "rgba(255, 64, 129, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  hashtagText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ff4081",
  },
  visitStoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff4081",
    margin: 16,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  visitStoreBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});

export default DescriptionModal;
