
"use client";

import { useMemo } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { partsData } from '@/lib/parts-data';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { RelatedParts } from '@/components/RelatedParts';
import type { Part } from '@/lib/types';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function PartDetailPage({ params }: { params: { id: string } }) {
  const { addToCart } = useCart();
  const { translations } = useLanguage();
  
  const part = useMemo(() => {
    return partsData.find(p => p.id === params.id);
  }, [params.id]);

  if (!part) {
    notFound();
  }

  const hasDiscount = part.discountPrice !== undefined && part.discountPrice < part.price;
  const discountPercentage = hasDiscount ? Math.round(((part.price - part.discountPrice!) / part.price) * 100) : 0;
  
  const features = part.features.split(',').map(f => f.trim());

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-lg border">
                <Image
                  src={part.image}
                  alt={part.name}
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
                  data-ai-hint={`${part.category} part`}
                />
              </div>
               {hasDiscount && (
                <Badge variant="destructive" className="absolute top-4 right-4 z-10 text-base">
                  {discountPercentage}{translations.partDetails.discount}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-3xl lg:text-4xl font-bold font-headline text-primary tracking-tight">{part.name}</h1>
              <p className="mt-2 text-muted-foreground">{translations.partDetails.category}: <Link href="/" className="text-primary hover:underline">{part.category}</Link></p>
              
              <div className="mt-6">
                <p className="text-lg font-semibold">{translations.partDetails.keyFeatures}</p>
                <ul className="mt-2 space-y-2 list-disc list-inside text-muted-foreground">
                  {features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                 <p className="text-sm text-muted-foreground">
                    {translations.partDetails.minQuantity}: <span className="font-bold text-foreground">{part.minQuantity || 1}</span>
                </p>
              </div>

              <div className="mt-6">
                {hasDiscount ? (
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-primary">₹{part.discountPrice!.toLocaleString('en-IN')}</p>
                    <p className="text-2xl text-muted-foreground line-through">₹{part.price.toLocaleString('en-IN')}</p>
                  </div>
                ) : (
                  <p className="text-4xl font-bold text-primary">₹{part.price.toLocaleString('en-IN')}</p>
                )}
              </div>
              
              <Button onClick={() => addToCart(part)} size="lg" className="mt-8 w-full sm:w-auto">
                <ShoppingCart className="mr-2 h-5 w-5" />
                {translations.partDetails.addToCart}
              </Button>

            </div>
          </div>

          <div className="mt-12 lg:mt-16">
            <h2 className="text-2xl font-bold font-headline">{translations.partDetails.productDescription}</h2>
            <div className="mt-4 prose max-w-none text-muted-foreground">
              <p>{part.description}</p>
            </div>
          </div>
          
           <RelatedParts currentPart={part} />

        </div>
      </main>
      <footer className="bg-secondary text-secondary-foreground py-6 mt-auto">
        <div className="container mx-auto text-center text-sm">
           <p>&copy; {new Date().getFullYear()} RoParts Hub. {translations.footer.rightsReserved}</p>
           <p className="mt-2">
              <Link href="/rajababuadmin" className="hover:text-primary transition-colors">{translations.footer.adminPanel}</Link>
            </p>
        </div>
      </footer>
    </div>
  );
}
