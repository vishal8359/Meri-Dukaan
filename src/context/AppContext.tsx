// src/context/AppContext.tsx

import React, {
    createContext,
    ReactNode,
    useContext,
    useMemo,
    useState,
} from "react";
import { mockReels, mockStores, Store } from "../assets/mockData";

// --- Interfaces ---
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  rating?: number;
}

export interface Reel {
  _id: string;
  videoUrl: any;
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
  // User Management
  user: { name: string; isLoggedIn: boolean; email?: string } | null;
  login: (name: string) => void;
  logout: () => void;

  // Cart Management
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;

  // Wishlist Management
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (itemId: string) => void;
  isInWishlist: (itemId: string) => boolean;
  clearWishlist: () => void;

  // Store Management (Centralized)
  allStores: Store[];
  getStoreById: (id: string) => Store | undefined;
  getFeaturedStores: (limit?: number) => Store[];
  getStoresByType: (type: string) => Store[];
  getNearbyStores: (distance: number) => Store[];
  searchStores: (query: string) => Store[];

  // Reel Management
  reels: Reel[];
  toggleLikeReel: (reelId: string) => void;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  rating?: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // --- State Management ---
  const [user, setUser] = useState<{
    name: string;
    isLoggedIn: boolean;
    email?: string;
  } | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [allStores] = useState<Store[]>(mockStores);
  const [reels, setReels] = useState<Reel[]>(mockReels);

  // --- User Functions ---
  const login = (name: string) => setUser({ name, isLoggedIn: true });
  const logout = () => {
    setUser(null);
    setCart([]); // Clear cart on logout
    setWishlist([]); // Clear wishlist on logout
  };

  // --- Cart Functions ---
  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart],
  );

  // --- Wishlist Functions ---
  const addToWishlist = (item: WishlistItem) => {
    setWishlist((prevWishlist) => {
      const exists = prevWishlist.find((wishItem) => wishItem.id === item.id);
      if (exists) {
        return prevWishlist; // Item already in wishlist
      }
      return [...prevWishlist, item];
    });
  };

  const removeFromWishlist = (itemId: string) => {
    setWishlist((prevWishlist) =>
      prevWishlist.filter((item) => item.id !== itemId),
    );
  };

  const isInWishlist = (itemId: string): boolean => {
    return wishlist.some((item) => item.id === itemId);
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  // --- Store Functions (Centralized & Reusable) ---

  /**
   * Get a single store by ID
   */
  const getStoreById = (id: string): Store | undefined => {
    return allStores.find((store) => store.id === id);
  };

  /**
   * Get featured stores (sorted by rating)
   * @param limit - Number of stores to return (default: all)
   */
  const getFeaturedStores = (limit?: number): Store[] => {
    const sorted = [...allStores].sort((a, b) => b.rating - a.rating);
    return limit ? sorted.slice(0, limit) : sorted;
  };

  /**
   * Get stores by type/category
   * @param type - Store type (e.g., "Grocery", "Restaurant")
   */
  const getStoresByType = (type: string): Store[] => {
    if (type === "All") return allStores;
    return allStores.filter((store) => store.type === type);
  };

  /**
   * Get nearby stores within a distance
   * @param distance - Maximum distance in km
   */
  const getNearbyStores = (distance: number): Store[] => {
    return allStores.filter((store) => {
      const storeDist = parseFloat(store.distance);
      return storeDist <= distance;
    });
  };

  /**
   * Search stores by name or type
   * @param query - Search query string
   */
  const searchStores = (query: string): Store[] => {
    if (!query.trim()) return allStores;

    const lowerQuery = query.toLowerCase();
    return allStores.filter(
      (store) =>
        store.name.toLowerCase().includes(lowerQuery) ||
        store.type.toLowerCase().includes(lowerQuery),
    );
  };

  // --- Reel Functions ---
  const toggleLikeReel = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) =>
        r._id === reelId
          ? {
              ...r,
              liked: !r.liked,
              likesCount: r.liked ? r.likesCount - 1 : r.likesCount + 1,
            }
          : r,
      ),
    );
  };

  // --- Context Value ---
  const contextValue = useMemo(
    () => ({
      // User
      user,
      login,
      logout,

      // Cart
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      cartTotal,

      // Wishlist
      wishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist,

      // Stores
      allStores,
      getStoreById,
      getFeaturedStores,
      getStoresByType,
      getNearbyStores,
      searchStores,

      // Reels
      reels,
      toggleLikeReel,
    }),
    [user, cart, cartTotal, allStores, reels, wishlist],
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

// --- Custom Hook ---
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
