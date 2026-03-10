// src/assets/mockData.ts
export interface Store {
  id: string;
  name: string;
  type: string;
  followers: string;
  rating: number;
  distance: string;
  image: string; // Main image for backward compatibility
  images?: string[]; // Multiple images (up to 5) for carousel
}

export const mockStores: Store[] = [
  {
    id: "1",
    name: "Organic Farms",
    type: "Grocery",
    followers: "1.2k",
    rating: 4.8,
    distance: "0.4 km",
    image: "https://picsum.photos/seed/shop1/400/300",
    images: [
      "https://picsum.photos/seed/shop1/400/300",
      "https://picsum.photos/seed/shop1a/400/300",
      "https://picsum.photos/seed/shop1b/400/300",
      "https://picsum.photos/seed/shop1c/400/300",
    ],
  },
  {
    id: "2",
    name: "LifeCare Pharma",
    type: "Medical",
    followers: "850",
    rating: 4.5,
    distance: "0.8 km",
    image: "https://picsum.photos/seed/shop2/400/300",
    images: [
      "https://picsum.photos/seed/shop2/400/300",
      "https://picsum.photos/seed/shop2a/400/300",
      "https://picsum.photos/seed/shop2b/400/300",
    ],
  },
  {
    id: "3",
    name: "Stitch & Style",
    type: "Tailor",
    followers: "500",
    rating: 4.2,
    distance: "1.1 km",
    image: "https://picsum.photos/seed/shop3/400/300",
    images: [
      "https://picsum.photos/seed/shop3/400/300",
      "https://picsum.photos/seed/shop3a/400/300",
      "https://picsum.photos/seed/shop3b/400/300",
      "https://picsum.photos/seed/shop3c/400/300",
      "https://picsum.photos/seed/shop3d/400/300",
    ],
  },
  {
    id: "4",
    name: "Pizza Palace",
    type: "Pizza",
    followers: "2.5k",
    rating: 4.9,
    distance: "0.3 km",
    image: "https://picsum.photos/seed/shop4/400/300",
    images: [
      "https://picsum.photos/seed/shop4/400/300",
      "https://picsum.photos/seed/shop4a/400/300",
      "https://picsum.photos/seed/shop4b/400/300",
    ],
  },
  {
    id: "5",
    name: "Auto Masters",
    type: "Mechanical",
    followers: "1.1k",
    rating: 4.6,
    distance: "2.5 km",
    image: "https://picsum.photos/seed/shop5/400/300",
    images: [
      "https://picsum.photos/seed/shop5/400/300",
      "https://picsum.photos/seed/shop5a/400/300",
      "https://picsum.photos/seed/shop5b/400/300",
      "https://picsum.photos/seed/shop5c/400/300",
    ],
  },
  {
    id: "6",
    name: "Glow Up Studio",
    type: "Makeup",
    followers: "3.2k",
    rating: 4.7,
    distance: "0.6 km",
    image: "https://picsum.photos/seed/shop6/400/300",
    images: [
      "https://picsum.photos/seed/shop6/400/300",
      "https://picsum.photos/seed/shop6a/400/300",
      "https://picsum.photos/seed/shop6b/400/300",
      "https://picsum.photos/seed/shop6c/400/300",
    ],
  },
  {
    id: "7",
    name: "The Book Nook",
    type: "Book Depot",
    followers: "900",
    rating: 4.4,
    distance: "1.5 km",
    image: "https://picsum.photos/seed/shop7/400/300",
    images: [
      "https://picsum.photos/seed/shop7/400/300",
      "https://picsum.photos/seed/shop7a/400/300",
      "https://picsum.photos/seed/shop7b/400/300",
    ],
  },
  {
    id: "8",
    name: "Fresh Greens",
    type: "Sabji",
    followers: "1.5k",
    rating: 4.3,
    distance: "0.2 km",
    image: "https://picsum.photos/seed/shop8/400/300",
    images: [
      "https://picsum.photos/seed/shop8/400/300",
      "https://picsum.photos/seed/shop8a/400/300",
      "https://picsum.photos/seed/shop8b/400/300",
      "https://picsum.photos/seed/shop8c/400/300",
    ],
  },
  {
    id: "9",
    name: "Iron & Fire",
    type: "Welding",
    followers: "300",
    rating: 4.0,
    distance: "3.2 km",
    image: "https://picsum.photos/seed/shop9/400/300",
    images: [
      "https://picsum.photos/seed/shop9/400/300",
      "https://picsum.photos/seed/shop9a/400/300",
      "https://picsum.photos/seed/shop9b/400/300",
    ],
  },
  {
    id: "10",
    name: "Royal Furniture",
    type: "Furniture",
    followers: "2.1k",
    rating: 4.8,
    distance: "2.1 km",
    image: "https://picsum.photos/seed/shop10/400/300",
    images: [
      "https://picsum.photos/seed/shop10/400/300",
      "https://picsum.photos/seed/shop10a/400/300",
      "https://picsum.photos/seed/shop10b/400/300",
      "https://picsum.photos/seed/shop10c/400/300",
      "https://picsum.photos/seed/shop10d/400/300",
    ],
  },
  {
    id: "11",
    name: "Modern Sari House",
    type: "Sari",
    followers: "4.5k",
    rating: 4.9,
    distance: "0.9 km",
    image: "https://picsum.photos/seed/shop11/400/300",
    images: [
      "https://picsum.photos/seed/shop11/400/300",
      "https://picsum.photos/seed/shop11a/400/300",
      "https://picsum.photos/seed/shop11b/400/300",
      "https://picsum.photos/seed/shop11c/400/300",
    ],
  },
  {
    id: "12",
    name: "Petal Pushers",
    type: "Garden",
    followers: "1.2k",
    rating: 4.6,
    distance: "1.8 km",
    image: "https://picsum.photos/seed/shop12/400/300",
    images: [
      "https://picsum.photos/seed/shop12/400/300",
      "https://picsum.photos/seed/shop12a/400/300",
      "https://picsum.photos/seed/shop12b/400/300",
    ],
  },
  {
    id: "13",
    name: "The Gym Box",
    type: "Gym",
    followers: "5.6k",
    rating: 4.7,
    distance: "0.5 km",
    image: "https://picsum.photos/seed/shop13/400/300",
    images: [
      "https://picsum.photos/seed/shop13/400/300",
      "https://picsum.photos/seed/shop13a/400/300",
      "https://picsum.photos/seed/shop13b/400/300",
      "https://picsum.photos/seed/shop13c/400/300",
    ],
  },
  {
    id: "14",
    name: "City Car Wash",
    type: "Car Wash",
    followers: "700",
    rating: 4.3,
    distance: "2.8 km",
    image: "https://picsum.photos/seed/shop14/400/300",
    images: [
      "https://picsum.photos/seed/shop14/400/300",
      "https://picsum.photos/seed/shop14a/400/300",
      "https://picsum.photos/seed/shop14b/400/300",
    ],
  },
  {
    id: "15",
    name: "Dhaba Express",
    type: "Dhaba",
    followers: "3.8k",
    rating: 4.5,
    distance: "4.2 km",
    image: "https://picsum.photos/seed/shop15/400/300",
    images: [
      "https://picsum.photos/seed/shop15/400/300",
      "https://picsum.photos/seed/shop15a/400/300",
      "https://picsum.photos/seed/shop15b/400/300",
      "https://picsum.photos/seed/shop15c/400/300",
    ],
  },
  {
    id: "16",
    name: "Vision Optics",
    type: "Specs",
    followers: "1.4k",
    rating: 4.4,
    distance: "1.2 km",
    image: "https://picsum.photos/seed/shop16/400/300",
    images: [
      "https://picsum.photos/seed/shop16/400/300",
      "https://picsum.photos/seed/shop16a/400/300",
      "https://picsum.photos/seed/shop16b/400/300",
    ],
  },
  {
    id: "17",
    name: "Toy World",
    type: "Toy",
    followers: "2.2k",
    rating: 4.7,
    distance: "1.6 km",
    image: "https://picsum.photos/seed/shop17/400/300",
    images: [
      "https://picsum.photos/seed/shop17/400/300",
      "https://picsum.photos/seed/shop17a/400/300",
      "https://picsum.photos/seed/shop17b/400/300",
      "https://picsum.photos/seed/shop17c/400/300",
    ],
  },
  {
    id: "18",
    name: "Glitters Gold",
    type: "Gold/Silver",
    followers: "8.2k",
    rating: 5.0,
    distance: "0.7 km",
    image: "https://picsum.photos/seed/shop18/400/300",
    images: [
      "https://picsum.photos/seed/shop18/400/300",
      "https://picsum.photos/seed/shop18a/400/300",
      "https://picsum.photos/seed/shop18b/400/300",
      "https://picsum.photos/seed/shop18c/400/300",
    ],
  },
  {
    id: "19",
    name: "Travel Tunes",
    type: "Travel",
    followers: "1.1k",
    rating: 4.1,
    distance: "2.3 km",
    image: "https://picsum.photos/seed/shop19/400/300",
    images: [
      "https://picsum.photos/seed/shop19/400/300",
      "https://picsum.photos/seed/shop19a/400/300",
      "https://picsum.photos/seed/shop19b/400/300",
    ],
  },
  {
    id: "20",
    name: "Daily Dairy",
    type: "Milk",
    followers: "1.9k",
    rating: 4.6,
    distance: "0.3 km",
    image: "https://picsum.photos/seed/shop20/400/300",
    images: [
      "https://picsum.photos/seed/shop20/400/300",
      "https://picsum.photos/seed/shop20a/400/300",
      "https://picsum.photos/seed/shop20b/400/300",
      "https://picsum.photos/seed/shop20c/400/300",
    ],
  },
];

