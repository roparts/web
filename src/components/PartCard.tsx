
"use client";

import Image from 'next/image';
import type { Part } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { Badge } from './ui/badge';

interface PartCardProps {
  part: Part;
}

export function PartCard({ part }: PartCardProps) {
  const { addToCart } = useCart();
  const hasDiscount = part.discountPrice !== undefined && part.discountPrice < part.price;
  const discountPercentage = hasDiscount ? Math.round(((part.price - part.discountPrice!) / part.price) * 100) : 0;
  const showMinQuantity = !!part.minQuantity;

  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group relative">
       {hasDiscount && (
        <Badge variant="destructive" className="absolute top-2 right-2 z-10">
          {discountPercentage}% OFF
        </Badge>
      )}
      <CardHeader className="p-0">
        <div className="aspect-square overflow-hidden">
          <Image
            src={part.image}
            alt={part.name}
            width={400}
            height={400}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={`${part.category} part`}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-headline mb-2">{part.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-3">{part.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-2">
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
                <p className="text-xs text-muted-foreground mt-1">Min. Qty: {part.minQuantity}</p>
            )}
        </div>
        <Button onClick={() => addToCart(part)} size="sm" className="w-full sm:w-auto mt-auto self-end">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
