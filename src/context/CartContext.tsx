"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { Part, CartItem } from '@/lib/types';
import { useToast } from "@/hooks/use-toast"

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (part: Part) => void;
  removeFromCart: (partId: string) => void;
  updateQuantity: (partId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  totalPrice: number;
  lastAddedItem: Part | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [lastAddedItem, setLastAddedItem] = useState<Part | null>(null);
  const { toast } = useToast();

  const addToCart = useCallback((part: Part) => {
    const minQuantity = part.minQuantity || 1;
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === part.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === part.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...part, quantity: minQuantity }];
    });
    setLastAddedItem(part);

    const existingItem = cartItems.find(item => item.id === part.id);
    if (existingItem) {
        toast({
            title: "Item quantity updated",
            description: `${part.name} quantity increased.`,
        });
    } else {
        toast({
            title: "Added to cart",
            description: `${minQuantity} unit(s) of ${part.name} added.`,
        });
    }
  }, [toast, cartItems]);

  const removeFromCart = useCallback((partId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== partId));
  }, []);

  const updateQuantity = useCallback((partId: string, quantity: number) => {
    const itemInCart = cartItems.find(item => item.id === partId);
    const minQuantity = itemInCart?.minQuantity || 1;

    if (quantity < minQuantity) {
      removeFromCart(partId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item => (item.id === partId ? { ...item, quantity } : item))
      );
    }
  }, [removeFromCart, cartItems]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cartItems.reduce((total, item) => {
    const price = item.discountPrice ?? item.price;
    return total + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, totalPrice, lastAddedItem }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