export const STORE_TYPES = [
  "Grocery",
  "Medical",
  "Tailor",
  "Mechanical",
  "Property",
  "Phone",
  "Photo",
  "Makeup",
  "Book Depot",
  "Electric",
  "Welding",
  "Chicken",
  "Pizza",
  "Bag",
  "Light",
  "Sabji",
  "Clothes",
  "Specs",
  "Sari",
  "Carpet",
  "Paint",
  "Glass",
  "Shoes",
  "Charpi",
  "Mandir",
  "Furniture",
  "Motor",
  "Band",
  "Repair",
  "ATM",
  "Fish",
  "Garden",
  "Tyre",
  "Pan",
  "Sewing Machine",
  "Dhaba",
  "Teeth",
  "Cosmetic",
  "Travel",
  "Milk",
  "Parking",
  "Steel",
  "Car Wash",
  "Toy",
  "Battery",
  "Saloon",
  "Car Repair",
  "Gold/Silver",
  "Gym",
];

// === PRODUCT CATEGORIES & MOCK PRODUCTS ===
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images?: string[]; // 1-5 product photos for gallery
  description?: string;
  storeId: string;
  storeName: string;
  rating: number;
  reviews: number;
  distance: string;
  inStock: boolean;
  isSubscription?: boolean; // For flash deals - subscription store products
  unit?: string;
  delivery?: string;
}

export const PRODUCT_CATEGORIES = [
  { id: "all", name: "All", icon: "🛒", color: "#6366f1" },
  { id: "vegetables", name: "Vegetables", icon: "🥬", color: "#4ade80" },
  { id: "fruits", name: "Fruits", icon: "🍎", color: "#fb923c" },
  { id: "dairy", name: "Dairy", icon: "🥛", color: "#60a5fa" },
  { id: "electronics", name: "Electronics", icon: "📱", color: "#3b82f6" },
  { id: "salon", name: "Salon", icon: "💇", color: "#f97316" },
  { id: "beauty", name: "Beauty", icon: "💄", color: "#db2777" },
  { id: "stationery", name: "Stationery", icon: "📝", color: "#f59e0b" },
  { id: "toys", name: "Toys", icon: "🧸", color: "#10b981" },
  { id: "garments", name: "Garments", icon: "👕", color: "#8b5cf6" },
  { id: "carpenter", name: "Carpenter", icon: "🪵", color: "#a16207" },
  { id: "architecture", name: "Architecture", icon: "🏗️", color: "#475569" },
  { id: "grocery", name: "Grocery", icon: "🛍️", color: "#16a34a" },
  { id: "medical", name: "Medical", icon: "💊", color: "#dc2626" },
  { id: "bakery", name: "Bakery", icon: "🍞", color: "#a78bfa" },
  { id: "meat", name: "Meat & Fish", icon: "🍗", color: "#f87171" },
  { id: "snacks", name: "Snacks", icon: "🍿", color: "#fbbf24" },
  { id: "beverages", name: "Beverages", icon: "🥤", color: "#f472b6" },
  { id: "furniture", name: "Furniture", icon: "🪑", color: "#92400e" },
  { id: "jewelry", name: "Jewelry", icon: "💍", color: "#eab308" },
];

