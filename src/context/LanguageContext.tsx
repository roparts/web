
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';

type Language = 'en' | 'hi';

const translations = { en, hi };

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: typeof en;
  isLanguageSelected: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLanguageSelected, setIsLanguageSelected] = useState(false);

  useEffect(() => {
    try {
        const storedLanguage = localStorage.getItem('ro-language') as Language | null;
        if (storedLanguage && ['en', 'hi'].includes(storedLanguage)) {
            setLanguageState(storedLanguage);
            setIsLanguageSelected(true);
        }
    } catch (error) {
        console.error("Could not access localStorage for language setting:", error);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    try {
        localStorage.setItem('ro-language', lang);
    } catch (error) {
         console.error("Could not access localStorage for language setting:", error);
    }
    setLanguageState(lang);
    if(!isLanguageSelected) {
        setIsLanguageSelected(true)
    }
  }, [isLanguageSelected]);

  const value = {
    language,
    setLanguage,
    translations: translations[language],
    isLanguageSelected,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

    