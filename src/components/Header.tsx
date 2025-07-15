
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { CartSheet } from './CartSheet';
import { CategorySheet } from './CategorySheet';
import { useState } from 'react';
import type { Part } from '@/lib/types';

interface HeaderProps {
  categories?: string[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}


export function Header({ categories, selectedCategory, onCategoryChange }: HeaderProps) {
  const { itemCount } = useCart();
  const [isCartOpen, setCartOpen] = useState(false);
  const [isCategoryMenuOpen, setCategoryMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setCategoryMenuOpen(true)} aria-label="Open categories menu">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image src="/logo.svg" alt="RoParts Hub Logo" width={40} height={40} />
            <span className="font-bold font-headline text-2xl text-primary hidden sm:inline-block">
              RoParts Hub
            </span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
              <Button variant="ghost" size="icon" onClick={() => setCartOpen(true)} aria-label="Open cart">
                <div className="relative">
                  <ShoppingCart className="h-6 w-6" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {itemCount}
                    </span>
                  )}
                </div>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <CartSheet open={isCartOpen} onOpenChange={setCartOpen} />
      {categories && onCategoryChange && (
         <CategorySheet 
            open={isCategoryMenuOpen} 
            onOpenChange={setCategoryMenuOpen} 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
        />
      )}
    </>
  );
}
