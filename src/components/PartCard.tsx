
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
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
      <CardHeader className="p-0 relative">
        <Link href={`/part/${part.id}`}>
          <div className="aspect-square overflow-hidden">
              <Image
                src={part.image}
                alt={partName}
                width={400}
                height={400}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={`${categoryKeyword} water`}
              />
          </div>
        </Link>
        {hasDiscount && (
          <Badge variant="destructive" className="absolute top-2 right-2 z-10">
            {discountPercentage}{translations.partDetails.discount}
          </Badge>
        )}
      </CardHeader>
      <div className="p-4 flex-grow flex flex-col">
          <Link href={`/part/${part.id}`} className="flex-grow">
            {part.brand && <p className="text-xs font-semibold text-muted-foreground mb-1">{part.brand}</p>}
            <CardTitle className="text-lg font-headline mb-2">{partName}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground line-clamp-3">{partDescription}</CardDescription>
          </Link>
      </div>
      <CardFooter className="p-4 flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-2 mt-auto">
        <div className="flex flex-col items-start self-start">
            {hasDiscount ? (
                <>
                    <p className="text-xl font-bold text-primary">₹{part.discountPrice!.toLocaleString('en-IN')}</p>
                    <p className="text-sm text-muted-foreground line-through">₹{part.price.toLocaleString('en-IN')}</p>
                </>
            ) : (
                <p className="text-xl font-bold text-primary">₹{part.price.toLocaleString('en-IN')}</p>
            )}
            {showMinQuantity && (
                <p className="text-xs text-muted-foreground mt-1">{translations.partCard.minQty}: {part.minQuantity}</p>
            )}
        </div>
        <Button onClick={handleAddToCart} size="sm" className="w-full sm:w-auto self-end">
          <ShoppingCart className="mr-2 h-4 w-4" />
          {translations.partCard.addToCart}
        </Button>
      </CardFooter>
    </Card>
  );
}

    