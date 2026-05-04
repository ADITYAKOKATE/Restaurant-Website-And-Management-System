'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface CartItem {
  _id: string;
  menuItem: {
    _id: string;
    name: string;
    price: number;
    image: string;
    category: string;
  };
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (menuItemId: string, quantity?: number) => Promise<void>;
  removeFromCart: (menuItemId: string) => Promise<void>;
  updateQuantity: (menuItemId: string, quantity: number) => Promise<void>;
  fetchCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/cart`);
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (menuItemId: string, quantity = 1) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuItemId, quantity }),
      });
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to add to cart', err);
    }
  };

  const removeFromCart = async (menuItemId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/cart/${menuItemId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to remove from cart', err);
    }
  };

  const updateQuantity = async (menuItemId: string, quantity: number) => {
    if (!user) return;
    try {
      // Find current quantity to calculate diff
      const currentItem = cartItems.find((item) => item.menuItem._id === menuItemId);
      const diff = quantity - (currentItem ? currentItem.quantity : 0);
      
      const res = await fetch(`/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuItemId, quantity: diff }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to update quantity', err);
    }
  };

  // Filter out any cart items where menuItem is null (can happen if the item was deleted from DB)
  const validCartItems = cartItems.filter(item => item.menuItem != null);

  const cartCount = validCartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = validCartItems.reduce((acc, item) => acc + (item.menuItem.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems: validCartItems, cartCount, cartTotal, addToCart, removeFromCart, updateQuantity, fetchCart, isLoading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
