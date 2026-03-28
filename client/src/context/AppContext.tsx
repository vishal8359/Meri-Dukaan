// src/context/AppContext.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { InteractionManager } from "react-native";
import * as cartApi from "../api/cart";
import * as orderApi from "../api/orders";
import * as reelApi from "../api/reels";
import * as serviceBookingApi from "../api/serviceBookings";
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
  stockQuantity?: number;
  available?: boolean;
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
  delivery?: string;
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
  slotStartAt?: string;
  slotEndAt?: string;
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
  description?: string;
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
  openingTime?: string; // e.g., "09:00"
  closingTime?: string; // e.g., "21:00"
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
  bookService: (service: BookedService) => Promise<BookedService>;
  confirmBooking: (bookingId: string) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  updateBooking: (
    bookingId: string,
    updates: Partial<BookedService>,
  ) => Promise<void>;
  getLockedServiceSlots: (
    serviceId: string,
    bookingDate: string,
  ) => Promise<string[]>;
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
  placeOrder: (order: Order) => Promise<void>;
  refreshOrders: () => Promise<void>;
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
  createMyStore: (store: MyStore) => Promise<MyStore>;
  updateMyStore: (updates: Partial<MyStore>) => Promise<void>;
  addMyProduct: (product: MyStoreProduct) => Promise<MyStoreProduct>;
  updateMyProduct: (id: string, updates: Partial<MyStoreProduct>) => void;
  removeMyProduct: (id: string) => Promise<void>;
  addMyService: (service: MyStoreService) => Promise<MyStoreService>;
  updateMyService: (id: string, updates: Partial<MyStoreService>) => void;
  removeMyService: (id: string) => Promise<void>;
  removeMyStore: (ownerPin: string) => Promise<void>;
  addMyReel: (reel: MyStoreReel) => Promise<MyStoreReel>;
  removeMyReel: (id: string) => void;
  updateStoreHours: (
    schedule: Array<{
      dayOfWeek: string;
      openingTime?: string;
      closingTime?: string;
      isClosed?: boolean;
    }>,
  ) => Promise<void>;
  canUploadReelToday: () => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const CATALOG_CACHE_KEY = "app:catalog:v2";
const CATALOG_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MY_STORE_BUSINESS_TYPE_KEY = "app:myStoreBusinessType:v1";
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

type BusinessType = MyStore["businessType"];

function isBusinessType(value: unknown): value is BusinessType {
  return value === "products" || value === "services" || value === "both";
}

async function loadSavedBusinessTypes(): Promise<Record<string, BusinessType>> {
  try {
    const raw = await AsyncStorage.getItem(MY_STORE_BUSINESS_TYPE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {};

    const sanitized: Record<string, BusinessType> = {};
    Object.entries(parsed).forEach(([storeId, businessType]) => {
      if (isBusinessType(businessType)) {
        sanitized[storeId] = businessType;
      }
    });

    return sanitized;
  } catch {
    return {};
  }
}

async function saveBusinessType(storeId: string, businessType: BusinessType) {
  if (!storeId || !isBusinessType(businessType)) return;

  const saved = await loadSavedBusinessTypes();
  saved[storeId] = businessType;
  await AsyncStorage.setItem(MY_STORE_BUSINESS_TYPE_KEY, JSON.stringify(saved));
}

function runAfterInteractions(task: () => void, delayMs = 0) {
  const interactionHandle = InteractionManager.runAfterInteractions(() => {
    if (delayMs > 0) {
      setTimeout(task, delayMs);
      return;
    }

    task();
  });

  return () => interactionHandle.cancel();
}

function parseBookingTimeTo24hParts(label: string): {
  hours: number;
  minutes: number;
} {
  const normalized = String(label || "").trim();
  const match = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    throw new Error("Invalid time slot format");
  }

  const rawHour = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  let hours = rawHour % 12;
  if (meridiem === "PM") hours += 12;

  return { hours, minutes };
}