export const mockProducts: Product[] = [
  // Vegetables
  {
    id: "p1",
    name: "Fresh Tomatoes",
    category: "vegetables",
    price: 30,
    originalPrice: 40,
    discount: 25,
    image:
      "https://images.unsplash.com/photo-1546470427-227e933ac3bb?q=80&w=300",
    images: [
      "https://images.unsplash.com/photo-1546470427-227e933ac3bb?q=80&w=500",
      "https://images.unsplash.com/photo-1649620407859-bfa6aba76e4f?q=80&w=500",
      "https://images.unsplash.com/photo-1592063786241-8b7c1fe79f17?q=80&w=500",
      "https://images.unsplash.com/photo-1558818498-28c1e002b655?q=80&w=500",
    ],
    description:
      "Fresh, organic tomatoes sourced directly from local farmers. Rich in lycopene and vitamin C. Perfect for salads, cooking, or making juices. Hand-picked to ensure quality and freshness.",
    storeId: "1",
    storeName: "Organic Farms",
    rating: 4.5,
    reviews: 128,
    distance: "0.4 km",
    inStock: true,
    isSubscription: true,
    unit: "1 kg",
    delivery: "10-15 min",
  },
  {
    id: "p2",
    name: "Green Capsicum",
    category: "vegetables",
    price: 45,
    originalPrice: 55,
    discount: 18,
    image:
      "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?q=80&w=300",
    images: [
      "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?q=80&w=500",
      "https://images.unsplash.com/photo-1592063786241-8b7c1fe79f17?q=80&w=500",
    ],
    description:
      "Crisp and fresh green capsicums perfect for stir-fry, salads, and stuffed recipes. Rich in vitamin C and antioxidants.",
    storeId: "1",
    storeName: "Organic Farms",
    rating: 4.3,
    reviews: 87,
    distance: "0.4 km",
    inStock: true,
    unit: "500 g",
    delivery: "10-15 min",
  },
  {
    id: "p3",
    name: "Fresh Spinach",
    category: "vegetables",
    price: 25,
    originalPrice: 30,
    discount: 17,
    image:
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=300",
    storeId: "8",
    storeName: "Fresh Greens",
    rating: 4.6,
    reviews: 215,
    distance: "0.2 km",
    inStock: true,
    isSubscription: true,
    unit: "1 bundle",
  },
  {
    id: "p4",
    name: "Potatoes",
    category: "vegetables",
    price: 35,
    originalPrice: 40,
    discount: 13,
    image:
      "https://images.unsplash.com/photo-1518977676601-b53f82ber6e7?q=80&w=300",
    storeId: "8",
    storeName: "Fresh Greens",
    rating: 4.2,
    reviews: 342,
    distance: "0.2 km",
    inStock: true,
    unit: "1 kg",
  },
  {
    id: "p5",
    name: "Onions",
    category: "vegetables",
    price: 40,
    image:
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=300",
    storeId: "1",
    storeName: "Organic Farms",
    rating: 4.1,
    reviews: 198,
    distance: "0.4 km",
    inStock: true,
    unit: "1 kg",
  },
  // Fruits
  {
    id: "p6",
    name: "Royal Gala Apples",
    category: "fruits",
    price: 180,
    originalPrice: 220,
    discount: 18,
    image:
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=300",
    images: [
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=500",
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?q=80&w=500",
      "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?q=80&w=500",
      "https://images.unsplash.com/photo-1584306670957-acf935f5033c?q=80&w=500",
      "https://images.unsplash.com/photo-1576179635662-9d1983e97e1e?q=80&w=500",
    ],
    description:
      "Premium Royal Gala apples, sweet and crisp. Imported quality with perfect crunch. Great for snacking, juicing, or baking. Packed with fiber and nutrients.",
    storeId: "1",
    storeName: "Organic Farms",
    rating: 4.7,
    reviews: 156,
    distance: "0.4 km",
    inStock: true,
    isSubscription: true,
    unit: "1 kg",
    delivery: "10-15 min",
  },
  {
    id: "p7",
    name: "Bananas",
    category: "fruits",
    price: 50,
    image:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=300",
    storeId: "8",
    storeName: "Fresh Greens",
    rating: 4.4,
    reviews: 289,
    distance: "0.2 km",
    inStock: true,
    unit: "1 dozen",
  },
  {
    id: "p8",
    name: "Fresh Mangoes",
    category: "fruits",
    price: 300,
    originalPrice: 400,
    discount: 25,
    image:
      "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=300",
    storeId: "1",
    storeName: "Organic Farms",
    rating: 4.9,
    reviews: 456,
    distance: "0.4 km",
    inStock: true,
    isSubscription: true,
    unit: "1 kg",
  },
  {
    id: "p9",
    name: "Pomegranate",
    category: "fruits",
    price: 120,
    image:
      "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=300",
    storeId: "8",
    storeName: "Fresh Greens",
    rating: 4.3,
    reviews: 98,
    distance: "0.2 km",
    inStock: true,
    unit: "500 g",
  },
  // Dairy
  {
    id: "p10",
    name: "Fresh Milk",
    category: "dairy",
    price: 50,
    originalPrice: 60,
    discount: 17,
    image:
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=300",
    images: [
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=500",
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=500",
      "https://images.unsplash.com/photo-1523473827533-2a64d0d36748?q=80&w=500",
    ],
    description:
      "Farm-fresh whole milk delivered daily. Rich in calcium and protein. Sourced from healthy, grass-fed cows with no added preservatives.",
    storeId: "20",
    storeName: "Daily Dairy",
    rating: 4.8,
    reviews: 567,
    distance: "0.3 km",
    inStock: true,
    isSubscription: true,
    unit: "1 L",
    delivery: "8-12 min",
  },
  {
    id: "p11",
    name: "Paneer",
    category: "dairy",
    price: 90,
    originalPrice: 110,
    discount: 18,
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=300",
    storeId: "20",
    storeName: "Daily Dairy",
    rating: 4.6,
    reviews: 234,
    distance: "0.3 km",
    inStock: true,
    isSubscription: true,
    unit: "250 g",
  },
  {
    id: "p12",
    name: "Curd",
    category: "dairy",
    price: 40,
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=300",
    storeId: "20",
    storeName: "Daily Dairy",
    rating: 4.5,
    reviews: 189,
    distance: "0.3 km",
    inStock: true,
    unit: "500 g",
  },
  // Electronics
  {
    id: "p13",
    name: "Wireless Earbuds",
    category: "electronics",
    price: 1299,
    originalPrice: 1999,
    discount: 35,
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?q=80&w=300",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?q=80&w=500",
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?q=80&w=500",
      "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?q=80&w=500",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500",
    ],
    description:
      "Premium wireless earbuds with active noise cancellation. 24-hour battery life with charging case. IPX5 waterproof rating. Crystal clear audio quality.",
    storeId: "5",
    storeName: "Auto Masters",
    rating: 4.4,
    reviews: 89,
    distance: "2.5 km",
    inStock: true,
    isSubscription: false,
    delivery: "20-30 min",
  },
  {
    id: "p14",
    name: "Phone Charger 65W",
    category: "electronics",
    price: 799,
    originalPrice: 1200,
    discount: 33,
    image:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=300",
    storeId: "5",
    storeName: "Auto Masters",
    rating: 4.2,
    reviews: 145,
    distance: "2.5 km",
    inStock: true,
  },
  {
    id: "p15",
    name: "LED Bulb Pack",
    category: "electronics",
    price: 350,
    originalPrice: 500,
    discount: 30,
    image:
      "https://images.unsplash.com/photo-1532007397942-63db63dc92a2?q=80&w=300",
    storeId: "5",
    storeName: "Auto Masters",
    rating: 4.6,
    reviews: 67,
    distance: "2.5 km",
    inStock: true,
    isSubscription: true,
  },
  // Beauty
  {
    id: "p16",
    name: "Face Cream SPF 50",
    category: "beauty",
    price: 450,
    originalPrice: 599,
    discount: 25,
    image:
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=300",
    storeId: "6",
    storeName: "Glow Up Studio",
    rating: 4.7,
    reviews: 312,
    distance: "0.6 km",
    inStock: true,
    isSubscription: true,
  },
  {
    id: "p17",
    name: "Hair Serum",
    category: "beauty",
    price: 350,
    image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=300",
    storeId: "6",
    storeName: "Glow Up Studio",
    rating: 4.5,
    reviews: 178,
    distance: "0.6 km",
    inStock: true,
  },
  // Garments
  {
    id: "p18",
    name: "Cotton Kurta Set",
    category: "garments",
    price: 899,
    originalPrice: 1299,
    discount: 31,
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=300",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=500",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=500",
      "https://images.unsplash.com/photo-1583391733981-8b530c47db44?q=80&w=500",
    ],
    description:
      "Premium cotton kurta set with beautiful embroidery. Comfortable fit for all occasions. Available in multiple sizes. Machine washable fabric.",
    storeId: "11",
    storeName: "Modern Sari House",
    rating: 4.8,
    reviews: 234,
    distance: "0.9 km",
    inStock: true,
    isSubscription: true,
    delivery: "15-25 min",
  },
  {
    id: "p19",
    name: "Designer Saree",
    category: "garments",
    price: 4500,
    originalPrice: 6000,
    discount: 25,
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=300",
    storeId: "11",
    storeName: "Modern Sari House",
    rating: 4.9,
    reviews: 456,
    distance: "0.9 km",
    inStock: true,
  },
  // Stationery
  {
    id: "p20",
    name: "Notebook Set (5 pcs)",
    category: "stationery",
    price: 150,
    originalPrice: 200,
    discount: 25,
    image:
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=300",
    storeId: "7",
    storeName: "The Book Nook",
    rating: 4.3,
    reviews: 67,
    distance: "1.5 km",
    inStock: true,
    isSubscription: true,
  },
  {
    id: "p21",
    name: "Art Supplies Kit",
    category: "stationery",
    price: 450,
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=300",
    storeId: "7",
    storeName: "The Book Nook",
    rating: 4.6,
    reviews: 45,
    distance: "1.5 km",
    inStock: true,
  },
  // Toys
  {
    id: "p22",
    name: "Building Blocks Set",
    category: "toys",
    price: 599,
    originalPrice: 899,
    discount: 33,
    image:
      "https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?q=80&w=300",
    storeId: "17",
    storeName: "Toy World",
    rating: 4.7,
    reviews: 189,
    distance: "1.6 km",
    inStock: true,
    isSubscription: true,
  },
  {
    id: "p23",
    name: "Remote Control Car",
    category: "toys",
    price: 1200,
    originalPrice: 1800,
    discount: 33,
    image:
      "https://images.unsplash.com/photo-1581235707960-e7edaaf078cf?q=80&w=300",
    storeId: "17",
    storeName: "Toy World",
    rating: 4.5,
    reviews: 123,
    distance: "1.6 km",
    inStock: true,
  },
  // Salon (Services)
  {
    id: "p24",
    name: "Men's Haircut",
    category: "salon",
    price: 200,
    originalPrice: 300,
    discount: 33,
    image:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=300",
    storeId: "6",
    storeName: "Glow Up Studio",
    rating: 4.6,
    reviews: 567,
    distance: "0.6 km",
    inStock: true,
    isSubscription: true,
  },
  {
    id: "p25",
    name: "Bridal Makeup",
    category: "salon",
    price: 5000,
    originalPrice: 7000,
    discount: 29,
    image:
      "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?q=80&w=300",
    storeId: "6",
    storeName: "Glow Up Studio",
    rating: 4.9,
    reviews: 345,
    distance: "0.6 km",
    inStock: true,
  },
  // Grocery
  {
    id: "p26",
    name: "Basmati Rice 5kg",
    category: "grocery",
    price: 450,
    originalPrice: 550,
    discount: 18,
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=300",
    storeId: "1",
    storeName: "Organic Farms",
    rating: 4.7,
    reviews: 890,
    distance: "0.4 km",
    inStock: true,
    isSubscription: true,
    unit: "5 kg",
  },
  {
    id: "p27",
    name: "Toor Dal",
    category: "grocery",
    price: 160,
    image:
      "https://images.unsplash.com/photo-1585996068104-0d1a49d0256c?q=80&w=300",
    storeId: "1",
    storeName: "Organic Farms",
    rating: 4.4,
    reviews: 345,
    distance: "0.4 km",
    inStock: true,
    unit: "1 kg",
  },
  // Medical
  {
    id: "p28",
    name: "First Aid Kit",
    category: "medical",
    price: 599,
    originalPrice: 799,
    discount: 25,
    image:
      "https://images.unsplash.com/photo-1603398938378-e54eab446dde?q=80&w=300",
    storeId: "2",
    storeName: "LifeCare Pharma",
    rating: 4.8,
    reviews: 234,
    distance: "0.8 km",
    inStock: true,
    isSubscription: true,
  },
  {
    id: "p29",
    name: "Digital Thermometer",
    category: "medical",
    price: 250,
    image:
      "https://images.unsplash.com/photo-1584308666544-8b5fc6e4de04?q=80&w=300",
    storeId: "2",
    storeName: "LifeCare Pharma",
    rating: 4.5,
    reviews: 156,
    distance: "0.8 km",
    inStock: true,
  },
  // Furniture
  {
    id: "p30",
    name: "Wooden Bookshelf",
    category: "furniture",
    price: 3500,
    originalPrice: 4500,
    discount: 22,
    image:
      "https://images.unsplash.com/photo-1594620302200-9a762244a156?q=80&w=300",
    storeId: "10",
    storeName: "Royal Furniture",
    rating: 4.8,
    reviews: 89,
    distance: "2.1 km",
    inStock: true,
    isSubscription: true,
  },
  {
    id: "p31",
    name: "Office Chair",
    category: "furniture",
    price: 5999,
    originalPrice: 7999,
    discount: 25,
    image:
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?q=80&w=300",
    storeId: "10",
    storeName: "Royal Furniture",
    rating: 4.6,
    reviews: 67,
    distance: "2.1 km",
    inStock: true,
  },
  // Jewelry
  {
    id: "p32",
    name: "Gold Jhumka Earrings",
    category: "jewelry",
    price: 12000,
    originalPrice: 15000,
    discount: 20,
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=300",
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=500",
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=500",
      "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=500",
      "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=500",
      "https://images.unsplash.com/photo-1515562141589-67f0d4e2f0f1?q=80&w=500",
    ],
    description:
      "Exquisite handcrafted gold jhumka earrings with intricate design. 22K gold with traditional craftsmanship. Perfect for weddings and festive occasions. Hallmarked and certified.",
    storeId: "18",
    storeName: "Glitters Gold",
    rating: 5.0,
    reviews: 678,
    distance: "0.7 km",
    inStock: true,
    isSubscription: true,
    delivery: "Same day",
  },
  {
    id: "p33",
    name: "Silver Anklet",
    category: "jewelry",
    price: 1500,
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=300",
    storeId: "18",
    storeName: "Glitters Gold",
    rating: 4.8,
    reviews: 234,
    distance: "0.7 km",
    inStock: true,
  },
  // Bakery
  {
    id: "p34",
    name: "Chocolate Cake",
    category: "bakery",
    price: 450,
    originalPrice: 550,
    discount: 18,
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=300",
    storeId: "4",
    storeName: "Pizza Palace",
    rating: 4.8,
    reviews: 345,
    distance: "0.3 km",
    inStock: true,
    isSubscription: true,
  },
  {
    id: "p35",
    name: "Fresh Bread Loaf",
    category: "bakery",
    price: 45,
    image:
      "https://images.unsplash.com/photo-1549931319-a545753b77a3?q=80&w=300",
    storeId: "4",
    storeName: "Pizza Palace",
    rating: 4.5,
    reviews: 234,
    distance: "0.3 km",
    inStock: true,
    unit: "1 pc",
  },
  // Snacks
  {
    id: "p36",
    name: "Samosa Pack (6 pcs)",
    category: "snacks",
    price: 60,
    originalPrice: 80,
    discount: 25,
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=300",
    storeId: "15",
    storeName: "Dhaba Express",
    rating: 4.7,
    reviews: 567,
    distance: "4.2 km",
    inStock: true,
    isSubscription: true,
  },
  {
    id: "p37",
    name: "Namkeen Mix",
    category: "snacks",
    price: 80,
    image:
      "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?q=80&w=300",
    storeId: "15",
    storeName: "Dhaba Express",
    rating: 4.4,
    reviews: 234,
    distance: "4.2 km",
    inStock: true,
    unit: "500 g",
  },
  // Carpenter
  {
    id: "p38",
    name: "Custom Wooden Door",
    category: "carpenter",
    price: 8000,
    originalPrice: 10000,
    discount: 20,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=300",
    storeId: "10",
    storeName: "Royal Furniture",
    rating: 4.7,
    reviews: 45,
    distance: "2.1 km",
    inStock: true,
  },
  {
    id: "p39",
    name: "Wooden Table",
    category: "carpenter",
    price: 4500,
    image:
      "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?q=80&w=300",
    storeId: "10",
    storeName: "Royal Furniture",
    rating: 4.5,
    reviews: 34,
    distance: "2.1 km",
    inStock: true,
  },
  // Beverages
  {
    id: "p40",
    name: "Premium Coffee Pack",
    category: "beverages",
    price: 450,
    originalPrice: 600,
    discount: 25,
    image:
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=300",
    storeId: "15",
    storeName: "Dhaba Express",
    rating: 4.6,
    reviews: 189,
    distance: "4.2 km",
    inStock: true,
    isSubscription: true,
  },
  {
    id: "p41",
    name: "Masala Chai Pack",
    category: "beverages",
    price: 120,
    image:
      "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=300",
    storeId: "15",
    storeName: "Dhaba Express",
    rating: 4.8,
    reviews: 678,
    distance: "4.2 km",
    inStock: true,
    unit: "250 g",
  },
  // Meat & Fish
  {
    id: "p42",
    name: "Chicken Breast",
    category: "meat",
    price: 280,
    originalPrice: 350,
    discount: 20,
    image:
      "https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=300",
    storeId: "15",
    storeName: "Dhaba Express",
    rating: 4.5,
    reviews: 234,
    distance: "4.2 km",
    inStock: true,
    isSubscription: true,
    unit: "1 kg",
  },
  {
    id: "p43",
    name: "Fresh Fish Rohu",
    category: "meat",
    price: 350,
    image:
      "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=300",
    storeId: "15",
    storeName: "Dhaba Express",
    rating: 4.3,
    reviews: 123,
    distance: "4.2 km",
    inStock: true,
    unit: "1 kg",
  },
];

