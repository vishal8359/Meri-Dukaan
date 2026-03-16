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
import * as cartApi from "../api/cart";
import * as orderApi from "../api/orders";
import * as reelApi from "../api/reels";
import * as storeApi from "../api/stores";
import { EnhancedReel, Store } from "../types/catalog";
import { useAuth } from "./AuthContext";

// --- Interfaces ---
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  cartItemId?: string;
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

export interface CatalogProduct {
  id: string;
  storeId: string;
  storeName: string;
  name: string;
  category: string;
  image: string;
  images: string[];
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  distance: string;
  description?: string;
  unit?: string;
  delivery?: string;
  isSubscription?: boolean;
}

export interface CatalogService {
  id: string;
  storeId: string;
  storeName: string;
  name: string;
  category: string;
  image: string;
  images: string[];
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewsCount: number;
  distance: string;
  description?: string;
  duration?: string;
  active?: boolean;
  features?: string[];
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

// Order interfaces
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  storeName?: string;
  storeId?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: "processing" | "in-transit" | "delivered" | "cancelled";
  paymentMethod: "cod" | "online";
  orderDate: string;
  deliveryDate?: string;
  deliveryAddress: string;
  deliveryPhone: string;
}

// User Address interface
export interface UserAddress {
  id: string;
  label: string; // e.g. "Home", "Office"
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

// ── My Store (owner) interfaces ──

export type QuantityUnit = "kg" | "g" | "ml" | "l" | "pcs";

export interface MyStoreProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  quantity: number;
  unit: QuantityUnit;
  inStock: boolean;
}

export interface MyStoreService {
  id: string;
  name: string;
  price: number;
  images: string[];
  duration: string; // e.g. "30 min", "1 hr"
  description: string;
  available: boolean;
}

export interface MyStoreReel {
  id: string;
  videoUrl: string;
  caption: string;
  createdAt: number; // timestamp
  likes: number;
  comments: number;
  views: number;
  thumbnail?: string;
}

