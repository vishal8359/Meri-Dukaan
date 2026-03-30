// src/features/dhindora/components/CommentsModal.tsx
import { useAuth } from "@/src/context/AuthContext";
import { colors } from "@/src/theme/colors";
import { ChevronDown, ChevronUp, Heart, Send, X } from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CommentReply, ReelComment } from "../types";

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  comments: ReelComment[];
  onAddComment: (text: string) => void;
  onLikeComment: (commentId: string) => void;
  onAddReply: (commentId: string, text: string) => void;
  onLikeReply: (commentId: string, replyId: string) => void;
}

interface CommentItemProps {
  comment: ReelComment;
  onLikeComment: (commentId: string) => void;
  onReply: (commentId: string) => void;
  onLikeReply: (commentId: string, replyId: string) => void;
}

const formatTimeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return `${Math.floor(diffDays / 7)}w`;
};

const ReplyItem: React.FC<{
  reply: CommentReply;
  commentId: string;
  onLikeReply: (commentId: string, replyId: string) => void;
}> = ({ reply, commentId, onLikeReply }) => (
  <View style={styles.replyContainer}>
    <Image source={{ uri: reply.user.avatar }} style={styles.replyAvatar} />
    <View style={styles.replyContent}>
      <View style={styles.replyHeader}>
        <Text style={styles.replyUsername}>{reply.user.name}</Text>
        <Text style={styles.replyTime}>{formatTimeAgo(reply.createdAt)}</Text>
      </View>
      <Text style={styles.replyText}>{reply.text}</Text>
      <View style={styles.replyActions}>
        <TouchableOpacity
          style={styles.replyLikeBtn}
          onPress={() => onLikeReply(commentId, reply.id)}
        >
          <Heart
            size={12}
            color={reply.liked ? colors.brand.dhindoraAccent : colors.ui.muted}
            fill={reply.liked ? colors.brand.dhindoraAccent : "none"}
          />
          {reply.likesCount > 0 && (
            <Text style={styles.replyLikeCount}>{reply.likesCount}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onLikeComment,
  onReply,
  onLikeReply,
}) => {
  const [showReplies, setShowReplies] = useState(false);

  return (
    <View style={styles.commentContainer}>
      <Image
        source={{ uri: comment.user.avatar }}
        style={styles.commentAvatar}
      />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUsername}>{comment.user.name}</Text>
          {comment.isReview && (
            <View style={styles.reviewBadge}>
              <Text style={styles.reviewBadgeText}>Review</Text>
            </View>
          )}
          <Text style={styles.commentTime}>
            {formatTimeAgo(comment.createdAt)}
          </Text>
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.likeBtn}
            onPress={() => onLikeComment(comment.id)}
          >
            <Heart
              size={14}
              color={
                comment.liked ? colors.brand.dhindoraAccent : colors.ui.muted
              }
              fill={comment.liked ? colors.brand.dhindoraAccent : "none"}
            />
            {comment.likesCount > 0 && (
              <Text style={styles.likeCount}>{comment.likesCount}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.replyBtn}
            onPress={() => onReply(comment.id)}
          >
            <Text style={styles.replyBtnText}>Reply</Text>
          </TouchableOpacity>
        </View>

        {/* Replies Section */}
        {comment.replies && comment.replies.length > 0 && (
          <View style={styles.repliesSection}>
            <TouchableOpacity
              style={styles.showRepliesBtn}
              onPress={() => setShowReplies(!showReplies)}
            >
              {showReplies ? (
                <ChevronUp size={14} color={colors.ui.muted} />
              ) : (
                <ChevronDown size={14} color={colors.ui.muted} />
              )}
              <Text style={styles.showRepliesText}>
                {showReplies ? "Hide" : "View"} {comment.replies.length}{" "}
                {comment.replies.length === 1 ? "reply" : "replies"}
              </Text>
            </TouchableOpacity>

            {showReplies && (
              <View style={styles.repliesList}>
                {comment.replies.map((reply) => (
                  <ReplyItem
                    key={reply.id}
                    reply={reply}
                    commentId={comment.id}
                    onLikeReply={onLikeReply}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  onClose,
  comments,
  onAddComment,
  onLikeComment,
  onAddReply,
  onLikeReply,
}) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleSend = useCallback(() => {
    if (!commentText.trim()) return;

    if (replyingTo) {
      onAddReply(replyingTo, commentText.trim());
      setReplyingTo(null);
    } else {
      onAddComment(commentText.trim());
    }
    setCommentText("");
    Keyboard.dismiss();
  }, [commentText, replyingTo, onAddComment, onAddReply]);

  const handleReply = useCallback((commentId: string) => {
    setReplyingTo(commentId);
    inputRef.current?.focus();
  }, []);

  const cancelReply = useCallback(() => {
    setReplyingTo(null);
    setCommentText("");
  }, []);

  const replyingToComment = comments.find((c) => c.id === replyingTo);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerHandle} />
            <Text style={styles.headerTitle}>Comments</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CommentItem
                comment={item}
                onLikeComment={onLikeComment}
                onReply={handleReply}
                onLikeReply={onLikeReply}
              />
            )}
            contentContainerStyle={styles.commentsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No comments yet</Text>
                <Text style={styles.emptySubtext}>
                  Be the first to comment!
                </Text>
              </View>
            }
          />

          {/* Reply indicator */}
          {replyingTo && replyingToComment && (
            <View style={styles.replyIndicator}>
              <Text style={styles.replyIndicatorText}>
                Replying to{" "}
                <Text style={styles.replyingToName}>
                  {replyingToComment.user.name}
                </Text>
              </Text>
              <TouchableOpacity onPress={cancelReply}>
                <X size={18} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Input Section */}
          <View style={styles.inputContainer}>
            {user?.imageUri ? (
              <Image
                source={{ uri: user.imageUri }}
                style={styles.inputAvatar}
              />
            ) : (
              <View
                style={[
                  styles.inputAvatar,
                  {
                    backgroundColor: colors.ui.muted,
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}
                >
                  {(user?.name ?? "U").charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder={replyingTo ? "Add a reply..." : "Add a comment..."}
              placeholderTextColor={colors.ui.muted}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                !commentText.trim() && styles.sendBtnDisabled,
              ]}
              onPress={handleSend}
              disabled={!commentText.trim()}
            >
              <Send
                size={20}
                color={
                  commentText.trim()
                    ? colors.brand.dhindoraAccent
                    : colors.ui.disabled
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.ui.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    minHeight: "50%",
  },
  header: {
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.borderLight,
  },
  headerHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.ui.disabled,
    borderRadius: 2,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  closeBtn: {
    position: "absolute",
    right: 16,
    top: 20,
  },
  commentsList: {
    padding: 16,
    paddingBottom: 8,
  },
  commentContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  commentUsername: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text.primary,
    marginRight: 8,
  },
  reviewBadge: {
    backgroundColor: colors.status.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  reviewBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.status.success,
  },
  commentTime: {
    fontSize: 12,
    color: colors.ui.muted,
  },
  commentText: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 16,
  },
  likeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  likeCount: {
    fontSize: 12,
    color: colors.ui.muted,
  },
  replyBtn: {
    paddingVertical: 2,
  },
  replyBtnText: {
    fontSize: 12,
    color: colors.ui.muted,
    fontWeight: "600",
  },
  repliesSection: {
    marginTop: 12,
  },
  showRepliesBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  showRepliesText: {
    fontSize: 12,
    color: colors.ui.muted,
    fontWeight: "600",
  },
  repliesList: {
    marginTop: 12,
  },
  replyContainer: {
    flexDirection: "row",
    marginBottom: 12,
    marginLeft: 8,
  },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
  },
  replyContent: {
    flex: 1,
  },
  replyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  replyUsername: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text.primary,
    marginRight: 8,
  },
  replyTime: {
    fontSize: 11,
    color: colors.ui.muted,
  },
  replyText: {
    fontSize: 13,
    color: colors.text.primary,
    lineHeight: 18,
  },
  replyActions: {
    marginTop: 6,
  },
  replyLikeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  replyLikeCount: {
    fontSize: 11,
    color: colors.ui.muted,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.ui.muted,
  },
  replyIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.ui.backgroundAlt,
  },
  replyIndicatorText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  replyingToName: {
    fontWeight: "700",
    color: colors.text.primary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.ui.borderLight,
    backgroundColor: colors.ui.surface,
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    maxHeight: 80,
    paddingVertical: 8,
  },
  sendBtn: {
    padding: 8,
    marginLeft: 8,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});

export default CommentsModal;