// === SERVICE CATEGORIES & MOCK SERVICES ===
export const SERVICE_CATEGORY_IDS = ["salon", "carpenter", "architecture"];

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images?: string[];
  description?: string;
  active: boolean;
  duration?: string;
  delivery?: string;
  rating: number;
  reviewsCount: number;
  storeId: string;
  storeName: string;
  distance: string;
  features?: string[];
  isSubscription?: boolean;
}

export const SERVICE_CATEGORIES = [
  { id: "all", name: "All", icon: "🔧", color: "#6366f1" },
  { id: "salon", name: "Salon & Beauty", icon: "💇", color: "#f97316" },
  { id: "carpenter", name: "Carpentry", icon: "🪵", color: "#a16207" },
  { id: "architecture", name: "Architecture", icon: "🏗️", color: "#475569" },
  { id: "repair", name: "Repair", icon: "🔧", color: "#3b82f6" },
  { id: "cleaning", name: "Cleaning", icon: "🧹", color: "#10b981" },
  { id: "delivery", name: "Delivery", icon: "🚚", color: "#8b5cf6" },
];

export const mockServices: ServiceItem[] = [
  // Salon & Beauty
  {
    id: "s1",
    name: "Men's Haircut",
    category: "salon",
    price: 200,
    originalPrice: 300,
    discount: 33,
    image:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=300",
    images: [
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=500",
      "https://images.unsplash.com/photo-1585747860019-f3ded18839e1?q=80&w=500",
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=500",
    ],
    description:
      "Professional men's haircut by experienced barbers. Includes hair wash, styling, and grooming consultation. Walk-ins welcome. All age groups served.",
    active: true,
    duration: "30 min",
    delivery: "Walk-in",
    rating: 4.6,
    reviewsCount: 567,
    storeId: "6",
    storeName: "Glow Up Studio",
    distance: "0.6 km",
    features: [
      "Professional barbers",
      "Hair wash included",
      "Styling consultation",
      "Walk-ins welcome",
    ],
    isSubscription: true,
  },
  {
    id: "s2",
    name: "Bridal Makeup",
    category: "salon",
    price: 5000,
    originalPrice: 7000,
    discount: 29,
    image:
      "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?q=80&w=300",
    images: [
      "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?q=80&w=500",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=500",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=500",
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?q=80&w=500",
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=500",
    ],
    description:
      "Complete bridal makeup package including base, eyes, lips, hair styling, and touch-up kit. Premium international products used. Trial session available separately.",
    active: true,
    duration: "3-4 hrs",
    delivery: "Home visit",
    rating: 4.9,
    reviewsCount: 345,
    storeId: "6",
    storeName: "Glow Up Studio",
    distance: "0.6 km",
    features: [
      "HD/Airbrush makeup",
      "Hair styling included",
      "Touch-up kit",
      "Premium products",
      "Home visit available",
    ],
    isSubscription: true,
  },
  {
    id: "s3",
    name: "Facial & Cleanup",
    category: "salon",
    price: 700,
    originalPrice: 1000,
    discount: 30,
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=300",
    images: [
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=500",
      "https://images.unsplash.com/photo-1552693673-1bf958298935?q=80&w=500",
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=500",
    ],
    description:
      "Deep cleansing facial with exfoliation, steaming, and hydrating mask. Suitable for all skin types. Relaxing experience with visible results.",
    active: true,
    duration: "45 min",
    delivery: "Walk-in",
    rating: 4.7,
    reviewsCount: 412,
    storeId: "6",
    storeName: "Glow Up Studio",
    distance: "0.6 km",
    features: [
      "Deep cleansing",
      "Exfoliation & steaming",
      "Hydrating mask",
      "All skin types",
    ],
    isSubscription: true,
  },
  {
    id: "s4",
    name: "Hair Coloring",
    category: "salon",
    price: 1500,
    originalPrice: 2200,
    discount: 32,
    image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=300",
    images: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=500",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=500",
    ],
    description:
      "Professional hair coloring with premium ammonia-free products. Global and highlight options available. Includes post-color treatment.",
    active: true,
    duration: "1.5-2 hrs",
    delivery: "Walk-in",
    rating: 4.5,
    reviewsCount: 289,
    storeId: "6",
    storeName: "Glow Up Studio",
    distance: "0.6 km",
    features: [
      "Ammonia-free colors",
      "Global & highlights",
      "Post-color treatment",
      "Color consultation",
    ],
    isSubscription: true,
  },
  // Carpentry
  {
    id: "s5",
    name: "Custom Wooden Door",
    category: "carpenter",
    price: 8000,
    originalPrice: 10000,
    discount: 20,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=300",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=500",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=500",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=500",
      "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?q=80&w=500",
    ],
    description:
      "Custom-made wooden doors with premium teak or sheesham wood. Includes design consultation, crafting, polishing, and home installation. Warranty included.",
    active: true,
    duration: "5-7 days",
    delivery: "Home install",
    rating: 4.7,
    reviewsCount: 45,
    storeId: "10",
    storeName: "Royal Furniture",
    distance: "2.1 km",
    features: [
      "Premium wood selection",
      "Custom design",
      "Polishing included",
      "Home installation",
      "1-year warranty",
    ],
    isSubscription: false,
  },
  {
    id: "s6",
    name: "Wooden Table Making",
    category: "carpenter",
    price: 4500,
    image:
      "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?q=80&w=300",
    images: [
      "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?q=80&w=500",
      "https://images.unsplash.com/photo-1594620302200-9a762244a156?q=80&w=500",
    ],
    description:
      "Handcrafted wooden tables for dining, study, or office use. Choose from various wood types and designs. Comes with free delivery and assembly.",
    active: true,
    duration: "3-5 days",
    delivery: "Free delivery",
    rating: 4.5,
    reviewsCount: 34,
    storeId: "10",
    storeName: "Royal Furniture",
    distance: "2.1 km",
    features: [
      "Multiple wood options",
      "Custom sizing",
      "Free delivery",
      "Assembly included",
    ],
    isSubscription: false,
  },
  // Repair
  {
    id: "s7",
    name: "AC Repair Service",
    category: "repair",
    price: 500,
    originalPrice: 800,
    discount: 38,
    image:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=300",
    images: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=500",
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=500",
      "https://images.unsplash.com/photo-1631545806609-8aee4c39025e?q=80&w=500",
    ],
    description:
      "Professional AC repair and servicing for all brands. Includes gas refill, filter cleaning, and general maintenance. 30-day service warranty.",
    active: true,
    duration: "1-2 hrs",
    delivery: "Home visit",
    rating: 4.8,
    reviewsCount: 678,
    storeId: "5",
    storeName: "Auto Masters",
    distance: "1.2 km",
    features: [
      "All brands supported",
      "Gas refill included",
      "Filter cleaning",
      "30-day warranty",
    ],
    isSubscription: true,
  },
  {
    id: "s8",
    name: "Plumbing Service",
    category: "repair",
    price: 350,
    originalPrice: 500,
    discount: 30,
    image:
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?q=80&w=300",
    images: [
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?q=80&w=500",
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=500",
    ],
    description:
      "Expert plumbing services for leaks, blockages, and installations. Quick response time. All tools and basic materials included in the price.",
    active: true,
    duration: "1-3 hrs",
    delivery: "Home visit",
    rating: 4.4,
    reviewsCount: 234,
    storeId: "5",
    storeName: "Auto Masters",
    distance: "1.2 km",
    features: [
      "Leak repair",
      "Pipe installation",
      "Materials included",
      "Quick response",
    ],
    isSubscription: true,
  },
  // Cleaning
  {
    id: "s9",
    name: "Deep Home Cleaning",
    category: "cleaning",
    price: 1500,
    originalPrice: 2500,
    discount: 40,
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=300",
    images: [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=500",
      "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?q=80&w=500",
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=500",
      "https://images.unsplash.com/photo-1527515545081-5db817172677?q=80&w=500",
    ],
    description:
      "Complete home deep cleaning including all rooms, kitchen, bathrooms, and balconies. Professional equipment and eco-friendly products used. Satisfaction guaranteed.",
    active: true,
    duration: "4-6 hrs",
    delivery: "Home visit",
    rating: 4.6,
    reviewsCount: 456,
    storeId: "5",
    storeName: "Auto Masters",
    distance: "1.2 km",
    features: [
      "All rooms included",
      "Eco-friendly products",
      "Professional equipment",
      "Satisfaction guaranteed",
    ],
    isSubscription: true,
  },
  {
    id: "s10",
    name: "Sofa Cleaning",
    category: "cleaning",
    price: 800,
    originalPrice: 1200,
    discount: 33,
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=300",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?q=80&w=500",
    ],
    description:
      "Professional sofa and upholstery cleaning with steam technology. Removes stains, dust mites, and allergens. Safe for all fabric types.",
    active: true,
    duration: "1-2 hrs",
    delivery: "Home visit",
    rating: 4.3,
    reviewsCount: 189,
    storeId: "5",
    storeName: "Auto Masters",
    distance: "1.2 km",
    features: [
      "Steam cleaning",
      "Stain removal",
      "Allergen-free",
      "All fabrics",
    ],
    isSubscription: false,
  },
  // Delivery
  {
    id: "s11",
    name: "Same Day Delivery",
    category: "delivery",
    price: 50,
    image:
      "https://images.unsplash.com/photo-1565033595900-6ad46f6f8217?q=80&w=300",
    images: [
      "https://images.unsplash.com/photo-1565033595900-6ad46f6f8217?q=80&w=500",
      "https://images.unsplash.com/photo-1604507209433-bc10e3c35b08?q=80&w=500",
    ],
    description:
      "Get your order delivered the same day. Order before 5 PM for guaranteed same-day delivery. Real-time tracking available.",
    active: true,
    duration: "4-6 hrs",
    delivery: "Same day",
    rating: 4.7,
    reviewsCount: 892,
    storeId: "1",
    storeName: "Organic Farms",
    distance: "0.4 km",
    features: [
      "Same day guarantee",
      "Real-time tracking",
      "Safe packaging",
      "Order before 5 PM",
    ],
    isSubscription: false,
  },
  {
    id: "s12",
    name: "Express Delivery",
    category: "delivery",
    price: 100,
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=300",
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=500",
    ],
    description:
      "Ultra-fast delivery for urgent orders. 2-4 hour delivery window with priority handling. Insured and tracked.",
    active: true,
    duration: "2-4 hrs",
    delivery: "Express",
    rating: 4.9,
    reviewsCount: 678,
    storeId: "1",
    storeName: "Organic Farms",
    distance: "0.4 km",
    features: [
      "2-4 hour delivery",
      "Priority handling",
      "Insured",
      "Live tracking",
    ],
    isSubscription: true,
  },
];

