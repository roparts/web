"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { CartSheet } from './CartSheet';
import { useState } from 'react';

export function Header() {
  const { itemCount } = useCart();
  const [isCartOpen, setCartOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image src="/logo.svg" alt="RoParts Hub Logo" width={40} height={40} />
            <span className="font-bold font-headline text-2xl text-primary">
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
    </>
  );
}
