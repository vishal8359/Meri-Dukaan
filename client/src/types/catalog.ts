export interface Store {
  id: string;
  name: string;
  type: string;
  followers: string;
  rating: number;
  distance: string;
  image: string;
  images?: string[];
  location?: string;
  openingTime?: string;
  closingTime?: string;
}

export interface EnhancedReel {
  _id: string;
  videoUrl: string;
  description: string;
  likesCount: number;
  liked: boolean;
  shares: number;
  saves: number;
  user: {
    id: string;
    name: string;
    avatar: string;
    isVerified?: boolean;
  };
  store: {
    id: string;
    name: string;
    logo: string;
    type: string;
    isVerified?: boolean;
  };
  item: {
    id: string;
    name: string;
    price: number;
    image: string;
    type: "product" | "service";
  };
  comments: Array<{
    id: string;
    user: { id: string; name: string; avatar: string; isVerified?: boolean };
    text: string;
    likesCount: number;
    liked: boolean;
    createdAt: string;
    isReview?: boolean;
    replies: Array<{
      id: string;
      user: { id: string; name: string; avatar: string };
      text: string;
      likesCount: number;
      liked: boolean;
      createdAt: string;
    }>;
  }>;
}
