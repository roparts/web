
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Part } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { Badge } from './ui/badge';
import { useLanguage } from '@/context/LanguageContext';

interface PartCardProps {
  part: Part;
}

export function PartCard({ part }: PartCardProps) {
  const { addToCart } = useCart();
  const { translations, language } = useLanguage();
  const hasDiscount = part.discountPrice !== undefined && part.discountPrice < part.price;
  const discountPercentage = hasDiscount ? Math.round(((part.price - part.discountPrice!) / part.price) * 100) : 0;
  const showMinQuantity = !!part.minQuantity && part.minQuantity > 1;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(part);
  };

  const partName = (language === 'hi' && part.name_hi) ? part.name_hi : part.name;
  const partDescription = (language === 'hi' && part.description_hi) ? part.description_hi : part.description;
  const categoryKeyword = part.subcategory.split(' ')[0].toLowerCase();

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 group bg-white/80 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-xl">
      <CardHeader className="p-0 relative">
        <Link href={`/part/${part.id}`}>
          <div className="aspect-square overflow-hidden bg-gray-50 dark:bg-white/5">
            <Image
              src={part.image}
              alt={partName}
              width={500}
              height={500}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
              data-ai-hint={`${categoryKeyword} water`}
            />
          </div>
        </Link>
        {hasDiscount && (
          <Badge variant="destructive" className="absolute top-2 right-2 z-10 shadow-lg backdrop-blur-sm bg-destructive/90">
            {discountPercentage}{translations.partDetails.discount}
          </Badge>
        )}
      </CardHeader>
      <div className="p-3 flex-grow flex flex-col gap-1">
        <Link href={`/part/${part.id}`} className="flex-grow space-y-1">
          {part.brand && <p className="text-[10px] uppercase tracking-wider font-bold text-primary/80 mb-0.5">{part.brand}</p>}
          <CardTitle className="text-base font-bold font-headline leading-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">{partName}</CardTitle>
          <CardDescription className="text-xs text-muted-foreground line-clamp-2">{partDescription}</CardDescription>
        </Link>
      </div>
      <CardFooter className="p-3 pt-0 flex flex-col sm:flex-row justify-between items-center gap-2 mt-auto">
        <div className="flex flex-col items-start self-start">
          {hasDiscount ? (
            <div className="flex flex-col">
              <p className="text-lg font-extrabold text-primary drop-shadow-sm">₹{part.discountPrice!.toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground line-through opacity-70">₹{part.price.toLocaleString('en-IN')}</p>
            </div>
          ) : (
            <p className="text-lg font-extrabold text-primary drop-shadow-sm">₹{part.price.toLocaleString('en-IN')}</p>
          )}
          {showMinQuantity && (
            <p className="text-[10px] text-muted-foreground mt-0.5">{translations.partCard.minQty}: {part.minQuantity}</p>
          )}
        </div>
        <Button
          onClick={handleAddToCart}
          size="sm"
          className="w-full sm:w-auto text-xs active:scale-95 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:scale-105 bg-primary hover:bg-primary/90 rounded-full px-4"
        >
          <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
          {translations.partCard.addToCart}
        </Button>
      </CardFooter>
    </Card>
  );
}
