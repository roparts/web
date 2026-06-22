
"use client";

import Link from 'next/link';
import { ShoppingCart, Menu, Globe, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
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
  const { user, profile, signOut } = useAuth();
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

            <nav className="flex items-center gap-1">
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

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-slate-100 text-slate-800">
                      <User className="h-6 w-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2">
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        {profile?.role === 'business' ? 'Business Account' : 'Retail Customer'}
                      </p>
                      {profile?.company_name && (
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {profile.company_name}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <hr className="my-1 border-slate-100" />
                    <DropdownMenuItem asChild>
                      <Link href={profile?.role === 'business' ? '/dashboard/business' : '/dashboard/retail'} className="w-full cursor-pointer">
                        {translations.header.dashboard}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive cursor-pointer">
                      {translations.header.signOut}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="icon" asChild className="text-slate-800">
                  <Link href="/login" aria-label={translations.header.signIn}>
                    <User className="h-6 w-6" />
                  </Link>
                </Button>
              )}
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
