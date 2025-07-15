
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import { getRelatedParts } from '@/app/actions';
import { Skeleton } from './ui/skeleton';
import { partsData } from '@/lib/parts-data';
import type { Part } from '@/lib/types';
import { PartCard } from './PartCard';
import { useLanguage } from '@/context/LanguageContext';

interface RelatedPartsProps {
  currentPart?: Part;
}

export function RelatedParts({ currentPart }: RelatedPartsProps) {
  const { lastAddedItem } = useCart();
  const [suggestions, setSuggestions] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { translations } = useLanguage();

  const partToFetch = currentPart || lastAddedItem || partsData[partsData.length - 1];

  const allPartsMap = useMemo(() => new Map(partsData.map(p => [p.name.toLowerCase(), p])), []);

  useEffect(() => {
    // This check is removed to allow fetching even if partToFetch is the default
    // if (!partToFetch) {
    //   setSuggestions([]);
    //   setIsLoading(false);
    //   return;
    // }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const result = await getRelatedParts(partToFetch);
        const suggestedParts = result
          .map(name => allPartsMap.get(name.toLowerCase()))
          // Filter out the current part and any falsy values
          .filter((p): p is Part => !!p && p.id !== partToFetch.id)
          .slice(0, 3); // Limit to 3 suggestions
        
        setSuggestions(suggestedParts);

      } catch (error) {
        console.error("Failed to fetch related parts:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [partToFetch, allPartsMap]);

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
    return null; // Don't render anything if there are no suggestions and it's not loading.
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
