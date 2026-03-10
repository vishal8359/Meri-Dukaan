// src/features/dhindora/hooks/useReelInteraction.ts
import { useCallback, useState } from "react";
import { CommentReply, ReelComment, ReelInteractionState } from "../types";

interface UseReelInteractionProps {
  initialLiked: boolean;
  initialLikesCount: number;
  initialSaved?: boolean;
  initialFollowing?: boolean;
  initialCommentsCount: number;
  onLikeChange?: (isLiked: boolean) => void;
  onSaveChange?: (isSaved: boolean) => void;
  onFollowChange?: (isFollowing: boolean) => void;
}

interface UseReelInteractionReturn extends ReelInteractionState {
  handleLike: () => void;
  handleSave: () => void;
  handleFollow: () => void;
  incrementComments: () => void;
}

export const useReelInteraction = ({
  initialLiked,
  initialLikesCount,
  initialSaved = false,
  initialFollowing = false,
  initialCommentsCount,
  onLikeChange,
  onSaveChange,
  onFollowChange,
}: UseReelInteractionProps): UseReelInteractionReturn => {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);

  const handleLike = useCallback(() => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount((prev) => (newLikedState ? prev + 1 : prev - 1));
    onLikeChange?.(newLikedState);
  }, [isLiked, onLikeChange]);

  const handleSave = useCallback(() => {
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    onSaveChange?.(newSavedState);
  }, [isSaved, onSaveChange]);

  const handleFollow = useCallback(() => {
    const newFollowingState = !isFollowing;
    setIsFollowing(newFollowingState);
    onFollowChange?.(newFollowingState);
  }, [isFollowing, onFollowChange]);

  const incrementComments = useCallback(() => {
    setCommentsCount((prev) => prev + 1);
  }, []);

  return {
    isLiked,
    likesCount,
    isSaved,
    isFollowing,
    commentsCount,
    handleLike,
    handleSave,
    handleFollow,
    incrementComments,
  };
};

// Hook for managing comments state
interface UseCommentsManagerProps {
  initialComments: ReelComment[];
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
}

interface UseCommentsManagerReturn {
  comments: ReelComment[];
  addComment: (text: string) => void;
  likeComment: (commentId: string) => void;
  addReply: (commentId: string, text: string) => void;
  likeReply: (commentId: string, replyId: string) => void;
}

export const useCommentsManager = ({
  initialComments,
  currentUserId = "current-user",
  currentUserName = "You",
  currentUserAvatar = "https://i.pravatar.cc/150?u=currentuser",
}: UseCommentsManagerProps): UseCommentsManagerReturn => {
  const [comments, setComments] = useState<ReelComment[]>(initialComments);

  const addComment = useCallback(
    (text: string) => {
      const newComment: ReelComment = {
        id: `comment-${Date.now()}`,
        user: {
          id: currentUserId,
          name: currentUserName,
          avatar: currentUserAvatar,
        },
        text,
        likesCount: 0,
        liked: false,
        createdAt: new Date().toISOString(),
        replies: [],
      };
      setComments((prev) => [newComment, ...prev]);
    },
    [currentUserId, currentUserName, currentUserAvatar],
  );

  const likeComment = useCallback((commentId: string) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            liked: !comment.liked,
            likesCount: comment.liked
              ? comment.likesCount - 1
              : comment.likesCount + 1,
          };
        }
        return comment;
      }),
    );
  }, []);

  const addReply = useCallback(
    (commentId: string, text: string) => {
      const newReply: CommentReply = {
        id: `reply-${Date.now()}`,
        user: {
          id: currentUserId,
          name: currentUserName,
          avatar: currentUserAvatar,
        },
        text,
        likesCount: 0,
        liked: false,
        createdAt: new Date().toISOString(),
      };

      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...comment.replies, newReply],
            };
          }
          return comment;
        }),
      );
    },
    [currentUserId, currentUserName, currentUserAvatar],
  );

  const likeReply = useCallback((commentId: string, replyId: string) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: comment.replies.map((reply) => {
              if (reply.id === replyId) {
                return {
                  ...reply,
                  liked: !reply.liked,
                  likesCount: reply.liked
                    ? reply.likesCount - 1
                    : reply.likesCount + 1,
                };
              }
              return reply;
            }),
          };
        }
        return comment;
      }),
    );
  }, []);

  return {
    comments,
    addComment,
    likeComment,
    addReply,
    likeReply,
  };
};

export default useReelInteraction;
