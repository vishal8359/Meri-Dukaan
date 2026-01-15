import React, { createContext, ReactNode, useContext, useState } from 'react';
import { mockReels, mockStores, Store } from '../assets/mockData';

// --- Interfaces ---
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Reel {
  _id: string;
  videoUrl: string;
  description: string;
  likesCount: number;
  liked: boolean;
  user: {
    name: string;
    avatar: string;
  };
  comments: Array<{
    user: { name: string; avatar: string };
    text: string;
    isReview: boolean;
  }>;
}

interface AppContextType {
  user: { name: string; isLoggedIn: boolean } | null;
  login: (name: string) => void;
  logout: () => void;
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  cartTotal: number;
  allStores: Store[];
  reels: Reel[];
  toggleLikeReel: (reelId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ name: string; isLoggedIn: boolean } | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [allStores] = useState<Store[]>(mockStores);
  
  // Initialize with mockReels so the page isn't blank
  const [reels, setReels] = useState<Reel[]>(mockReels);

  const login = (name: string) => setUser({ name, isLoggedIn: true });
  const logout = () => setUser(null);

  // Dhindora Logic: Handle Likes
  const toggleLikeReel = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) =>
        r._id === reelId
          ? { ...r, liked: !r.liked, likesCount: r.liked ? r.likesCount - 1 : r.likesCount + 1 }
          : r
      )
    );
  };

  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <AppContext.Provider value={{ 
      user, login, logout, cart, addToCart, removeFromCart, cartTotal, allStores,
      reels, toggleLikeReel 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};