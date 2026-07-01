"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export function SplashScreen() {
  const { isLoading: langLoading } = useLanguage();
  const { isLoading: authLoading } = useAuth();
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(true);

  const isLoading = langLoading || authLoading;

  useEffect(() => {
    if (!isLoading) {
      // Fade out
      const fadeTimeout = setTimeout(() => {
        setVisible(false);
      }, 400); // 400ms fade animation duration

      // Unmount after fade out completes
      const unmountTimeout = setTimeout(() => {
        setMounted(false);
      }, 800);

      return () => {
        clearTimeout(fadeTimeout);
        clearTimeout(unmountTimeout);
      };
    }
  }, [isLoading]);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-50/75 backdrop-blur-xl text-slate-900 transition-all duration-500 ease-in-out",
        visible ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
      )}
    >
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none animate-pulse duration-4000" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/5 rounded-full blur-[120px] pointer-events-none animate-pulse duration-3000" />

      <div className="flex flex-col items-center space-y-8 z-10 p-6 text-center max-w-sm">
        {/* Animated Logo Container */}
        <div className="relative flex items-center justify-center">
          {/* Animated ping effect */}
          <div className="absolute -inset-6 rounded-full bg-primary/10 blur-xl animate-ping opacity-75" style={{ animationDuration: '3s' }} />
          <div className="relative p-6 bg-white/60 border border-slate-200 rounded-3xl backdrop-blur-xl shadow-md">
            <svg
              width="100"
              height="100"
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary hover:scale-105 transition-transform duration-500"
            >
              <path
                d="M200 20L46.4 110V290L200 380L353.6 290V110L200 20Z"
                stroke="currentColor"
                strokeWidth="20"
                strokeLinejoin="round"
              />
              <path
                d="M200 50L72.4 125V275L200 350L327.6 275V125L200 50Z"
                stroke="currentColor"
                strokeWidth="12"
                strokeLinejoin="round"
              />
              <circle cx="200" cy="200" r="105" fill="#7C3AED" />
              <path
                d="M200 120C200 120 140 190 140 230C140 263.137 166.863 290 200 290C233.137 290 260 263.137 260 230C260 190 200 120 200 120Z"
                fill="white"
              />
            </svg>
          </div>
        </div>

        {/* Brand details */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold font-headline tracking-wide bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
            RoParts Hub
          </h1>
          <p className="text-slate-500 text-xs tracking-[0.25em] uppercase font-bold">
            Premium RO Spare Parts
          </p>
        </div>

        {/* Loading Bar wrapper */}
        <div className="w-56 h-1 bg-slate-100 rounded-full overflow-hidden border border-slate-200 relative">
          <div className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full animate-progress absolute left-0 top-0" />
        </div>
      </div>
    </div>
  );
}
