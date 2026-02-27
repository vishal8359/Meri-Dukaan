// src/features/dhindora/components/CommentsModal.tsx
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
            color={reply.liked ? "#ff4081" : "#888"}
            fill={reply.liked ? "#ff4081" : "none"}
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
              color={comment.liked ? "#ff4081" : "#888"}
              fill={comment.liked ? "#ff4081" : "none"}
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
                <ChevronUp size={14} color="#888" />
              ) : (
                <ChevronDown size={14} color="#888" />
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
              <X size={24} color="#333" />
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
                <X size={18} color="#666" />
              </TouchableOpacity>
            </View>
          )}

          {/* Input Section */}
          <View style={styles.inputContainer}>
            <Image
              source={{ uri: "https://i.pravatar.cc/150?u=currentuser" }}
              style={styles.inputAvatar}
            />
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder={replyingTo ? "Add a reply..." : "Add a comment..."}
              placeholderTextColor="#888"
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
              <Send size={20} color={commentText.trim() ? "#ff4081" : "#ccc"} />
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
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    minHeight: "50%",
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
    color: "#333",
    marginRight: 8,
  },
  reviewBadge: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  reviewBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#4caf50",
  },
  commentTime: {
    fontSize: 12,
    color: "#888",
  },
  commentText: {
    fontSize: 14,
    color: "#333",
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
    color: "#888",
  },
  replyBtn: {
    paddingVertical: 2,
  },
  replyBtnText: {
    fontSize: 12,
    color: "#888",
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
    color: "#888",
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
    color: "#333",
    marginRight: 8,
  },
  replyTime: {
    fontSize: 11,
    color: "#888",
  },
  replyText: {
    fontSize: 13,
    color: "#333",
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
    color: "#888",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#888",
  },
  replyIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
  },
  replyIndicatorText: {
    fontSize: 13,
    color: "#666",
  },
  replyingToName: {
    fontWeight: "700",
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
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
    color: "#333",
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
