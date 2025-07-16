
"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { RelatedParts } from '@/components/RelatedParts';
import type { Part } from '@/lib/types';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';


export function PartDetailClient({ part }: { part: Part }) {
  const { addToCart } = useCart();
  const { translations, language } = useLanguage();
  const router = useRouter();

  const partName = language === 'hi' && part.name_hi ? part.name_hi : part.name;
  const partDescription = language === 'hi' && part.description_hi ? part.description_hi : part.description;
  const partSubcategory = part.subcategory;
  const partFeatures = language === 'hi' && part.features_hi ? part.features_hi : part.features;

  const hasDiscount = part.discountPrice !== undefined && part.discountPrice < part.price;
  const discountPercentage = hasDiscount ? Math.round(((part.price - part.discountPrice!) / part.price) * 100) : 0;
  
  const features = partFeatures.split(',').map(f => f.trim());
  const categoryKeyword = part.subcategory.split(' ')[0].toLowerCase();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {translations.partDetails.backToProducts}
          </Button>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-lg border">
                <Image
                  src={part.image}
                  alt={partName}
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
                  data-ai-hint={`${categoryKeyword} water`}
                  priority // Prioritize loading the main product image
                />
              </div>
               {hasDiscount && (
                <Badge variant="destructive" className="absolute top-4 right-4 z-10 text-base">
                  {discountPercentage}{translations.partDetails.discount}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-col">
              {part.brand && <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{part.brand}</p>}
              <h1 className="text-3xl lg:text-4xl font-bold font-headline text-primary tracking-tight mt-1">{partName}</h1>
              <p className="mt-2 text-muted-foreground">{translations.partDetails.category}: <Link href="/" className="text-primary hover:underline">{partSubcategory}</Link></p>
              
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
            <div className="prose max-w-none text-muted-foreground mt-4">
              <p>{partDescription}</p>
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
