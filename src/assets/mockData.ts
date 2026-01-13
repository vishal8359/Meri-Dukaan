// src/assets/mockData.ts

export interface Store {
  id: string;
  name: string;
  type: string;
  followers: string;
  rating: number;
  distance: string;
  image: string; // Changed to string for URLs
}

export const mockStores: Store[] = [
  { id: '1', name: 'Organic Farms', type: 'Grocery', followers: '1.2k', rating: 4.8, distance: '0.4 km', image: 'https://picsum.photos/seed/shop1/400/300' },
  { id: '2', name: 'LifeCare Pharma', type: 'Medical', followers: '850', rating: 4.5, distance: '0.8 km', image: 'https://picsum.photos/seed/shop2/400/300' },
  { id: '3', name: 'Stitch & Style', type: 'Tailor', followers: '500', rating: 4.2, distance: '1.1 km', image: 'https://picsum.photos/seed/shop3/400/300' },
  { id: '4', name: 'Pizza Palace', type: 'Pizza', followers: '2.5k', rating: 4.9, distance: '0.3 km', image: 'https://picsum.photos/seed/shop4/400/300' },
  { id: '5', name: 'Auto Masters', type: 'Mechanical', followers: '1.1k', rating: 4.6, distance: '2.5 km', image: 'https://picsum.photos/seed/shop5/400/300' },
  { id: '6', name: 'Glow Up Studio', type: 'Makeup', followers: '3.2k', rating: 4.7, distance: '0.6 km', image: 'https://picsum.photos/seed/shop6/400/300' },
  { id: '7', name: 'The Book Nook', type: 'Book Depot', followers: '900', rating: 4.4, distance: '1.5 km', image: 'https://picsum.photos/seed/shop7/400/300' },
  { id: '8', name: 'Fresh Greens', type: 'Sabji', followers: '1.5k', rating: 4.3, distance: '0.2 km', image: 'https://picsum.photos/seed/shop8/400/300' },
  { id: '9', name: 'Iron & Fire', type: 'Welding', followers: '300', rating: 4.0, distance: '3.2 km', image: 'https://picsum.photos/seed/shop9/400/300' },
  { id: '10', name: 'Royal Furniture', type: 'Furniture', followers: '2.1k', rating: 4.8, distance: '2.1 km', image: 'https://picsum.photos/seed/shop10/400/300' },
  { id: '11', name: 'Modern Sari House', type: 'Sari', followers: '4.5k', rating: 4.9, distance: '0.9 km', image: 'https://picsum.photos/seed/shop11/400/300' },
  { id: '12', name: 'Petal Pushers', type: 'Garden', followers: '1.2k', rating: 4.6, distance: '1.8 km', image: 'https://picsum.photos/seed/shop12/400/300' },
  { id: '13', name: 'The Gym Box', type: 'Gym', followers: '5.6k', rating: 4.7, distance: '0.5 km', image: 'https://picsum.photos/seed/shop13/400/300' },
  { id: '14', name: 'City Car Wash', type: 'Car Wash', followers: '700', rating: 4.3, distance: '2.8 km', image: 'https://picsum.photos/seed/shop14/400/300' },
  { id: '15', name: 'Dhaba Express', type: 'Dhaba', followers: '3.8k', rating: 4.5, distance: '4.2 km', image: 'https://picsum.photos/seed/shop15/400/300' },
  { id: '16', name: 'Vision Optics', type: 'Specs', followers: '1.4k', rating: 4.4, distance: '1.2 km', image: 'https://picsum.photos/seed/shop16/400/300' },
  { id: '17', name: 'Toy World', type: 'Toy', followers: '2.2k', rating: 4.7, distance: '1.6 km', image: 'https://picsum.photos/seed/shop17/400/300' },
  { id: '18', name: 'Glitters Gold', type: 'Gold/Silver', followers: '8.2k', rating: 5.0, distance: '0.7 km', image: 'https://picsum.photos/seed/shop18/400/300' },
  { id: '19', name: 'Travel Tunes', type: 'Travel', followers: '1.1k', rating: 4.1, distance: '2.3 km', image: 'https://picsum.photos/seed/shop19/400/300' },
  { id: '20', name: 'Daily Dairy', type: 'Milk', followers: '1.9k', rating: 4.6, distance: '0.3 km', image: 'https://picsum.photos/seed/shop20/400/300' },
];

export const STORE_TYPES = [
  "Grocery", "Medical", "Tailor", "Mechanical", "Property", "Phone", "Photo", 
  "Makeup", "Book Depot", "Electric", "Welding", "Chicken", "Pizza", "Bag", 
  "Light", "Sabji", "Clothes", "Specs", "Sari", "Carpet", "Paint", "Glass", 
  "Shoes", "Charpi", "Mandir", "Furniture", "Motor", "Band", "Repair", "ATM", 
  "Fish", "Garden", "Tyre", "Pan", "Sewing Machine", "Dhaba", "Teeth", 
  "Cosmetic", "Travel", "Milk", "Parking", "Steel", "Car Wash", "Toy", 
  "Battery", "Saloon", "Car Repair", "Gold/Silver", "Gym"
];