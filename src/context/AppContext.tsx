import React, { createContext, ReactNode, useContext, useState } from 'react';

// 1. Define the shape of a Cart Item
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// 2. Define the Context State
interface AppContextType {
  // User State
  user: { name: string; isLoggedIn: boolean } | null;
  login: (name: string) => void;
  logout: () => void;

  // Cart State
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  cartTotal: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// 3. The Provider Component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ name: string; isLoggedIn: boolean } | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  // User Actions
  const login = (name: string) => setUser({ name, isLoggedIn: true });
  const logout = () => setUser(null);

  // Cart Actions
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

  // Derived State (Total Price)
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <AppContext.Provider 
      value={{ user, login, logout, cart, addToCart, removeFromCart, cartTotal }}
    >
      {children}
    </AppContext.Provider>
  );
};

// 4. Custom Hook for easy use
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};