function deriveSlotWindow(
  bookingDate: string,
  bookingTime: string,
  duration?: string,
) {
  const date = String(bookingDate || "").slice(0, 10);
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) {
    throw new Error("Invalid booking date");
  }

  const { hours, minutes } = parseBookingTimeTo24hParts(bookingTime);
  const start = new Date(year, month - 1, day, hours, minutes, 0, 0);

  let durationMinutes = 60;
  const durationText = String(duration || "").toLowerCase();
  const valueMatch = durationText.match(/(\d+(?:\.\d+)?)/);
  const numericValue = valueMatch ? Number(valueMatch[1]) : NaN;
  if (Number.isFinite(numericValue) && numericValue > 0) {
    if (durationText.includes("hr") || durationText.includes("hour")) {
      durationMinutes = Math.round(numericValue * 60);
    } else {
      durationMinutes = Math.round(numericValue);
    }
  }

  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return { start, end };
}

function formatBookingTimeLabel(iso: string, fallbackLabel?: string) {
  if (!iso) return fallbackLabel || "";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return fallbackLabel || "";

  return parsed.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

type CatalogCachePayload = {
  savedAt: number;
  stores: Store[];
  products: CatalogProduct[];
  services: CatalogService[];
};

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

  useEffect(() => {
    if (!authUser) {
      setUser(null);
      return;
    }

    setUser((prev) => ({
      name: authUser.name || prev?.name || "",
      isLoggedIn: true,
      email: authUser.email || prev?.email,
      phone: authUser.phone || prev?.phone,
      address: authUser.address || prev?.address,
      bio: prev?.bio,
      city: prev?.city,
      state: prev?.state,
      pincode: prev?.pincode,
    }));
  }, [authUser]);

  const hydrateCatalogFromCache = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(CATALOG_CACHE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as CatalogCachePayload;
      if (!parsed || !parsed.savedAt) return;

      if (Date.now() - parsed.savedAt > CATALOG_CACHE_TTL_MS) {
        await AsyncStorage.removeItem(CATALOG_CACHE_KEY);
        return;
      }

      if (Array.isArray(parsed.stores)) setAllStores(parsed.stores);
      if (Array.isArray(parsed.products)) setCatalogProducts(parsed.products);
      if (Array.isArray(parsed.services)) setCatalogServices(parsed.services);
    } catch {
      // Best-effort cache hydration.
    }
  }, []);

  const persistCatalogCache = useCallback(
    async (
      stores: Store[],
      products: CatalogProduct[],
      services: CatalogService[],
    ) => {
      try {
        const payload: CatalogCachePayload = {
          savedAt: Date.now(),
          stores,
          products,
          services,
        };

        await AsyncStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify(payload));
      } catch {
        // Best-effort cache persistence.
      }
    },
    [],
  );

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
      location: String(raw?.location ?? ""),
      openingTime: raw?.opening_time ? String(raw.opening_time) : undefined,
      closingTime: raw?.closing_time ? String(raw.closing_time) : undefined,
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
      storeName: String(product?.store?.store_name ?? raw?.store_name ?? ""),
      storeId: String(product?.store_id ?? raw?.store_id ?? ""),
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
          name: String(i?.name ?? i?.product?.name ?? "Item"),
          price: Number(i?.price ?? i?.price_at_purchase ?? 0),
          quantity: Number(i?.quantity ?? 1),
          image: i?.image ?? i?.product?.images?.[0]?.image_url,
          storeName: i?.store_name,
          storeId: i?.store_id,
        }))
      : [];

    return {
      id: String(raw?.id ?? ""),
      items,
      subtotal: Number(raw?.subtotal ?? raw?.total_price ?? 0),
      deliveryFee: Number(raw?.delivery_fee ?? 0),
      totalAmount: Number(raw?.total_amount ?? raw?.total_price ?? 0),
      status: (raw?.status as Order["status"]) ?? "processing",
      paymentMethod: raw?.payment_method === "cod" ? "cod" : "online",
      orderDate: String(raw?.created_at ?? new Date().toISOString()),
      deliveryDate: undefined,
      deliveryAddress: String(raw?.delivery_address ?? ""),
      deliveryPhone: String(raw?.delivery_phone ?? ""),
    };
  }, []);

  const mapBookedServiceFromApi = useCallback(
    (raw: any): BookedService => {
      const catalogMatch = catalogServices.find(
        (item) =>
          String(item.id) === String(raw?.service_id ?? raw?.service?.id ?? ""),
      );

      const apiStatus = String(raw?.status ?? "booked");
      const mappedStatus: BookedService["status"] =
        apiStatus === "cancelled"
          ? "cancelled"
          : apiStatus === "completed"
            ? "completed"
            : "confirmed";

      return {
        id: String(raw?.id ?? ""),
        serviceId: String(raw?.service_id ?? raw?.service?.id ?? ""),
        serviceName: String(
          raw?.service?.name ?? catalogMatch?.name ?? "Service",
        ),
        storeName: String(raw?.store?.store_name ?? "Store"),
        storeId: String(raw?.store_id ?? raw?.store?.id ?? ""),
        price: Number(catalogMatch?.price ?? 0),
        bookingDate: String(raw?.booking_date ?? ""),
        bookingTime: formatBookingTimeLabel(
          raw?.slot_start_at,
          raw?.slot_label,
        ),
        duration: catalogMatch?.duration,
        image: catalogMatch?.image,
        status: mappedStatus,
        slotStartAt: raw?.slot_start_at ? String(raw.slot_start_at) : undefined,
        slotEndAt: raw?.slot_end_at ? String(raw.slot_end_at) : undefined,
      };
    },
    [catalogServices],
  );

  const refreshOrders = useCallback(async () => {
    if (!authToken) {
      setOrders([]);
      return;
    }

    try {
      const res = await orderApi.getOrders(authToken);
      const mappedOrders = Array.isArray(res.orders)
        ? res.orders.map(mapOrderFromApi)
        : [];
      setOrders(mappedOrders);
    } catch {
      // Keep current in-memory orders if refresh fails temporarily.
    }
  }, [authToken, mapOrderFromApi]);

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
      description: String(raw?.description ?? "").trim() || undefined,
    };
  }, []);

  const mapMyStoreService = useCallback((raw: any): MyStoreService => {
    const imageUrls: string[] = Array.isArray(raw?.images)
      ? raw.images
          .map((img: any) =>
            typeof img === "string" ? img : img?.image_url,
          )
          .filter((url: unknown): url is string => typeof url === "string")
      : [];

    const fallbackImage =
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=400";

    return {
      id: String(raw?.id ?? ""),
      name: String(raw?.name ?? "Service"),
      price: Number(raw?.price ?? 0),
      images: imageUrls.length > 0 ? imageUrls : [fallbackImage],
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

  const mapCatalogProduct = useCallback(
    (store: any, raw: any): CatalogProduct => {
      const offerPrice = Number(raw?.offer_price ?? 0);
      const realPrice = Number(raw?.real_price ?? 0);
      const price = offerPrice || realPrice;
      const discount =
        realPrice > price && realPrice > 0
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
        stockQuantity: Number(raw?.stock ?? 0),
        available: Boolean(raw?.available ?? true),
      };
    },
    [],
  );

  const mapCatalogService = useCallback(
    (store: any, raw: any): CatalogService => {
      const imageUrls: string[] = Array.isArray(raw?.images)
        ? raw.images
            .map((img: any) =>
              typeof img === "string" ? img : img?.image_url,
            )
            .filter((url: unknown): url is string => typeof url === "string")
        : [];

      const fallbackImage =
        "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=400";

      return {
        id: String(raw?.id ?? ""),
        storeId: String(store?.id ?? raw?.store_id ?? ""),
        storeName: String(store?.store_name ?? "Store"),
        name: String(raw?.name ?? "Service"),
        category: String(raw?.type ?? "service").toLowerCase(),
        image: imageUrls[0] || fallbackImage,
        images: imageUrls.length > 0 ? imageUrls : [fallbackImage],
        price: Number(raw?.price ?? 0),
        rating: Number(raw?.rating ?? 0),
        reviewsCount: 0,
        distance: String(store?.distance ?? "0 km"),
        description: String(raw?.description ?? ""),
        duration: String(raw?.timings ?? ""),
        active: Boolean(raw?.availability ?? true),
        features: [],
      };
    },
    [],
  );

  useEffect(() => {
    void hydrateCatalogFromCache();
  }, [hydrateCatalogFromCache]);

  useEffect(() => {
    let cancelled = false;
    const cancelDeferred = runAfterInteractions(() => {
      void (async () => {
        try {
          const response = await storeApi.getCatalog({ page: 1, limit: 100 });
          if (cancelled) return;

          const rawStores = Array.isArray(response.stores)
            ? response.stores
            : [];
          const mappedStores = rawStores.map(mapStoreFromApi);
          const storeById = new Map<string, Store>(
            mappedStores.map((store) => [store.id, store]),
          );

          const productsByStore =
            response.productsByStore &&
            typeof response.productsByStore === "object"
              ? response.productsByStore
              : {};
          const servicesByStore =
            response.servicesByStore &&
            typeof response.servicesByStore === "object"
              ? response.servicesByStore
              : {};

          const mappedProducts = Object.entries(productsByStore)
            .flatMap(([storeId, products]) => {
              const rawStore = rawStores.find(
                (store: any) => String(store?.id) === String(storeId),
              );
              if (!rawStore) return [];
              return (Array.isArray(products) ? products : []).map(
                (product: any) => mapCatalogProduct(rawStore, product),
              );
            })
            .filter((item) => item.id && storeById.has(item.storeId));

          const mappedServices = Object.entries(servicesByStore)
            .flatMap(([storeId, services]) => {
              const rawStore = rawStores.find(
                (store: any) => String(store?.id) === String(storeId),
              );
              if (!rawStore) return [];
              return (Array.isArray(services) ? services : []).map(
                (service: any) => mapCatalogService(rawStore, service),
              );
            })
            .filter((item) => item.id && storeById.has(item.storeId));

          setAllStores(mappedStores);
          setCatalogProducts(mappedProducts);
          setCatalogServices(mappedServices);

          await persistCatalogCache(
            mappedStores,
            mappedProducts,
            mappedServices,
          );
        } catch {
          // If fresh request fails, keep previous cached/in-memory data.
        }
      })();
    }, 120);

    return () => {
      cancelled = true;
      cancelDeferred();
    };
  }, [
    mapStoreFromApi,
    mapCatalogProduct,
    mapCatalogService,
    persistCatalogCache,
  ]);

  useEffect(() => {
    let cancelled = false;
    const cancelDeferred = runAfterInteractions(() => {
      void (async () => {
        try {
          const response = await reelApi.getReelFeed({ page: 1, limit: 50 });
          if (cancelled) return;

          const mapped = Array.isArray(response.reels)
            ? response.reels.map(mapReelFromApi)
            : [];
          setReels(mapped);
        } catch {
          if (!cancelled) setReels([]);
        }
      })();
    }, 260);

    return () => {
      cancelled = true;
      cancelDeferred();
    };
  }, [mapReelFromApi]);

  useEffect(() => {
    (async () => {
      if (!authToken) {
        setCart([]);
        setOrders([]);
        setBookedServices([]);
        return;
      }

      const [cartRes, orderRes, bookingRes] = await Promise.allSettled([
        cartApi.getCart(authToken),
        orderApi.getOrders(authToken),
        serviceBookingApi.getMyServiceBookings(authToken),
      ]);

      if (cartRes.status === "fulfilled") {
        const mappedCart = Array.isArray(cartRes.value.items)
          ? cartRes.value.items.map(mapCartItemFromApi)
          : [];
        setCart(mappedCart);
      } else {
        setCart([]);
      }

      if (orderRes.status === "fulfilled") {
        const mappedOrders = Array.isArray(orderRes.value.orders)
          ? orderRes.value.orders.map(mapOrderFromApi)
          : [];
        setOrders(mappedOrders);
      } else {
        setOrders([]);
      }

      if (bookingRes.status === "fulfilled") {
        const mappedBookings = Array.isArray(bookingRes.value.bookings)
          ? bookingRes.value.bookings.map(mapBookedServiceFromApi)
          : [];
        setBookedServices(mappedBookings);
      } else {
        setBookedServices([]);
      }
    })();
  }, [authToken, mapBookedServiceFromApi, mapCartItemFromApi, mapOrderFromApi]);

  // Load user's store when authenticated
  useEffect(() => {
    (async () => {
      if (!authUser?.id || !authToken) {
        setMyStore(null);
        return;
      }

      try {
        // First, try to get the user's store directly
        const ownerStoreResponse = await storeApi.getMyStore(authToken);
        const ownerStore = (ownerStoreResponse as any)?.store;

        if (!ownerStore) {
          setMyStore(null);
          return;
        }

        const storeId = String(ownerStore.id);
        const [inventoryRes, servicesRes, reelsRes] = await Promise.all([
          storeApi.getStoreInventory(authToken, storeId),
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

        const persistedBusinessTypes = await loadSavedBusinessTypes();
        const explicitBusinessType =
          ownerStore?.business_type ?? ownerStore?.businessType;
        const inferredBusinessType: BusinessType =
          services.length > 0 && inventoryProducts.length > 0
            ? "both"
            : services.length > 0
              ? "services"
              : inventoryProducts.length > 0
                ? "products"
                : persistedBusinessTypes[storeId] || "products";
        const businessType = isBusinessType(explicitBusinessType)
          ? explicitBusinessType
          : inferredBusinessType;

        setMyStore({
          id: storeId,
          name: String(ownerStore.store_name ?? ownerStore.name ?? "My Store"),
          category: String(ownerStore.category ?? "General"),
          businessType,
          location: String(ownerStore.location ?? ""),
          images: storeImages,
          rating: Number(ownerStore.rating ?? 0),
          followers: Number(ownerStore.followers_count ?? 0),
          products: inventoryProducts.map(mapMyStoreProduct),
          services: services.map(mapMyStoreService),
          reels: reelsData.map(mapMyStoreReel),
          createdAt: new Date(ownerStore.created_at ?? Date.now()).getTime(),
          openingTime: String(ownerStore.opening_time ?? "09:00"),
          closingTime: String(ownerStore.closing_time ?? "21:00"),
        });
      } catch {
        // No store found or error fetching it
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
    if (authToken && isUuid(String(product?.id ?? ""))) {
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
  const getLockedServiceSlots = useCallback(
    async (serviceId: string, bookingDate: string): Promise<string[]> => {
      const response = await serviceBookingApi.getLockedSlots(
        serviceId,
        bookingDate,
      );
      const slots = Array.isArray((response as any)?.slots)
        ? (response as any).slots
        : [];
      return slots
        .map((slot: any) => String(slot?.slot_label || "").trim())
        .filter(Boolean);
    },
    [],
  );

  const bookService = useCallback(
    async (service: BookedService): Promise<BookedService> => {
      if (!authToken) {
        setBookedServices((prev) => [...prev, service]);
        return service;
      }

      const { start, end } = deriveSlotWindow(
        service.bookingDate,
        service.bookingTime,
        service.duration,
      );

      const response = await serviceBookingApi.createServiceBooking(authToken, {
        serviceId: service.serviceId,
        bookingDate: String(service.bookingDate).slice(0, 10),
        slotStartAt: start.toISOString(),
        slotEndAt: end.toISOString(),
        slotLabel: service.bookingTime,
      });

      const mapped = mapBookedServiceFromApi((response as any)?.booking);
      setBookedServices((prev) => {
        const rest = prev.filter((item) => item.serviceId !== mapped.serviceId);
        return [mapped, ...rest];
      });
      return mapped;
    },
    [authToken, mapBookedServiceFromApi],
  );

  const confirmBooking = useCallback(
    async (_bookingId: string) => {
      if (!authToken) return;
      const response = await serviceBookingApi.getMyServiceBookings(authToken);
      const mappedBookings = Array.isArray(response.bookings)
        ? response.bookings.map(mapBookedServiceFromApi)
        : [];
      setBookedServices(mappedBookings);
    },
    [authToken, mapBookedServiceFromApi],
  );

  const cancelBooking = useCallback(
    async (bookingId: string) => {
      if (!authToken) {
        setBookedServices((prev) =>
          prev.filter((service) => service.id !== bookingId),
        );
        return;
      }

      await serviceBookingApi.cancelServiceBooking(authToken, bookingId);
      setBookedServices((prev) =>
        prev.filter((service) => service.id !== bookingId),
      );
    },
    [authToken],
  );

  const updateBooking = useCallback(
    async (bookingId: string, updates: Partial<BookedService>) => {
      const existing = bookedServices.find(
        (service) => service.id === bookingId,
      );
      if (!existing) return;

      const merged: BookedService = { ...existing, ...updates };
      await cancelBooking(bookingId);
      await bookService(merged);
    },
    [bookService, bookedServices, cancelBooking],
  );

  const isServiceBooked = (serviceId: string): boolean => {
    return bookedServices.some(
      (service) =>
        service.serviceId === serviceId && service.status === "confirmed",
    );
  };

  const getBookingByServiceId = (
    serviceId: string,
  ): BookedService | undefined => {
    return bookedServices.find(
      (service) =>
        service.serviceId === serviceId && service.status === "confirmed",
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
    async (order: Order) => {
      if (!authToken || order.items.length === 0) {
        throw new Error("Unable to place order.");
      }

      const firstStoreId = order.items[0]?.storeId;
      if (!firstStoreId) {
        throw new Error("Store information missing for order items.");
      }

      const hasOnlyUuidItems = order.items.every((item) => isUuid(item.id));
      const hasUuidStore = isUuid(firstStoreId);

      if (!hasOnlyUuidItems || !hasUuidStore) {
        throw new Error(
          "Some cart items are not synced with backend yet. Please add products from live stores and try again.",
        );
      }

      const response = await orderApi.placeOrder(authToken, {
        storeId: firstStoreId,
        items: order.items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        })),
        paymentMethod: "cod",
        deliveryFee: order.deliveryFee,
        deliveryAddress: order.deliveryAddress,
        deliveryPhone: order.deliveryPhone,
      });

      const created = mapOrderFromApi((response as any)?.order);
      setOrders((prev) => [
        created,
        ...prev.filter((o) => o.id !== created.id),
      ]);

      await refreshOrders();
    },
    [authToken, mapOrderFromApi, refreshOrders],
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
    async (store: MyStore): Promise<MyStore> => {
      if (!authToken) {
        throw new Error("Please login again to create your store.");
      }

      const response = await storeApi.createStore(authToken, {
        storeName: store.name,
        category: store.category,
        businessType: store.businessType,
        location: store.location,
        images: store.images,
      });

      const raw = (response as any)?.store ?? {};
      const createdStore: MyStore = {
        ...store,
        id: String(raw?.id ?? store.id),
        name: String(raw?.store_name ?? store.name),
        category: String(raw?.category ?? store.category),
        location: String(raw?.location ?? store.location),
        rating: Number(raw?.rating ?? store.rating ?? 0),
        followers: Number(raw?.followers_count ?? store.followers ?? 0),
        createdAt: raw?.created_at
          ? new Date(String(raw.created_at)).getTime()
          : Date.now(),
      };

      await saveBusinessType(createdStore.id, createdStore.businessType);

      setMyStore(createdStore);
      return createdStore;
    },
    [authToken],
  );

  const updateMyStore = useCallback(
    async (updates: Partial<MyStore>) => {
      if (!myStore?.id) {
        throw new Error("Create your store first.");
      }

      const nextName =
        updates.name !== undefined ? updates.name.trim() : myStore.name;
      const nextCategory = updates.category ?? myStore.category;
      const nextLocation =
        updates.location !== undefined
          ? updates.location.trim()
          : myStore.location;

      if (!nextName || !nextCategory || !nextLocation) {
        throw new Error("Store name, category and location are required.");
      }

      if (!authToken) {
        throw new Error("Please login again to update your store.");
      }

      const response = await storeApi.updateStore(authToken, myStore.id, {
        storeName: nextName,
        category: nextCategory,
        businessType:
          updates.businessType !== undefined
            ? updates.businessType
            : myStore.businessType,
        location: nextLocation,
      });

      const raw = (response as any)?.store ?? {};
      const nextBusinessType =
        updates.businessType !== undefined
          ? updates.businessType
          : myStore.businessType;

      if (nextBusinessType) {
        await saveBusinessType(myStore.id, nextBusinessType);
      }

      setMyStore((prev) =>
        prev
          ? {
              ...prev,
              ...updates,
              name: String(raw?.store_name ?? nextName),
              category: String(raw?.category ?? nextCategory),
              location: String(raw?.location ?? nextLocation),
              businessType: nextBusinessType,
            }
          : prev,
      );
    },
    [authToken, myStore],
  );

  const addMyProduct = useCallback(
    async (product: MyStoreProduct): Promise<MyStoreProduct> => {
      if (!authToken || !myStore?.id) {
        throw new Error("Create your store first, then add products.");
      }

      const response = await storeApi.addStoreProduct(authToken, myStore.id, {
        name: product.name,
        type: "General",
        realPrice: product.price,
        offerPrice: product.price,
        stock: product.quantity,
        description: product.description || "",
        available: product.inStock,
        images: product.images,
      });

      const raw = (response as any)?.product ?? {};
      const savedProduct: MyStoreProduct = {
        ...product,
        id: String(raw?.id ?? product.id),
      };

      setMyStore((prev) =>
        prev ? { ...prev, products: [...prev.products, savedProduct] } : prev,
      );

      return savedProduct;
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

  const removeMyProduct = useCallback(
    async (id: string) => {
      if (!authToken || !myStore?.id) {
        throw new Error("Create your store first, then manage products.");
      }

      await storeApi.removeStoreProduct(authToken, myStore.id, id);

      setMyStore((prev) =>
        prev
          ? { ...prev, products: prev.products.filter((p) => p.id !== id) }
          : prev,
      );
    },
    [authToken, myStore?.id],
  );

  const addMyService = useCallback(
    async (service: MyStoreService): Promise<MyStoreService> => {
      if (!authToken || !myStore?.id) {
        throw new Error("Create your store first, then add services.");
      }

      const response = await storeApi.addStoreService(authToken, myStore.id, {
        name: service.name,
        price: Number(service.price) || 0,
        images: Array.isArray(service.images) ? service.images : [],
        type: "General",
        availability: service.available,
        timings: service.duration,
        description: service.description,
      });

      const raw = (response as any)?.service ?? {};
      const savedService: MyStoreService = {
        ...service,
        id: String(raw?.id ?? service.id),
      };

      setMyStore((prev) =>
        prev ? { ...prev, services: [...prev.services, savedService] } : prev,
      );

      return savedService;
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

  const removeMyService = useCallback(
    async (id: string) => {
      if (!authToken || !myStore?.id) {
        throw new Error("Create your store first, then manage services.");
      }

      await storeApi.removeStoreService(authToken, myStore.id, id);

      setMyStore((prev) =>
        prev
          ? { ...prev, services: prev.services.filter((s) => s.id !== id) }
          : prev,
      );
    },
    [authToken, myStore?.id],
  );

  const removeMyStore = useCallback(
    async (ownerPin: string) => {
      if (!authToken || !myStore?.id) {
        throw new Error("No store found to delete.");
      }

      await storeApi.removeStore(authToken, myStore.id, ownerPin);
      setMyStore(null);
    },
    [authToken, myStore?.id],
  );

  const addMyReel = useCallback(
    async (reel: MyStoreReel): Promise<MyStoreReel> => {
      if (!authToken || !myStore?.id) {
        throw new Error("Create your store first, then add reels.");
      }

      const response = await reelApi.createStoreReel(authToken, myStore.id, {
        videoUrl: reel.videoUrl,
        description: reel.caption,
      });

      const raw = (response as any)?.reel ?? {};
      const savedReel: MyStoreReel = {
        ...reel,
        id: String(raw?.id ?? reel.id),
        createdAt: raw?.created_at
          ? new Date(String(raw.created_at)).getTime()
          : reel.createdAt,
      };

      setMyStore((prev) =>
        prev ? { ...prev, reels: [savedReel, ...prev.reels] } : prev,
      );

      return savedReel;
    },
    [authToken, myStore?.id],
  );

  const removeMyReel = useCallback((id: string) => {
    setMyStore((prev) =>
      prev ? { ...prev, reels: prev.reels.filter((r) => r.id !== id) } : prev,
    );
  }, []);

  const updateStoreHours = useCallback(
    async (
      schedule: Array<{
        dayOfWeek: string;
        openingTime?: string;
        closingTime?: string;
        isClosed?: boolean;
      }>,
    ) => {
      if (!authToken || !myStore?.id) {
        throw new Error("Create your store first.");
      }

      await storeApi.updateStoreHours(authToken, myStore.id, schedule);

      const firstOpenDay = schedule.find((item) => !item?.isClosed);
      setMyStore((prev) =>
        prev
          ? {
              ...prev,
              openingTime:
                firstOpenDay?.openingTime || prev.openingTime || "09:00",
              closingTime:
                firstOpenDay?.closingTime || prev.closingTime || "21:00",
            }
          : prev,
      );
    },
    [authToken, myStore?.id],
  );

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
      getLockedServiceSlots,
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
      refreshOrders,
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
      removeMyStore,
      addMyReel,
      removeMyReel,
      updateStoreHours,
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
