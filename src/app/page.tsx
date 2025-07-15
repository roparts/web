
"use client";

import { useMemo, useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import { Header } from '@/components/Header';
import { PartCard } from '@/components/PartCard';
import { RelatedParts } from '@/components/RelatedParts';
import { partsData } from '@/lib/parts-data';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Mic, History, ShoppingCart, Building, Home as HomeIcon, ListFilter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/context/CartContext';
import { getSearchSuggestion, getRefinedVoiceSearch, getCategoryFromSearch } from './actions';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import Fuse from 'fuse.js';
import type { Part } from '@/lib/types';
import { CategorySheet } from '@/components/CategorySheet';


type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'discount-desc';
type ProductType = 'Domestic' | 'Commercial';

const SEARCH_HISTORY_KEY = 'ro-search-history';

export default function Home() {
  const { translations, language, isLanguageSelected } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedType, setSelectedType] = useState<ProductType>('Domestic');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const { itemCount, setSheetOpen } = useCart();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 150);

  const fuse = useMemo(() => {
    const options = {
      keys: ['name', 'name_hi', 'category', 'category_hi', 'type'],
      includeScore: true,
      threshold: 0.4,
    };
    return new Fuse(partsData, options);
  }, []);
  
  const categoriesMap = useMemo(() => {
    const map = new Map<string, string>();
    partsData.forEach(part => {
      if(part.category && part.category_hi) {
        map.set(part.category, part.category_hi);
      }
    });
    return map;
  }, []);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (storedHistory) {
        setSearchHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsInputFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const updateSearchHistory = useCallback((query: string) => {
    if (!query) return;
    setSearchHistory(prev => {
      const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 5);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Failed to save search history:', error);
      }
      return newHistory;
    });
  }, []);

  const clearSearchHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  };

  const handleSearchSubmit = useCallback(async (query: string, e?: FormEvent) => {
    e?.preventDefault();
    const term = query.trim();
    setIsInputFocused(false);
    setSuggestions([]);
    
    if (term) {
      updateSearchHistory(term);
      const detectedCategory = await getCategoryFromSearch(term);
      
      if (detectedCategory) {
        const categoryToSet = (language === 'hi' ? categoriesMap.get(detectedCategory) : detectedCategory) || 'All';
        setSelectedCategory(categoryToSet);
        setActiveSearch(''); 
        setSearchQuery('');
      } else {
         setActiveSearch(term);
         setSelectedCategory('All');
      }
    } else {
      setActiveSearch('');
      setSelectedCategory('All');
    }
  }, [language, categoriesMap, updateSearchHistory]);

  const categories = useMemo(() => {
    const relevantParts = partsData.filter(part => part.type === selectedType);
    const allCategories = relevantParts.map(part => (language === 'hi' && part.category_hi) ? part.category_hi : part.category);
    return ['All', ...Array.from(new Set(allCategories))];
  }, [language, selectedType]);


  const filteredAndSortedParts = useMemo(() => {
    let partsToFilter: Part[] = partsData.filter(part => part.type === selectedType);

    if (activeSearch.trim()) {
      partsToFilter = fuse.search(activeSearch).map(result => result.item).filter(part => part.type === selectedType);
    }

    const filteredByCategory = partsToFilter.filter(part => {
      if (selectedCategory === 'All') return true;
      const currentCategory = (language === 'hi' && part.category_hi) ? part.category_hi : part.category;
      return currentCategory === selectedCategory;
    });
    
    const sorted = [...filteredByCategory];

    switch (sortOption) {
      case 'price-asc':
        return sorted.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
      case 'price-desc':
        return sorted.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
      case 'name-asc':
        return sorted.sort((a, b) => {
            const nameA = (language === 'hi' && a.name_hi) ? a.name_hi : a.name;
            const nameB = (language === 'hi' && b.name_hi) ? b.name_hi : b.name;
            return nameA.localeCompare(nameB, language === 'hi' ? 'hi' : 'en');
        });
      case 'name-desc':
        return sorted.sort((a, b) => {
            const nameA = (language === 'hi' && a.name_hi) ? a.name_hi : a.name;
            const nameB = (language === 'hi' && b.name_hi) ? b.name_hi : b.name;
            return nameB.localeCompare(nameA, language === 'hi' ? 'hi' : 'en');
        });
      case 'discount-desc':
        return sorted.sort((a, b) => {
          const discountA = a.discountPrice ? (a.price - a.discountPrice) / a.price : 0;
          const discountB = b.discountPrice ? (b.price - b.discountPrice) / b.price : 0;
          return discountB - discountA;
        });
      default:
        return filteredByCategory;
    }
  }, [activeSearch, selectedCategory, sortOption, language, fuse, selectedType]);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      recognitionRef.current = null;
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setIsRecording(false);
      const refinedQuery = await getRefinedVoiceSearch(transcript);
      setSearchQuery(refinedQuery);
      handleSearchSubmit(refinedQuery);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.abort();
    };
  }, [language, handleSearchSubmit]);

  useEffect(() => {
    if (debouncedSearchQuery && debouncedSearchQuery.length > 1) {
      setIsSuggestionLoading(true);
      getSearchSuggestion(debouncedSearchQuery)
        .then(result => setSuggestions(result))
        .catch(err => {
          console.error("Error fetching suggestions:", err);
          setSuggestions([]);
        })
        .finally(() => setIsSuggestionLoading(false));
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearchQuery]);

  const handleSuggestionClick = (term: string) => {
    setSearchQuery(term);
    handleSearchSubmit(term);
  };

  const handleVoiceSearch = () => {
    if (recognitionRef.current && !isRecording) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Could not start voice recognition:", error)
      }
    } else if (isRecording) {
      recognitionRef.current?.stop();
    }
  };

  const handleTypeChange = (type: ProductType) => {
    setSelectedType(type);
    setSelectedCategory('All');
    setActiveSearch('');
    setSearchQuery('');
  }

  const handleCategoryChange = (cat: string) => {
      setSelectedCategory(cat);
      setActiveSearch('');
      setSearchQuery('');
  }
  
  const showHistory = isInputFocused && !searchQuery && searchHistory.length > 0;
  const showSuggestions = isInputFocused && searchQuery.length > 0 && (suggestions.length > 0 || isSuggestionLoading);

  if (!isLanguageSelected) {
    return <LanguageSelector />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-8 sm:py-12">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline text-primary tracking-tighter">
              {translations.home.title}
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
              {translations.home.subtitle}
            </p>
          </div>

          <div className="mb-8 space-y-4">
             <Tabs value={selectedType} onValueChange={(v) => handleTypeChange(v as ProductType)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="Domestic" className="text-base gap-2"><HomeIcon/>Domestic</TabsTrigger>
                <TabsTrigger value="Commercial" className="text-base gap-2"><Building/>Commercial</TabsTrigger>
              </TabsList>
            </Tabs>


            <div className="flex flex-col sm:flex-row gap-4">
              <div ref={searchContainerRef} className="relative flex-grow z-30">
                <form onSubmit={(e) => handleSearchSubmit(searchQuery, e)} className="relative flex items-center">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={translations.home.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    className="w-full pl-10 pr-10 text-base"
                  />
                  {recognitionRef.current && (
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={handleVoiceSearch}
                      aria-label="Search by voice"
                    >
                      <Mic className={cn("h-5 w-5", isRecording ? "text-destructive animate-pulse" : "text-muted-foreground")} />
                    </Button>
                  )}
                </form>
                 {(showSuggestions || showHistory) && (
                    <div className="absolute top-full mt-1 w-full rounded-md border bg-background shadow-lg">
                      {showSuggestions ? (
                        <>
                          {isSuggestionLoading && !suggestions.length ? (
                            <div className="p-3 text-sm text-muted-foreground">{translations.home.searching}</div>
                          ) : (
                            <ul className="py-1">
                              {suggestions.map((suggestion, index) => (
                                <li key={index}>
                                  <button
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-3"
                                  >
                                    <Search className="h-4 w-4 text-muted-foreground" />
                                    <span>{suggestion}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      ) : showHistory ? (
                        <div>
                           <div className="px-3 py-2 flex justify-between items-center">
                              <span className="text-sm font-semibold">{translations.home.recentSearches}</span>
                              <button onClick={clearSearchHistory} className="text-xs text-primary hover:underline">{translations.home.clear}</button>
                           </div>
                           <ul className="py-1">
                            {searchHistory.map((item, index) => (
                              <li key={index}>
                                <button
                                  onClick={() => handleSuggestionClick(item)}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-3"
                                >
                                  <History className="h-4 w-4 text-muted-foreground" />
                                  <span>{item}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  )}
              </div>
            </div>
            {/* Category and Sort controls */}
             <div className="flex gap-4">
                  <div className="md:hidden flex-grow">
                      <Button variant="outline" className="w-full" onClick={() => setIsCategorySheetOpen(true)}>
                          <ListFilter className="mr-2 h-4 w-4"/>
                          {translations.categories.title}
                      </Button>
                  </div>
                  <Select onValueChange={(value) => setSortOption(value as SortOption)} defaultValue="default">
                    <SelectTrigger className="w-full sm:w-[200px] text-base md:flex-grow">
                      <SelectValue placeholder={translations.home.sortBy} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">{translations.home.sortOptions.default}</SelectItem>
                      <SelectItem value="price-asc">{translations.home.sortOptions.priceAsc}</SelectItem>
                      <SelectItem value="price-desc">{translations.home.sortOptions.priceDesc}</SelectItem>
                      <SelectItem value="name-asc">{translations.home.sortOptions.nameAsc}</SelectItem>
                      <SelectItem value="name-desc">{translations.home.sortOptions.nameDesc}</SelectItem>
                      <SelectItem value="discount-desc">{translations.home.sortOptions.discountDesc}</SelectItem>
                    </SelectContent>
                  </Select>
             </div>
            {/* Category Tabs for Desktop */}
            <div className="hidden md:block">
              <Tabs 
                value={selectedCategory} 
                onValueChange={handleCategoryChange} 
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:flex-wrap h-auto">
                  {categories.map(category => (
                    <TabsTrigger key={category} value={category} className="flex-1 lg:flex-none">
                      {category === 'All' && language === 'hi' ? 'सभी' : category}
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
              <h2 className="text-2xl font-headline font-semibold">{translations.home.noPartsFound}</h2>
              <p className="mt-2 text-muted-foreground">{translations.home.noPartsHint}</p>
            </div>
          )}

          <RelatedParts />
        </section>
      </main>
      <footer className="bg-secondary text-secondary-foreground py-6 mt-auto">
        <div className="container mx-auto text-center text-sm">
           <p>&copy; {new Date().getFullYear()} RoParts Hub. {translations.footer.rightsReserved}</p>
            <p className="mt-2">
              <Link href="/rajababuadmin" className="hover:text-primary transition-colors">{translations.footer.adminPanel}</Link>
            </p>
        </div>
      </footer>
      
      {itemCount > 0 && (
         <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
           <Button
             size="lg"
             className="rounded-full shadow-lg"
             onClick={() => setSheetOpen(true)}
           >
             <ShoppingCart className="mr-2 h-5 w-5" />
             {translations.cart.viewQuote} ({itemCount})
           </Button>
         </div>
       )}

      <CategorySheet 
        open={isCategorySheetOpen} 
        onOpenChange={setIsCategorySheetOpen}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

    </div>
  );
}
