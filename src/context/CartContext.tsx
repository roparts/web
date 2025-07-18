
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Part, CartItem } from '@/lib/types';
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from './LanguageContext';
import { CartSheet } from '@/components/CartSheet';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (part: Part) => void;
  removeFromCart: (partId: string) => void;
  updateQuantity: (partId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  totalPrice: number;
  lastAddedItem: Part | null;
  isSheetOpen: boolean;
  setSheetOpen: (isOpen: boolean) => void;
}

const CART_STORAGE_KEY = 'ro-cart-items';

const CartContext = createContext<CartContextType | undefined>(undefined);

const isServer = typeof window === 'undefined';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [lastAddedItem, setLastAddedItem] = useState<Part | null>(null);
  const [isSheetOpen, setSheetOpen] = useState(false);
  const { toast } = useToast();
  const { translations } = useLanguage();

  useEffect(() => {
    if (isServer) return;
    try {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
    } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    if (isServer) return;
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
        console.error("Failed to save cart to localStorage:", error);
    }
  }, [cartItems]);

  const addToCart = useCallback((part: Part) => {
    const minQuantity = part.minQuantity || 1;
    const existingItem = cartItems.find(item => item.id === part.id);

    setCartItems(prevItems => {
      if (existingItem) {
        return prevItems.map(item =>
          item.id === part.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...part, quantity: minQuantity }];
    });

    setLastAddedItem(part);

    if (existingItem) {
        toast({
            title: translations.cart.itemUpdated,
            description: translations.cart.quantityIncreased.replace('{partName}', part.name),
        });
    } else {
        toast({
            title: translations.cart.itemAdded,
            description: translations.cart.unitsAdded
              .replace('{quantity}', String(minQuantity))
              .replace('{partName}', part.name),
        });
    }
  }, [toast, cartItems, translations]);

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
    <CartContext.Provider value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        itemCount, 
        totalPrice, 
        lastAddedItem,
        isSheetOpen,
        setSheetOpen
    }}>
      {children}
      <CartSheet open={isSheetOpen} onOpenChange={setSheetOpen} />
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
