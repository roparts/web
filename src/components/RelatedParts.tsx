"use client";

import { useEffect, useState, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import { getRelatedParts } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from './ui/skeleton';
import { partsData } from '@/lib/parts-data';
import type { Part } from '@/lib/types';
import { PartCard } from './PartCard';

export function RelatedParts() {
  const { lastAddedItem } = useCart();
  const [suggestions, setSuggestions] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const allPartsMap = useMemo(() => new Map(partsData.map(p => [p.name.toLowerCase(), p])), []);

  useEffect(() => {
    if (!lastAddedItem) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const result = await getRelatedParts(lastAddedItem);
        const suggestedParts = result
          .map(name => allPartsMap.get(name.toLowerCase()))
          .filter((p): p is Part => !!p)
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
  }, [lastAddedItem, allPartsMap]);

  if (!lastAddedItem) return null;

  return (
    <div className="my-16">
      <h2 className="text-3xl font-bold text-center mb-8 font-headline">You Might Also Like</h2>
      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-8">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : suggestions.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {suggestions.map(part => (
            <PartCard key={part.id} part={part} />
          ))}
        </div>
      ) : (
         <p className="text-center text-muted-foreground">No suggestions available right now.</p>
      )}
    </div>
  );
}
