
"use client";

import Link from 'next/link';
import { ShoppingCart, Menu, Globe, Search } from 'lucide-react';
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
  selectedMainCategory?: string;
  onMainCategoryChange?: (category: string) => void;
}

export function Header({
  selectedMainCategory = 'All',
  onMainCategoryChange = () => { }
}: HeaderProps) {
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
              <svg width="40" height="40" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary hover:scale-110 transition-transform duration-300">
                <path d="M200 20L46.4 110V290L200 380L353.6 290V110L200 20Z" stroke="currentColor" strokeWidth="20" strokeLinejoin="round" />
                <path d="M200 50L72.4 125V275L200 350L327.6 275V125L200 50Z" stroke="currentColor" strokeWidth="12" strokeLinejoin="round" />
                <circle cx="200" cy="200" r="105" fill="#7C3AED" />
                <path d="M200 120C200 120 140 190 140 230C140 263.137 166.863 290 200 290C233.137 290 260 263.137 260 230C260 190 200 120 200 120Z" fill="white" />
              </svg>
              <span className="font-bold font-headline text-2xl text-primary hidden sm:inline-block">
                RoParts Hub
              </span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="h-6 w-6" />
            </Button>

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