// Enhanced Reel interface with store and product/service data
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

export const mockReels: EnhancedReel[] = [
  {
    _id: "1",
    videoUrl: "https://media.w3.org/2010/05/sintel/trailer.mp4",
    description:
      "Fresh organic veggies arrived at Green Store! 🥦 Best quality tomatoes, straight from the farm. Limited stock, grab yours now! #SangamDeals #FreshVeggies #OrganicFood",
    likesCount: 120,
    liked: false,
    shares: 45,
    saves: 23,
    user: {
      id: "user1",
      name: "Green Grocery Store",
      avatar: "https://i.pravatar.cc/150?u=green",
      isVerified: true,
    },
    store: {
      id: "1",
      name: "Organic Farms",
      logo: "https://picsum.photos/seed/shop1/100/100",
      type: "Grocery",
      isVerified: true,
    },
    item: {
      id: "p1",
      name: "Fresh Tomatoes",
      price: 40,
      image:
        "https://images.unsplash.com/photo-1546470427-227e933ac3bb?q=80&w=300",
      type: "product",
    },
    comments: [
      {
        id: "c1",
        user: {
          id: "u1",
          name: "Rahul Kumar",
          avatar: "https://i.pravatar.cc/150?u=rahul",
        },
        text: "The tomatoes were very fresh! Loved the quality.",
        likesCount: 12,
        liked: false,
        createdAt: "2026-02-28T10:30:00Z",
        isReview: true,
        replies: [
          {
            id: "r1",
            user: {
              id: "user1",
              name: "Green Grocery Store",
              avatar: "https://i.pravatar.cc/150?u=green",
            },
            text: "Thank you for your feedback! 🙏",
            likesCount: 3,
            liked: false,
            createdAt: "2026-02-28T11:00:00Z",
          },
        ],
      },
      {
        id: "c2",
        user: {
          id: "u2",
          name: "Sita Sharma",
          avatar: "https://i.pravatar.cc/150?u=sita",
        },
        text: "Do you have avocados available?",
        likesCount: 5,
        liked: false,
        createdAt: "2026-02-28T09:15:00Z",
        isReview: false,
        replies: [],
      },
    ],
  },
  {
    _id: "2",
    videoUrl:
      "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4",
    description:
      "Exclusive fashion collection drops tonight! 👗 Designer sarees at unbeatable prices. Visit our store for the complete collection. Don't miss out! #StyleHub #Fashion #DesignerSarees",
    likesCount: 340,
    liked: false,
    shares: 89,
    saves: 156,
    user: {
      id: "user2",
      name: "Fashion Forward",
      avatar: "https://i.pravatar.cc/150?u=fashion",
      isVerified: true,
    },
    store: {
      id: "11",
      name: "Modern Sari House",
      logo: "https://picsum.photos/seed/shop11/100/100",
      type: "Sari",
      isVerified: true,
    },
    item: {
      id: "p19",
      name: "Designer Banarasi Saree",
      price: 4500,
      image:
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=300",
      type: "product",
    },
    comments: [
      {
        id: "c3",
        user: {
          id: "u3",
          name: "Priya Patel",
          avatar: "https://i.pravatar.cc/150?u=priya",
        },
        text: "Love these designs! Can I get home delivery?",
        likesCount: 28,
        liked: false,
        createdAt: "2026-02-27T18:30:00Z",
        isReview: true,
        replies: [
          {
            id: "r2",
            user: {
              id: "user2",
              name: "Fashion Forward",
              avatar: "https://i.pravatar.cc/150?u=fashion",
            },
            text: "Yes, we deliver all over the city! DM us for details.",
            likesCount: 8,
            liked: false,
            createdAt: "2026-02-27T19:00:00Z",
          },
        ],
      },
    ],
  },
  {
    _id: "3",
    videoUrl:
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    description:
      "Hot deals on kitchen appliances ⚡ Professional-grade mixers and blenders at wholesale prices. Limited stock available! #MustBuy #KitchenAppliances #Deals",
    likesCount: 215,
    liked: false,
    shares: 67,
    saves: 89,
    user: {
      id: "user3",
      name: "TechHub Store",
      avatar: "https://i.pravatar.cc/150?u=tech",
      isVerified: false,
    },
    store: {
      id: "5",
      name: "Auto Masters",
      logo: "https://picsum.photos/seed/shop5/100/100",
      type: "Mechanical",
      isVerified: false,
    },
    item: {
      id: "s7",
      name: "AC Repair Service",
      price: 500,
      image:
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=300",
      type: "service",
    },
    comments: [
      {
        id: "c4",
        user: {
          id: "u4",
          name: "Amit Singh",
          avatar: "https://i.pravatar.cc/150?u=amit",
        },
        text: "Great prices for the quality offered!",
        likesCount: 15,
        liked: false,
        createdAt: "2026-02-26T14:20:00Z",
        isReview: true,
        replies: [],
      },
    ],
  },
  {
    _id: "4",
    videoUrl:
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    description:
      "New beauty and skincare products ✨ Bridal makeup packages starting from ₹5000. Get 30% off on first order! Book your appointment now. #GlowUp #BridalMakeup #Beauty",
    likesCount: 450,
    liked: false,
    shares: 234,
    saves: 312,
    user: {
      id: "user4",
      name: "Beauty Bliss",
      avatar: "https://i.pravatar.cc/150?u=beauty",
      isVerified: true,
    },
    store: {
      id: "6",
      name: "Glow Up Studio",
      logo: "https://picsum.photos/seed/shop6/100/100",
      type: "Makeup",
      isVerified: true,
    },
    item: {
      id: "s2",
      name: "Bridal Makeup Package",
      price: 5000,
      image:
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=300",
      type: "service",
    },
    comments: [
      {
        id: "c5",
        user: {
          id: "u5",
          name: "Neha Verma",
          avatar: "https://i.pravatar.cc/150?u=neha",
        },
        text: "Amazing quality products! Booked for my sister's wedding.",
        likesCount: 45,
        liked: false,
        createdAt: "2026-02-25T16:45:00Z",
        isReview: true,
        replies: [
          {
            id: "r3",
            user: {
              id: "user4",
              name: "Beauty Bliss",
              avatar: "https://i.pravatar.cc/150?u=beauty",
            },
            text: "Thank you! We'll make sure she looks stunning! 💄✨",
            likesCount: 12,
            liked: false,
            createdAt: "2026-02-25T17:00:00Z",
          },
          {
            id: "r4",
            user: {
              id: "u6",
              name: "Ananya",
              avatar: "https://i.pravatar.cc/150?u=ananya",
            },
            text: "I want to book too! What's the number?",
            likesCount: 3,
            liked: false,
            createdAt: "2026-02-25T18:30:00Z",
          },
        ],
      },
    ],
  },
  {
    _id: "5",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    description:
      "Premium coffee beans just arrived ☕ Arabica and Robusta blends from the hills of Coorg. Perfect for coffee lovers! Visit us for a free tasting session. #CoffeeAddict #PremiumCoffee #Coorg",
    likesCount: 180,
    liked: false,
    shares: 56,
    saves: 78,
    user: {
      id: "user5",
      name: "Coffee Corner",
      avatar: "https://i.pravatar.cc/150?u=coffee",
      isVerified: false,
    },
    store: {
      id: "15",
      name: "Dhaba Express",
      logo: "https://picsum.photos/seed/shop15/100/100",
      type: "Dhaba",
      isVerified: false,
    },
    item: {
      id: "p40",
      name: "Premium Arabica Coffee",
      price: 450,
      image:
        "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=300",
      type: "product",
    },
    comments: [
      {
        id: "c6",
        user: {
          id: "u7",
          name: "Raj Malhotra",
          avatar: "https://i.pravatar.cc/150?u=raj",
        },
        text: "Best coffee in town! The aroma is incredible.",
        likesCount: 22,
        liked: false,
        createdAt: "2026-02-24T08:00:00Z",
        isReview: true,
        replies: [],
      },
    ],
  },
];
