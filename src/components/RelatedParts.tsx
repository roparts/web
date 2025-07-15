
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import { Skeleton } from './ui/skeleton';
import { partsData } from '@/lib/parts-data';
import type { Part } from '@/lib/types';
import { PartCard } from './PartCard';
import { useLanguage } from '@/context/LanguageContext';
import { getRelatedParts } from '@/app/actions';

interface RelatedPartsProps {
  currentPart?: Part;
}

export function RelatedParts({ currentPart }: RelatedPartsProps) {
  const { lastAddedItem } = useCart();
  const [suggestions, setSuggestions] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { translations } = useLanguage();

  const partToFetchFor = currentPart || lastAddedItem;

  useEffect(() => {
    let isMounted = true;
    
    async function fetchSuggestions() {
      if (!partToFetchFor) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const suggestedNames = await getRelatedParts(partToFetchFor);
        if (isMounted) {
          const suggestedParts = partsData.filter(p => suggestedNames.includes(p.name));
          setSuggestions(suggestedParts);
        }
      } catch (error) {
        console.error("Failed to fetch related parts:", error);
        if (isMounted) {
          setSuggestions([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchSuggestions();
    
    return () => {
      isMounted = false;
    }
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
