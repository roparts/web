
"use client";

import { useMemo, useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { PartCard } from '@/components/PartCard';
import { RelatedParts } from '@/components/RelatedParts';
import { partsData } from '@/lib/parts-data';
import { Input } from '@/components/ui/input';
import { Search, Mic, History, ListFilter, Filter } from 'lucide-react';
import { getRefinedVoiceSearch } from './actions';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import Fuse from 'fuse.js';
import type { Part, MainCategory } from '@/lib/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'discount-desc';

const SEARCH_HISTORY_KEY = 'ro-search-history';
const MAIN_CATEGORIES: MainCategory[] = [
  'Domestic RO Parts',
  'Commercial RO Parts',
  'RO Accessories & Tools',
  'Complete RO Systems',
  'Service Kits & Combo Packs',
];

export default function Home() {
  const { translations, language, isLanguageSelected } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState<MainCategory>('Domestic RO Parts');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 150);

  const fuse = useMemo(() => {
    const options = {
      keys: [
        { name: 'name', weight: 3 }, 
        { name: 'name_hi', weight: 3 },
        { name: 'subcategory', weight: 2 },
        { name: 'brand', weight: 1.5 },
        'id'
      ],
      includeScore: true,
      threshold: 0.4,
      ignoreLocation: true,
    };
    return new Fuse(partsData, options);
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

  const handleSearchSubmit = useCallback((query: string, e?: FormEvent) => {
    e?.preventDefault();
    const term = query.trim();
    setIsInputFocused(false);
    setSuggestions([]);
    
    if (term) {
      updateSearchHistory(term);
      setActiveSearch(term);
      setSelectedSubcategory('All');
      setSelectedBrand('All');
    } else {
      setActiveSearch('');
    }
  }, [updateSearchHistory]);

  const handleMainCategoryChange = (cat: MainCategory) => {
    setSelectedMainCategory(cat);
    setSelectedSubcategory('All');
    setSelectedBrand('All');
    setActiveSearch('');
    setSearchQuery('');
  }
  
  const subcategories = useMemo(() => {
    const relevantParts = partsData.filter(part => part.mainCategory === selectedMainCategory);
    const allSubcategories = relevantParts.map(part => part.subcategory);
    return ['All', ...Array.from(new Set(allSubcategories))];
  }, [selectedMainCategory]);

  const brands = useMemo(() => {
    const relevantParts = partsData.filter(part => part.mainCategory === selectedMainCategory);
    const allBrands = relevantParts.map(part => part.brand).filter(Boolean);
    return ['All', ...Array.from(new Set(allBrands as string[]))];
  }, [selectedMainCategory]);

  const filteredAndSortedParts = useMemo(() => {
    let partsToFilter: Part[] = partsData;

    if (activeSearch.trim()) {
      partsToFilter = fuse.search(activeSearch).map(result => result.item);
    }
    
    const filteredByMainCategory = partsToFilter.filter(part => part.mainCategory === selectedMainCategory);

    const filteredBySubcategory = filteredByMainCategory.filter(part => {
      if (selectedSubcategory === 'All') return true;
      return part.subcategory === selectedSubcategory;
    });

    const filteredByBrand = filteredBySubcategory.filter(part => {
        if (selectedBrand === 'All') return true;
        return part.brand === selectedBrand;
    });
    
    const sorted = [...filteredByBrand];

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
        return filteredByBrand;
    }
  }, [activeSearch, selectedMainCategory, selectedSubcategory, selectedBrand, sortOption, language, fuse]);
  
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
    recognition.lang = 'en-US'; // Always listen for English
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setIsRecording(false);
      const refinedQuery = await getRefinedVoiceSearch(transcript);
      setSearchQuery(refinedQuery);
      handleSearchSubmit(refinedQuery);
    };
    
    recognitionRef.current = recognition;

    return () => recognitionRef.current?.abort();
  }, [handleSearchSubmit]);

  useEffect(() => {
    if (debouncedSearchQuery && debouncedSearchQuery.length > 1) {
      setIsSuggestionLoading(true);
      const results = fuse.search(debouncedSearchQuery).slice(0, 5);
      const uniqueSuggestions = Array.from(new Set(results.map(r => {
        const item = r.item;
        return (language === 'hi' && item.name_hi) ? item.name_hi : item.name;
      })));
      setSuggestions(uniqueSuggestions);
      setIsSuggestionLoading(false);
    } else {
      setSuggestions([]);
      if (debouncedSearchQuery.length <=1) {
        setActiveSearch('');
      }
    }
  }, [debouncedSearchQuery, fuse, language]);

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

  const showHistory = isInputFocused && !searchQuery && searchHistory.length > 0;
  const showSuggestions = isInputFocused && searchQuery.length > 0 && (suggestions.length > 0 || isSuggestionLoading);

  if (!isLanguageSelected) {
    return <LanguageSelector />;
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header 
        selectedMainCategory={selectedMainCategory}
        onMainCategoryChange={handleMainCategoryChange}
      />
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
            <div className="relative flex-grow z-30">
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
                  <div ref={searchContainerRef} className="absolute top-full mt-1 w-full rounded-md border bg-background shadow-lg">
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

            <div className="flex gap-4 justify-between items-center">
              <h2 className="text-lg font-semibold text-primary">{selectedMainCategory}</h2>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-shrink-0">
                      <Filter className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">{translations.home.filterBy}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{translations.categories.title}</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={selectedMainCategory} onValueChange={(v) => handleMainCategoryChange(v as MainCategory)}>
                      {MAIN_CATEGORIES.map((category) => (
                        <DropdownMenuRadioItem key={category} value={category}>
                          {category}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>{translations.categories.all}</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                          {subcategories.map((category) => (
                            <DropdownMenuRadioItem key={category} value={category}>
                              {category === 'All' ? translations.categories.all : category}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>{translations.brands.title}</DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup value={selectedBrand} onValueChange={setSelectedBrand}>
                          {brands.map((brand) => (
                            <DropdownMenuRadioItem key={brand} value={brand}>
                               {brand === 'All' ? translations.brands.all : brand}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex-shrink-0">
                      <ListFilter className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">{translations.home.sortBy}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
                        <DropdownMenuRadioItem value="default">{translations.home.sortOptions.default}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="price-asc">{translations.home.sortOptions.priceAsc}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="price-desc">{translations.home.sortOptions.priceDesc}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="name-asc">{translations.home.sortOptions.nameAsc}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="name-desc">{translations.home.sortOptions.nameDesc}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="discount-desc">{translations.home.sortOptions.discountDesc}</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
    </div>
  );
}
