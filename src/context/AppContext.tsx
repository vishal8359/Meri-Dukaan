// src/context/AppContext.tsx

import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { EnhancedReel, mockReels, mockStores, Store } from "../assets/mockData";

// --- Interfaces ---
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  storeName?: string;
  storeId?: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  type: "product" | "service" | "store";
  description?: string;
  image?: string;
  rating?: number;
  storeName?: string;
  storeId?: string;
  category?: string;
  storeType?: string;
  distance?: string;
  duration?: string;
}

// Booked Service interface
export interface BookedService {
  id: string;
  serviceId: string;
  serviceName: string;
  storeName: string;
  storeId: string;
  price: number;
  bookingDate: string;
  bookingTime: string;
  duration?: string;
  image?: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  expiresAt?: number; // timestamp for pending booking expiry
}

// Re-export EnhancedReel as Reel for backward compatibility
export type Reel = EnhancedReel;

// User Profile interface
export interface UserProfile {
  name: string;
  isLoggedIn: boolean;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  bio?: string;
}

interface AppContextType {
  // User Management
  user: UserProfile | null;
  login: (name: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;

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
  toggleWishlistItem: (item: WishlistItem) => void;
  getWishlistByType: (type: "product" | "service" | "store") => WishlistItem[];

  // Booked Services Management
  bookedServices: BookedService[];
  bookService: (service: BookedService) => void;
  confirmBooking: (bookingId: string) => void;
  cancelBooking: (bookingId: string) => void;
  updateBooking: (bookingId: string, updates: Partial<BookedService>) => void;
  isServiceBooked: (serviceId: string) => boolean;
  getBookingByServiceId: (serviceId: string) => BookedService | undefined;

  // Store Management (Centralized)
  allStores: Store[];
  getStoreById: (id: string) => Store | undefined;
  getFeaturedStores: (limit?: number) => Store[];
  getStoresByType: (type: string) => Store[];
  getNearbyStores: (distance: number) => Store[];
  searchStores: (query: string) => Store[];

  // Follow Store Management
  followedStoreIds: string[];
  toggleFollowStore: (storeId: string) => void;
  isFollowingStore: (storeId: string) => boolean;
  getFollowedStores: () => Store[];

  // Reel Management
  reels: EnhancedReel[];
  toggleLikeReel: (reelId: string) => void;
  updateReelComments: (
    reelId: string,
    comments: EnhancedReel["comments"],
  ) => void;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  storeName?: string;
  storeId?: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  // --- State Management ---
  const [user, setUser] = useState<UserProfile | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [bookedServices, setBookedServices] = useState<BookedService[]>([]);
  const [allStores] = useState<Store[]>(mockStores);
  const [followedStoreIds, setFollowedStoreIds] = useState<string[]>([]);
  const [reels, setReels] = useState<EnhancedReel[]>(mockReels);

  // --- User Functions ---
  const login = (name: string) => setUser({ name, isLoggedIn: true });
  const logout = () => {
    setUser(null);
    setCart([]); // Clear cart on logout
    setWishlist([]); // Clear wishlist on logout
  };
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) =>
      prev
        ? { ...prev, ...updates }
        : { name: "", isLoggedIn: true, ...updates },
    );
  }, []);

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

  const isInWishlist = useCallback(
    (itemId: string): boolean => {
      return wishlist.some((item) => item.id === itemId);
    },
    [wishlist],
  );

  const clearWishlist = () => {
    setWishlist([]);
  };

  const toggleWishlistItem = (item: WishlistItem) => {
    if (isInWishlist(item.id)) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist(item);
    }
  };

  const getWishlistByType = (
    type: "product" | "service" | "store",
  ): WishlistItem[] => {
    return wishlist.filter((item) => item.type === type);
  };

  // --- Booked Services Functions ---
  const bookService = (service: BookedService) => {
    setBookedServices((prev) => {
      // Check if service is already booked
      const exists = prev.find((s) => s.serviceId === service.serviceId);
      if (exists) {
        // Update existing booking
        return prev.map((s) =>
          s.serviceId === service.serviceId ? { ...s, ...service } : s,
        );
      }
      return [...prev, service];
    });
  };

  const confirmBooking = (bookingId: string) => {
    setBookedServices((prev) =>
      prev.map((service) =>
        service.id === bookingId
          ? { ...service, status: "confirmed" as const, expiresAt: undefined }
          : service,
      ),
    );
  };

  const cancelBooking = (bookingId: string) => {
    setBookedServices((prev) =>
      prev.filter((service) => service.id !== bookingId),
    );
  };

  // --- Auto-expire pending bookings after their expiresAt time ---
  const expiryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Check every 10 seconds for expired pending bookings
    expiryTimerRef.current = setInterval(() => {
      const now = Date.now();
      setBookedServices((prev) => {
        const hasExpired = prev.some(
          (s) => s.status === "pending" && s.expiresAt && s.expiresAt <= now,
        );
        if (!hasExpired) return prev;
        return prev.filter(
          (s) => !(s.status === "pending" && s.expiresAt && s.expiresAt <= now),
        );
      });
    }, 10000);

    return () => {
      if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
    };
  }, []);

  const updateBooking = (
    bookingId: string,
    updates: Partial<BookedService>,
  ) => {
    setBookedServices((prev) =>
      prev.map((service) =>
        service.id === bookingId ? { ...service, ...updates } : service,
      ),
    );
  };

  const isServiceBooked = (serviceId: string): boolean => {
    return bookedServices.some(
      (service) =>
        service.serviceId === serviceId && service.status !== "cancelled",
    );
  };

  const getBookingByServiceId = (
    serviceId: string,
  ): BookedService | undefined => {
    return bookedServices.find(
      (service) =>
        service.serviceId === serviceId && service.status !== "cancelled",
    );
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

  // --- Follow Store Functions ---
  const toggleFollowStore = useCallback((storeId: string) => {
    setFollowedStoreIds((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId],
    );
  }, []);

  const isFollowingStore = useCallback(
    (storeId: string): boolean => {
      return followedStoreIds.includes(storeId);
    },
    [followedStoreIds],
  );

  const getFollowedStores = useCallback((): Store[] => {
    return allStores.filter((store) => followedStoreIds.includes(store.id));
  }, [allStores, followedStoreIds]);

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

  const updateReelComments = (
    reelId: string,
    comments: EnhancedReel["comments"],
  ) => {
    setReels((prev) =>
      prev.map((r) => (r._id === reelId ? { ...r, comments } : r)),
    );
  };

  // --- Context Value ---
  const contextValue = useMemo(
    () => ({
      // User
      user,
      login,
      logout,
      updateProfile,

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
      toggleWishlistItem,
      getWishlistByType,

      // Booked Services
      bookedServices,
      bookService,
      confirmBooking,
      cancelBooking,
      updateBooking,
      isServiceBooked,
      getBookingByServiceId,

      // Stores
      allStores,
      getStoreById,
      getFeaturedStores,
      getStoresByType,
      getNearbyStores,
      searchStores,

      // Follow Stores
      followedStoreIds,
      toggleFollowStore,
      isFollowingStore,
      getFollowedStores,

      // Reels
      reels,
      toggleLikeReel,
      updateReelComments,
    }),
    [
      user,
      cart,
      cartTotal,
      allStores,
      reels,
      wishlist,
      bookedServices,
      followedStoreIds,
    ],
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
