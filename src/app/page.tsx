
"use client";

import { useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { PartCard } from '@/components/PartCard';
import { RelatedParts } from '@/components/RelatedParts';
import { partsData } from '@/lib/parts-data';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => {
    const allCategories = partsData.map(part => part.category);
    return ['All', ...Array.from(new Set(allCategories))];
  }, []);

  const filteredParts = useMemo(() => {
    return partsData.filter(part => {
      const matchesCategory = selectedCategory === 'All' || part.category === selectedCategory;
      const matchesSearch = part.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-8 sm:py-12">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline text-primary tracking-tighter">
              Ultimate RO Parts Collection
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
              Find everything you need for your water purification system. High-quality, reliable, and ready to ship.
            </p>
          </div>

          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for parts by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 text-base"
              />
            </div>
            {/* Category Tabs for Desktop */}
            <div className="hidden md:block">
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:flex-wrap h-auto">
                  {categories.map(category => (
                    <TabsTrigger key={category} value={category} className="flex-1 lg:flex-none">
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {filteredParts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {filteredParts.map((part) => (
                <PartCard key={part.id} part={part} />
              ))}
            </div>
          ) : (
             <div className="text-center py-16">
              <h2 className="text-2xl font-headline font-semibold">No Parts Found</h2>
              <p className="mt-2 text-muted-foreground">Try adjusting your search or category filters.</p>
            </div>
          )}

          <RelatedParts />
        </section>
      </main>
      <footer className="bg-secondary text-secondary-foreground py-6 mt-auto">
        <div className="container mx-auto text-center text-sm">
           <p>&copy; {new Date().getFullYear()} RoParts Hub. All Rights Reserved.</p>
            <p className="mt-2">
              <Link href="/rajababuadmin" className="hover:text-primary transition-colors">Admin Panel</Link>
            </p>
        </div>
      </footer>
    </div>
  );
}