export interface MyStore {
  id: string;
  name: string;
  category: string;
  businessType: "products" | "services" | "both";
  location: string;
  images: string[];
  rating: number;
  followers: number;
  products: MyStoreProduct[];
  services: MyStoreService[];
  reels: MyStoreReel[];
  createdAt: number;
}

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
  catalogProducts: CatalogProduct[];
  catalogServices: CatalogService[];
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

  // Order Management
  orders: Order[];
  placeOrder: (order: Order) => void;
  getOrderById: (orderId: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;

  // Address Management
  savedAddresses: UserAddress[];
  selectedAddressId: string | null;
  addAddress: (address: UserAddress) => void;
  updateAddress: (id: string, updates: Partial<UserAddress>) => void;
  removeAddress: (id: string) => void;
  setSelectedAddressId: (id: string) => void;
  getSelectedAddress: () => UserAddress | undefined;

  // My Store (owner) Management
  myStore: MyStore | null;
  createMyStore: (store: MyStore) => void;
  updateMyStore: (updates: Partial<MyStore>) => void;
  addMyProduct: (product: MyStoreProduct) => void;
  updateMyProduct: (id: string, updates: Partial<MyStoreProduct>) => void;
  removeMyProduct: (id: string) => void;
  addMyService: (service: MyStoreService) => void;
  updateMyService: (id: string, updates: Partial<MyStoreService>) => void;
  removeMyService: (id: string) => void;
  addMyReel: (reel: MyStoreReel) => void;
  removeMyReel: (id: string) => void;
  canUploadReelToday: () => boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  cartItemId?: string;
  image?: string;
  storeName?: string;
  storeId?: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { authToken, user: authUser } = useAuth();

  // --- State Management ---
  const [user, setUser] = useState<UserProfile | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [bookedServices, setBookedServices] = useState<BookedService[]>([]);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [catalogServices, setCatalogServices] = useState<CatalogService[]>([]);
  const [followedStoreIds, setFollowedStoreIds] = useState<string[]>([]);
  const [reels, setReels] = useState<EnhancedReel[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [myStore, setMyStore] = useState<MyStore | null>(null);

  // --- Address State ---
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([
    {
      id: "addr_1",
      label: "Home",
      address: "Rajendra Nagar",
      city: "Patna",
      state: "Bihar",
      pincode: "800016",
      phone: "+91 98765 43210",
      isDefault: true,
    },
    {
      id: "addr_2",
      label: "Office",
      address: "Boring Road",
      city: "Patna",
      state: "Bihar",
      pincode: "800001",
      phone: "+91 98765 43210",
      isDefault: false,
    },
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    "addr_1",
  );

  const mapStoreFromApi = useCallback((raw: any): Store => {
    const imageUrls: string[] = Array.isArray(raw?.images)
      ? raw.images
          .map((img: any) => img?.image_url)
          .filter((url: unknown): url is string => typeof url === "string")
      : [];

    const primaryImage =
      imageUrls[0] ||
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=400";

    return {
      id: String(raw?.id ?? ""),
      name: String(raw?.store_name ?? raw?.name ?? "Store"),
      type: String(raw?.category ?? raw?.type ?? "General"),
      followers: `${raw?.followers_count ?? 0}`,
      rating: Number(raw?.rating ?? 0),
      distance: String(raw?.distance ?? "0 km"),
      image: primaryImage,
      images: imageUrls.length > 0 ? imageUrls : [primaryImage],
    };
  }, []);

  const mapCartItemFromApi = useCallback((raw: any): CartItem => {
    const product = raw?.product ?? {};
    const productImages = Array.isArray(product?.images) ? product.images : [];
    const firstImage =
      productImages[0]?.image_url ||
      "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400";

    return {
      id: String(product?.id ?? raw?.product_id ?? raw?.id ?? ""),
      cartItemId: String(raw?.id ?? ""),
      name: String(product?.name ?? "Item"),
      price: Number(product?.offer_price ?? product?.real_price ?? 0),
      quantity: Number(raw?.quantity ?? 1),
      image: firstImage,
      storeName: undefined,
      storeId: undefined,
    };
  }, []);

  const mapReelFromApi = useCallback((raw: any): EnhancedReel => {
    const engagement = raw?.engagement || {};
    const storeName = raw?.store?.store_name || raw?.store_name || "Store";
    const storeId = raw?.store?.id || raw?.store_id || "";

    return {
      _id: String(raw?.id ?? ""),
      videoUrl: String(raw?.video_url ?? raw?.videoUrl ?? ""),
      description: String(raw?.description ?? ""),
      likesCount: Number(engagement?.likes ?? 0),
      liked: false,
      shares: Number(engagement?.shares ?? 0),
      saves: Number(engagement?.saves ?? 0),
      user: {
        id: String(storeId),
        name: String(storeName),
        avatar:
          "https://images.unsplash.com/photo-1556740749-887f6717d7e4?q=80&w=200",
        isVerified: false,
      },
      store: {
        id: String(storeId),
        name: String(storeName),
        logo: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?q=80&w=200",
        type: String(raw?.store?.category ?? "General"),
        isVerified: false,
      },
      item: {
        id: String(raw?.id ?? ""),
        name: "Featured Item",
        price: 0,
        image:
          "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=300",
        type: "product",
      },
      comments: [],
    };
  }, []);

  const mapOrderFromApi = useCallback((raw: any): Order => {
    const items: OrderItem[] = Array.isArray(raw?.items)
      ? raw.items.map((i: any) => ({
          id: String(i?.product_id ?? i?.id ?? ""),
          name: String(i?.product?.name ?? "Item"),
          price: Number(i?.price_at_purchase ?? 0),
          quantity: Number(i?.quantity ?? 1),
          image: i?.product?.images?.[0]?.image_url,
        }))
      : [];

    return {
      id: String(raw?.id ?? ""),
      items,
      subtotal: Number(raw?.total_price ?? 0),
      deliveryFee: 0,
      totalAmount: Number(raw?.total_price ?? 0),
      status: (raw?.status as Order["status"]) ?? "processing",
      paymentMethod: "online",
      orderDate: String(raw?.created_at ?? new Date().toISOString()),
      deliveryDate: undefined,
      deliveryAddress: "",
      deliveryPhone: "",
    };
  }, []);

  const mapMyStoreProduct = useCallback((raw: any): MyStoreProduct => {
    const imageUrls: string[] = Array.isArray(raw?.images)
      ? raw.images
          .map((img: any) => img?.image_url)
          .filter((url: unknown): url is string => typeof url === "string")
      : [];

    return {
      id: String(raw?.id ?? ""),
      name: String(raw?.name ?? "Product"),
      price: Number(raw?.offer_price ?? raw?.real_price ?? 0),
      images: imageUrls,
      quantity: Number(raw?.stock ?? 0),
      unit: "pcs",
      inStock: Number(raw?.stock ?? 0) > 0,
    };
  }, []);

  const mapMyStoreService = useCallback((raw: any): MyStoreService => {
    return {
      id: String(raw?.id ?? ""),
      name: String(raw?.name ?? "Service"),
      price: 0,
      images: [],
      duration: String(raw?.timings ?? ""),
      description: String(raw?.description ?? ""),
      available: Boolean(raw?.availability ?? true),
    };
  }, []);

  const mapMyStoreReel = useCallback((raw: any): MyStoreReel => {
    const engagement = raw?.engagement || {};
    return {
      id: String(raw?.id ?? ""),
      videoUrl: String(raw?.video_url ?? ""),
      caption: String(raw?.description ?? ""),
      createdAt: new Date(raw?.created_at ?? Date.now()).getTime(),
      likes: Number(engagement?.likes ?? 0),
      comments: 0,
      views: Number(engagement?.views ?? 0),
      thumbnail: undefined,
    };
  }, []);

  const mapCatalogProduct = useCallback((store: any, raw: any): CatalogProduct => {
    const offerPrice = Number(raw?.offer_price ?? 0);
    const realPrice = Number(raw?.real_price ?? 0);
    const price = offerPrice || realPrice;
    const discount = realPrice > price && realPrice > 0
      ? Math.round(((realPrice - price) / realPrice) * 100)
      : 0;

    const imageUrls: string[] = Array.isArray(raw?.images)
      ? raw.images
          .map((img: any) => img?.image_url)
          .filter((url: unknown): url is string => typeof url === "string")
      : [];

    const fallbackImage =
      "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400";

    return {
      id: String(raw?.id ?? ""),
      storeId: String(store?.id ?? raw?.store_id ?? ""),
      storeName: String(store?.store_name ?? "Store"),
      name: String(raw?.name ?? "Product"),
      category: String(raw?.type ?? "general").toLowerCase(),
      image: imageUrls[0] || fallbackImage,
      images: imageUrls.length > 0 ? imageUrls : [fallbackImage],
      price,
      originalPrice: realPrice > price ? realPrice : undefined,
      discount: discount > 0 ? discount : undefined,
      rating: Number(raw?.rating ?? 0),
      reviews: 0,
      distance: String(store?.distance ?? "0 km"),
      description: String(raw?.description ?? ""),
      unit: "1 pc",
      delivery: "30-45 min",
      isSubscription: true,
    };
  }, []);

  const mapCatalogService = useCallback((store: any, raw: any): CatalogService => {
    const fallbackImage =
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=400";

    return {
      id: String(raw?.id ?? ""),
      storeId: String(store?.id ?? raw?.store_id ?? ""),
      storeName: String(store?.store_name ?? "Store"),
      name: String(raw?.name ?? "Service"),
      category: String(raw?.type ?? "service").toLowerCase(),
      image: fallbackImage,
      images: [fallbackImage],
      price: 0,
      rating: Number(raw?.rating ?? 0),
      reviewsCount: 0,
      distance: String(store?.distance ?? "0 km"),
      description: String(raw?.description ?? ""),
      duration: String(raw?.timings ?? ""),
      active: Boolean(raw?.availability ?? true),
      features: [],
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const response = await storeApi.getStores({ page: 1, limit: 100 });
        const mapped = Array.isArray(response.stores)
          ? response.stores.map(mapStoreFromApi)
          : [];
        setAllStores(mapped);
      } catch {
        setAllStores([]);
      }
    })();
  }, [mapStoreFromApi]);

  useEffect(() => {
    (async () => {
      if (!allStores.length) {
        setCatalogProducts([]);
        setCatalogServices([]);
        return;
      }

      try {
        const results = await Promise.all(
          allStores.map(async (store) => {
            const [productsRes, servicesRes] = await Promise.allSettled([
              storeApi.getStoreProducts(store.id),
              storeApi.getStoreServices(store.id),
            ]);

            const products =
              productsRes.status === "fulfilled" &&
              Array.isArray(productsRes.value?.products)
                ? (productsRes.value.products as any[])
                : [];

            const services =
              servicesRes.status === "fulfilled" &&
              Array.isArray(servicesRes.value?.services)
                ? (servicesRes.value.services as any[])
                : [];

            return {
              store,
              products,
              services,
            };
          }),
        );

        const mappedProducts = results
          .flatMap((entry) =>
            entry.products.map((product) => mapCatalogProduct(entry.store, product)),
          )
          .filter((item) => item.id);

        const mappedServices = results
          .flatMap((entry) =>
            entry.services.map((service) => mapCatalogService(entry.store, service)),
          )
          .filter((item) => item.id);

        setCatalogProducts(mappedProducts);
        setCatalogServices(mappedServices);
      } catch {
        setCatalogProducts([]);
        setCatalogServices([]);
      }
    })();
  }, [allStores, mapCatalogProduct, mapCatalogService]);

  useEffect(() => {
    (async () => {
      try {
        const response = await reelApi.getReelFeed({ page: 1, limit: 50 });
        const mapped = Array.isArray(response.reels)
          ? response.reels.map(mapReelFromApi)
          : [];
        setReels(mapped);
      } catch {
        setReels([]);
      }
    })();
  }, [mapReelFromApi]);

  useEffect(() => {
    (async () => {
      if (!authToken) {
        setCart([]);
        setOrders([]);
        return;
      }

      try {
        const cartRes = await cartApi.getCart(authToken);
        const mappedCart = Array.isArray(cartRes.items)
          ? cartRes.items.map(mapCartItemFromApi)
          : [];
        setCart(mappedCart);
      } catch {
        setCart([]);
      }

      try {
        const orderRes = await orderApi.getOrders(authToken);
        const mappedOrders = Array.isArray(orderRes.orders)
          ? orderRes.orders.map(mapOrderFromApi)
          : [];
        setOrders(mappedOrders);
      } catch {
        setOrders([]);
      }
    })();
  }, [authToken, mapCartItemFromApi, mapOrderFromApi]);

  useEffect(() => {
    (async () => {
      if (!authUser?.id) return;
      try {
        const storesResponse = await storeApi.getStores({
          page: 1,
          limit: 100,
        });
        const stores = Array.isArray(storesResponse.stores)
          ? (storesResponse.stores as any[])
          : [];

        const ownerStore: any = stores.length
          ? stores.find((s) => s?.owner?.id === authUser.id)
          : null;

        if (!ownerStore) return;

        const storeId = String(ownerStore.id);
        const [inventoryRes, servicesRes, reelsRes] = await Promise.all([
          authToken
            ? storeApi.getStoreInventory(authToken, storeId)
            : Promise.resolve({ inventory: { products: [] } as any }),
          storeApi.getStoreServices(storeId),
          reelApi.getStoreReels(storeId),
        ]);

        const storeImages = Array.isArray(ownerStore?.images)
          ? ownerStore.images
              .map((img: any) => img?.image_url)
              .filter((url: unknown): url is string => typeof url === "string")
          : [];

        const inventoryProducts = Array.isArray(
          (inventoryRes as any)?.inventory?.products,
        )
          ? (inventoryRes as any).inventory.products
          : [];

        const services = Array.isArray((servicesRes as any)?.services)
          ? (servicesRes as any).services
          : [];

        const reelsData = Array.isArray((reelsRes as any)?.reels)
          ? (reelsRes as any).reels
          : [];

        setMyStore({
          id: storeId,
          name: String(ownerStore.store_name ?? ownerStore.name ?? "My Store"),
          category: String(ownerStore.category ?? "General"),
          businessType:
            services.length > 0 && inventoryProducts.length > 0
              ? "both"
              : services.length > 0
                ? "services"
                : "products",
          location: String(ownerStore.location ?? ""),
          images: storeImages,
          rating: Number(ownerStore.rating ?? 0),
          followers: Number(ownerStore.followers_count ?? 0),
          products: inventoryProducts.map(mapMyStoreProduct),
          services: services.map(mapMyStoreService),
          reels: reelsData.map(mapMyStoreReel),
          createdAt: new Date(ownerStore.created_at ?? Date.now()).getTime(),
        });
      } catch {
        setMyStore(null);
      }
    })();
  }, [
    authToken,
    authUser?.id,
    mapMyStoreProduct,
    mapMyStoreReel,
    mapMyStoreService,
  ]);

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
    if (authToken && product?.id) {
      void cartApi
        .addToCart(authToken, String(product.id), 1)
        .then(() => cartApi.getCart(authToken))
        .then((cartRes) => {
          const mapped = Array.isArray(cartRes.items)
            ? cartRes.items.map(mapCartItemFromApi)
            : [];
          setCart(mapped);
        })
        .catch(() => {
          // Fall through to optimistic local update below.
        });
    }

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
    if (authToken) {
      const target = cart.find((item) => item.id === productId);
      if (target?.cartItemId) {
        void cartApi.removeCartItem(authToken, target.cartItemId).catch(() => {
          // Keep local fallback behavior.
        });
      }
    }
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (authToken) {
      const target = cart.find((item) => item.id === productId);
      if (target?.cartItemId) {
        void cartApi
          .updateCartItem(authToken, target.cartItemId, quantity)
          .catch(() => {
            // Keep local fallback behavior.
          });
      }
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => {
    if (authToken) {
      void cartApi.clearCart(authToken).catch(() => {
        // Keep local fallback behavior.
      });
    }
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
    const targetReel = reels.find((r) => r._id === reelId);
    if (authToken && targetReel?.store?.id) {
      void reelApi
        .engageStoreReel(authToken, targetReel.store.id, reelId, "likes")
        .catch(() => {
          // Keep local optimistic behavior.
        });
    }

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

  // --- Order Functions ---
  const placeOrder = useCallback(
    (order: Order) => {
      if (authToken && order.items.length > 0) {
        const firstStoreId = order.items[0]?.storeId;
        if (firstStoreId) {
          void orderApi
            .placeOrder(authToken, {
              storeId: firstStoreId,
              items: order.items.map((i) => ({
                productId: i.id,
                quantity: i.quantity,
              })),
            })
            .then(() => orderApi.getOrders(authToken))
            .then((res) => {
              const mappedOrders = Array.isArray(res.orders)
                ? res.orders.map(mapOrderFromApi)
                : [];
              setOrders(mappedOrders);
              setCart([]);
            })
            .catch(() => {
              // Keep local fallback behavior.
            });
        }
      }

      setOrders((prev) => [order, ...prev]);
    },
    [authToken, mapOrderFromApi],
  );

  const getOrderById = useCallback(
    (orderId: string): Order | undefined => {
      return orders.find((o) => o.id === orderId);
    },
    [orders],
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: Order["status"]) => {
      if (authToken) {
        void orderApi
          .updateOrderStatus(authToken, orderId, status)
          .catch(() => {
            // Keep local fallback behavior.
          });
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
      );
    },
    [authToken],
  );

  // --- Address Functions ---
  const addAddress = useCallback((address: UserAddress) => {
    setSavedAddresses((prev) => {
      // If new address is default, unset previous default
      if (address.isDefault) {
        return [...prev.map((a) => ({ ...a, isDefault: false })), address];
      }
      return [...prev, address];
    });
  }, []);

  const updateAddress = useCallback(
    (id: string, updates: Partial<UserAddress>) => {
      setSavedAddresses((prev) =>
        prev.map((a) => {
          if (a.id === id) return { ...a, ...updates };
          // If updated address becomes default, unset others
          if (updates.isDefault) return { ...a, isDefault: false };
          return a;
        }),
      );
    },
    [],
  );

  const removeAddress = useCallback(
    (id: string) => {
      setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
      if (selectedAddressId === id) {
        setSelectedAddressId(
          savedAddresses.find((a) => a.id !== id && a.isDefault)?.id ??
            savedAddresses.find((a) => a.id !== id)?.id ??
            null,
        );
      }
    },
    [selectedAddressId, savedAddresses],
  );

  const getSelectedAddress = useCallback((): UserAddress | undefined => {
    return savedAddresses.find((a) => a.id === selectedAddressId);
  }, [savedAddresses, selectedAddressId]);

  // --- My Store Functions ---
  const createMyStore = useCallback(
    (store: MyStore) => {
      if (authToken) {
        void storeApi
          .createStore(authToken, {
            storeName: store.name,
            category: store.category,
            location: store.location,
            images: store.images,
          })
          .catch(() => {
            // Keep local fallback behavior.
          });
      }

      setMyStore(store);
    },
    [authToken],
  );

  const updateMyStore = useCallback((updates: Partial<MyStore>) => {
    setMyStore((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const addMyProduct = useCallback(
    (product: MyStoreProduct) => {
      if (authToken && myStore?.id) {
        void storeApi
          .addStoreProduct(authToken, myStore.id, {
            name: product.name,
            type: "General",
            realPrice: product.price,
            offerPrice: product.price,
            stock: product.quantity,
            description: "",
            available: product.inStock,
            images: product.images,
          })
          .catch(() => {
            // Keep local fallback behavior.
          });
      }

      setMyStore((prev) =>
        prev ? { ...prev, products: [...prev.products, product] } : prev,
      );
    },
    [authToken, myStore?.id],
  );

  const updateMyProduct = useCallback(
    (id: string, updates: Partial<MyStoreProduct>) => {
      setMyStore((prev) =>
        prev
          ? {
              ...prev,
              products: prev.products.map((p) =>
                p.id === id ? { ...p, ...updates } : p,
              ),
            }
          : prev,
      );
    },
    [],
  );

  const removeMyProduct = useCallback((id: string) => {
    setMyStore((prev) =>
      prev
        ? { ...prev, products: prev.products.filter((p) => p.id !== id) }
        : prev,
    );
  }, []);

  const addMyService = useCallback(
    (service: MyStoreService) => {
      if (authToken && myStore?.id) {
        void storeApi
          .addStoreService(authToken, myStore.id, {
            name: service.name,
            type: "General",
            availability: service.available,
            timings: service.duration,
            description: service.description,
          })
          .catch(() => {
            // Keep local fallback behavior.
          });
      }

      setMyStore((prev) =>
        prev ? { ...prev, services: [...prev.services, service] } : prev,
      );
    },
    [authToken, myStore?.id],
  );

  const updateMyService = useCallback(
    (id: string, updates: Partial<MyStoreService>) => {
      setMyStore((prev) =>
        prev
          ? {
              ...prev,
              services: prev.services.map((s) =>
                s.id === id ? { ...s, ...updates } : s,
              ),
            }
          : prev,
      );
    },
    [],
  );

  const removeMyService = useCallback((id: string) => {
    setMyStore((prev) =>
      prev
        ? { ...prev, services: prev.services.filter((s) => s.id !== id) }
        : prev,
    );
  }, []);

  const addMyReel = useCallback(
    (reel: MyStoreReel) => {
      if (authToken && myStore?.id) {
        void reelApi
          .createStoreReel(authToken, myStore.id, {
            videoUrl: reel.videoUrl,
            description: reel.caption,
          })
          .catch(() => {
            // Keep local fallback behavior.
          });
      }

      setMyStore((prev) =>
        prev ? { ...prev, reels: [reel, ...prev.reels] } : prev,
      );
    },
    [authToken, myStore?.id],
  );

  const removeMyReel = useCallback((id: string) => {
    setMyStore((prev) =>
      prev ? { ...prev, reels: prev.reels.filter((r) => r.id !== id) } : prev,
    );
  }, []);

  const canUploadReelToday = useCallback((): boolean => {
    if (!myStore) return false;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return !myStore.reels.some((r) => r.createdAt >= todayStart.getTime());
  }, [myStore]);

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
      catalogProducts,
      catalogServices,
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

      // Orders
      orders,
      placeOrder,
      getOrderById,
      updateOrderStatus,

      // Addresses
      savedAddresses,
      selectedAddressId,
      addAddress,
      updateAddress,
      removeAddress,
      setSelectedAddressId,
      getSelectedAddress,

      // My Store
      myStore,
      createMyStore,
      updateMyStore,
      addMyProduct,
      updateMyProduct,
      removeMyProduct,
      addMyService,
      updateMyService,
      removeMyService,
      addMyReel,
      removeMyReel,
      canUploadReelToday,
    }),
    [
      user,
      cart,
      cartTotal,
      allStores,
      catalogProducts,
      catalogServices,
      reels,
      wishlist,
      bookedServices,
      followedStoreIds,
      orders,
      savedAddresses,
      selectedAddressId,
      myStore,
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
