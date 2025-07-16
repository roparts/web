
"use client";

import Link from 'next/link';
import { ShoppingCart, Menu, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MobileNavSheet } from './MobileNavSheet';
import type { MainCategory } from '@/lib/types';

interface HeaderProps {
  selectedMainCategory: MainCategory;
  onMainCategoryChange: (category: MainCategory) => void;
}

export function Header({ selectedMainCategory, onMainCategoryChange }: HeaderProps) {
  const { itemCount, setSheetOpen } = useCart();
  const { language, setLanguage, translations } = useLanguage();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-auto flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={() => setIsMobileNavOpen(true)}
              aria-label={translations.header.openCategories}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <Link href="/" className="flex items-center space-x-2">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary"><path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="hsl(var(--primary))" /><path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM5.5 16.5L12 20L18.5 16.5V8.5L12 5L5.5 8.5V16.5Z" stroke="hsl(var(--primary-foreground))" strokeOpacity="0.5" /><path d="M10.1929 14.5459C9.92133 13.9284 9.75 13.2388 9.75 12.5C9.75 10.2909 11.5409 8.5 13.75 8.5C14.0322 8.5 14.3069 8.53501 14.5682 8.59868C14.0736 8.01991 13.3364 7.66667 12.5 7.66667C10.597 7.66667 9 9.26364 9 11.1667C9 12.4293 9.70469 13.5357 10.6978 14.1613L10.1929 14.5459Z" fill="hsl(var(--accent))"/><path d="M12 12.5C12 11.12 13.12 10 14.5 10C15.88 10 17 11.12 17 12.5C17 13.88 15.88 15 14.5 15C13.12 15 12 13.88 12 12.5Z" fill="hsl(var(--primary-foreground))"/></svg>
              <span className="font-bold font-headline text-2xl text-primary hidden sm:inline-block">
                RoParts Hub
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Globe className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('en')} disabled={language === 'en'}>
                  {translations.header.english}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('hi')} disabled={language === 'hi'}>
                  {translations.header.hindi}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <nav className="flex items-center">
              <Button variant="ghost" size="icon" onClick={() => setSheetOpen(true)} aria-label={translations.header.openCart}>
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
      <MobileNavSheet 
        open={isMobileNavOpen} 
        onOpenChange={setIsMobileNavOpen}
        selectedMainCategory={selectedMainCategory}
        onMainCategoryChange={onMainCategoryChange}
       />
    </>
  );
}
