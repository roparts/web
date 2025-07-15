
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'discount-desc';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState<SortOption>('default');

  const categories = useMemo(() => {
    const allCategories = partsData.map(part => part.category);
    return ['All', ...Array.from(new Set(allCategories))];
  }, []);

  const filteredAndSortedParts = useMemo(() => {
    const filtered = partsData.filter(part => {
      const matchesCategory = selectedCategory === 'All' || part.category === selectedCategory;
      const matchesSearch = part.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    switch (sortOption) {
      case 'price-asc':
        return filtered.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
      case 'price-desc':
        return filtered.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
      case 'name-asc':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return filtered.sort((a, b) => b.name.localeCompare(a.name));
      case 'discount-desc':
        return filtered.sort((a, b) => {
          const discountA = a.discountPrice ? (a.price - a.discountPrice) / a.price : 0;
          const discountB = b.discountPrice ? (b.price - b.discountPrice) / b.price : 0;
          return discountB - discountA;
        });
      default:
        return filtered;
    }
  }, [searchQuery, selectedCategory, sortOption]);

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
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for parts by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 text-base"
                />
              </div>
              <Select onValueChange={(value) => setSortOption(value as SortOption)} defaultValue="default">
                <SelectTrigger className="w-full sm:w-[200px] text-base">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A-Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z-A</SelectItem>
                  <SelectItem value="discount-desc">Biggest Discount</SelectItem>
                </SelectContent>
              </Select>
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
          
          {filteredAndSortedParts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {filteredAndSortedParts.map((part) => (
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
