// src/features/dhindora/components/ShareModal.tsx
import {
    Copy,
    Link,
    MessageCircle,
    Send,
    Share2,
    X,
} from "lucide-react-native";
import React from "react";
import {
    Modal,
    Platform,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  reelId: string;
  storeName: string;
  description: string;
  onShareComplete?: () => void;
}

interface ShareOption {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  onPress: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  reelId,
  storeName,
  description,
  onShareComplete,
}) => {
  const shareUrl = `https://sangam.app/reel/${reelId}`;
  const shareMessage = `Check out this reel from ${storeName}: ${description.substring(0, 100)}...`;

  const handleNativeShare = async () => {
    try {
      const result = await Share.share({
        message: `${shareMessage}\n\n${shareUrl}`,
        url: shareUrl, // iOS only
        title: `Reel by ${storeName}`,
      });

      if (result.action === Share.sharedAction) {
        onShareComplete?.();
        onClose();
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleCopyLink = async () => {
    try {
      // Use native share to allow copying
      await Share.share({
        message: shareUrl,
        title: "Copy Link",
      });
      onShareComplete?.();
      onClose();
    } catch (error) {
      console.error("Error copying link:", error);
    }
  };

  const shareOptions: ShareOption[] = [
    {
      id: "native",
      icon: <Share2 size={24} color="#fff" />,
      label: "Share via...",
      color: "#ff4081",
      onPress: handleNativeShare,
    },
    {
      id: "copy",
      icon: <Link size={24} color="#fff" />,
      label: "Copy Link",
      color: "#757575",
      onPress: handleCopyLink,
    },
    {
      id: "whatsapp",
      icon: <MessageCircle size={24} color="#fff" />,
      label: "WhatsApp",
      color: "#25D366",
      onPress: handleNativeShare, // Will open WhatsApp via native share
    },
    {
      id: "message",
      icon: <Send size={24} color="#fff" />,
      label: "Message",
      color: "#0084FF",
      onPress: handleNativeShare,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerHandle} />
            <Text style={styles.headerTitle}>Share</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Share Preview */}
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle} numberOfLines={1}>
              Reel by {storeName}
            </Text>
            <Text style={styles.previewDesc} numberOfLines={2}>
              {description}
            </Text>
          </View>

          {/* Share Options Grid */}
          <View style={styles.optionsGrid}>
            {shareOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionItem}
                onPress={option.onPress}
              >
                <View
                  style={[styles.optionIcon, { backgroundColor: option.color }]}
                >
                  {option.icon}
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={handleCopyLink}
            >
              <Copy size={18} color="#666" />
              <Text style={styles.quickActionText}>Copy Link</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  header: {
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  closeBtn: {
    position: "absolute",
    right: 16,
    top: 20,
  },
  previewContainer: {
    padding: 16,
    backgroundColor: "#f8f8f8",
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  previewDesc: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  optionItem: {
    width: "25%",
    alignItems: "center",
    paddingVertical: 12,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 12,
    color: "#333",
    textAlign: "center",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 8,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: 8,
    marginHorizontal: 16,
  },
  quickActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});

export default ShareModal;
