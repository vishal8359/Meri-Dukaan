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
      id: "prod1",
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
      id: "prod2",
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
      id: "serv1",
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
      id: "serv2",
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
      id: "prod3",
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
