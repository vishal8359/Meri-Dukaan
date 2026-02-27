// src/features/dhindora/types/index.ts
// Types for Dhindora (Reels) feature

export interface ReelUser {
  id: string;
  name: string;
  avatar: string;
  isVerified?: boolean;
}

export interface ReelStore {
  id: string;
  name: string;
  logo: string;
  type: string;
  isVerified?: boolean;
}

export interface ReelProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  type: "product";
}

export interface ReelService {
  id: string;
  name: string;
  price: number;
  image: string;
  type: "service";
}

export interface CommentReply {
  id: string;
  user: ReelUser;
  text: string;
  likesCount: number;
  liked: boolean;
  createdAt: string;
}

export interface ReelComment {
  id: string;
  user: ReelUser;
  text: string;
  likesCount: number;
  liked: boolean;
  createdAt: string;
  replies: CommentReply[];
  isReview?: boolean;
}

export interface Reel {
  _id: string;
  videoUrl: string;
  description: string;
  likesCount: number;
  liked: boolean;
  user: ReelUser;
  store: ReelStore;
  item: ReelProduct | ReelService;
  comments: ReelComment[];
  shares: number;
  saves: number;
}

export interface ReelInteractionState {
  isLiked: boolean;
  likesCount: number;
  isSaved: boolean;
  isFollowing: boolean;
  commentsCount: number;
}
