import React, { createContext, ReactNode, useContext, useState } from 'react';
import { mockStores, Store } from '../assets/mockData';
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface AppContextType {
  user: { name: string; isLoggedIn: boolean } | null;
  login: (name: string) => void;
  logout: () => void;
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  cartTotal: number;
  allStores: Store[]; // Uses the interface from your mockData
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ name: string; isLoggedIn: boolean } | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Use the imported mockStores from your assets folder instead of hardcoding here
  const [allStores] = useState<Store[]>(mockStores);

  const login = (name: string) => setUser({ name, isLoggedIn: true });
  const logout = () => setUser(null);

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
      user, 
      login, 
      logout, 
      cart, 
      addToCart, 
      removeFromCart, 
      cartTotal, 
      allStores 
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