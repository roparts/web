
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import { Skeleton } from './ui/skeleton';
import { partsData } from '@/lib/parts-data';
import type { Part } from '@/lib/types';
import { PartCard } from './PartCard';
import { useLanguage } from '@/context/LanguageContext';

interface RelatedPartsProps {
  currentPart?: Part;
}

// Simple shuffle function
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export function RelatedParts({ currentPart }: RelatedPartsProps) {
  const { lastAddedItem } = useCart();
  const [suggestions, setSuggestions] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { translations } = useLanguage();

  const partToFetchFor = currentPart || lastAddedItem || partsData[partsData.length - 1];

  useEffect(() => {
    setIsLoading(true);
    
    // Find related parts by category
    const relatedByCategory = partsData.filter(p => 
      p.category === partToFetchFor.category && p.id !== partToFetchFor.id
    );

    // Shuffle and take the first 3
    const shuffledSuggestions = shuffleArray(relatedByCategory).slice(0, 3);
    
    setSuggestions(shuffledSuggestions);
    setIsLoading(false);
  }, [partToFetchFor]);

  if (isLoading) {
    return (
      <div className="my-16">
        <h2 className="text-3xl font-bold text-center mb-8 font-headline">{translations.partDetails.relatedTitle}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null; 
  }

  return (
    <div className="my-16">
      <h2 className="text-3xl font-bold text-center mb-8 font-headline">{translations.partDetails.relatedTitle}</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {suggestions.map(part => (
          <PartCard key={part.id} part={part} />
        ))}
      </div>
    </div>
  );
}
