
"use client";

import { useMemo, useState, useEffect, useCallback, useRef, type FormEvent } from 'react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
  var SpeechRecognition: any;
  var webkitSpeechRecognition: any;
}
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { PartCard } from '@/components/PartCard';
import { RelatedParts } from '@/components/RelatedParts';
import { Input } from '@/components/ui/input';
import { Search, Mic, History, ListFilter, Filter, ChevronRight, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { getRefinedVoiceSearch } from '@/app/actions';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import Fuse from 'fuse.js';
import type { Part, MainCategory, AdBanner } from '@/lib/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'; // Removed SubMenu imports
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { TypewriterText } from '@/components/TypewriterText';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'discount-desc';

const SEARCH_HISTORY_KEY = 'ro-search-history';
const MAIN_CATEGORIES: MainCategory[] = [
  'Domestic RO Parts',
  'Commercial RO Parts',
  'RO Accessories & Tools',
  'Complete RO Systems',
  'Service Kits & Combo Packs',
];

interface HomeClientProps {
  initialParts: Part[];
  initialBanners?: AdBanner[];
}

export function HomeClient({ initialParts, initialBanners = [] }: HomeClientProps) {
  const { translations, language, isLanguageSelected, isLoading } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
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
    const allParts = initialParts.map(part => {
      return {
        ...part,
        name: part.name,
        name_hi: part.name_hi || '',
      };
    });
    return new Fuse(allParts, options);
  }, [initialParts]);

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
      // We don't necessarily want to reset filters on search, but if search implies global, 
      // usually we keep filters if the user set them. 
      // Reverting to previous behavior of resetting just in case, 
      // but "Filter state must be correctly managed" suggests we might want to search WITHIN filters.
      // Let's reset for now to ensure we find matches globally, or user can filter AFTER search.
      setSelectedMainCategory('All');
      setSelectedSubcategory('All');
      setSelectedBrand('All');
    } else {
      setActiveSearch('');
    }
  }, [updateSearchHistory]);

  /* 
    Logic for options in the dropdowns:
    1. Subcategories list should show ALL subcategories available in the selected MainCategory (or all if MainCategory is 'All').
       It should NOT be narrowed by the selected Brand, so that users can switch subcategories easily even if the current brand doesn't have them.
    2. Brands list should show ALL brands available in the selected MainCategory (or all if MainCategory is 'All').
       It should NOT be narrowed by the selected Subcategory.
  */
  const subcategories = useMemo(() => {
    const relevantParts = selectedMainCategory === 'All'
      ? initialParts
      : initialParts.filter(part => part.mainCategory === selectedMainCategory);

    // We do NOT filter by selectedBrand here to allow independent selection
    const allSubcategories = relevantParts.map(part => part.subcategory);
    return ['All', ...Array.from(new Set(allSubcategories)).sort()];
  }, [selectedMainCategory, initialParts]); // Removed selectedBrand dependency

  const brands = useMemo(() => {
    const relevantParts = selectedMainCategory === 'All'
      ? initialParts
      : initialParts.filter(part => part.mainCategory === selectedMainCategory);

    // We do NOT filter by selectedSubcategory here to allow independent selection
    const allBrands = relevantParts.map(part => part.brand).filter(Boolean);
    return ['All', ...Array.from(new Set(allBrands as string[])).sort()];
  }, [selectedMainCategory, initialParts]); // Removed selectedSubcategory dependency

  const handleMainCategoryChange = (cat: string) => {
    // When changing main category, we check if current subcategory/brand is valid in the NEW scope.
    // If not, we reset them to 'All'.
    setSelectedMainCategory(cat);

    const newRelevantParts = cat === 'All'
      ? initialParts
      : initialParts.filter(part => part.mainCategory === cat);

    const newSubcategories = new Set(newRelevantParts.map(p => p.subcategory));
    const newBrands = new Set(newRelevantParts.map(p => p.brand).filter(Boolean) as string[]);

    if (selectedSubcategory !== 'All' && !newSubcategories.has(selectedSubcategory)) {
      setSelectedSubcategory('All');
    }

    if (selectedBrand !== 'All' && !newBrands.has(selectedBrand)) {
      setSelectedBrand('All');
    }
  }

  const filteredAndSortedParts = useMemo(() => {
    let partsToFilter: Part[] = initialParts;

    if (activeSearch.trim()) {
      partsToFilter = fuse.search(activeSearch).map(result => result.item);
    }

    const filteredByMainCategory = partsToFilter.filter(part => {
      if (selectedMainCategory === 'All') return true;
      return part.mainCategory === selectedMainCategory;
    });

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
          const nameA = (language === 'hi' && a.name_hi) ? a.name_hi : (a.name || '');
          const nameB = (language === 'hi' && b.name_hi) ? b.name_hi : (b.name || '');
          return (nameA || '').localeCompare(nameB || '', language === 'hi' ? 'hi' : 'en');
        });
      case 'name-desc':
        return sorted.sort((a, b) => {
          const nameA = (language === 'hi' && a.name_hi) ? a.name_hi : (a.name || '');
          const nameB = (language === 'hi' && b.name_hi) ? b.name_hi : (b.name || '');
          return (nameB || '').localeCompare(nameA || '', language === 'hi' ? 'hi' : 'en');
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
  }, [activeSearch, selectedMainCategory, selectedSubcategory, selectedBrand, sortOption, language, fuse, initialParts]);

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
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsRecording(false);
      const refinedQuery = await getRefinedVoiceSearch(transcript, initialParts);
      setSearchQuery(refinedQuery);
      handleSearchSubmit(refinedQuery);
    };

    recognitionRef.current = recognition;

    return () => recognitionRef.current?.abort();
  }, [handleSearchSubmit, initialParts]);

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
      if (debouncedSearchQuery.length <= 1) {
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 w-full max-w-sm">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!isLanguageSelected) {
    return <LanguageSelector />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        selectedMainCategory={selectedMainCategory}
        onMainCategoryChange={handleMainCategoryChange}
      />
      <main className="flex-1 overflow-hidden">
        {/* Hero Section */}
        <section className="relative container mx-auto px-4 pt-8 pb-6 sm:pt-12 sm:pb-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
            <div className="flex-[1.2] text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-headline text-slate-900 tracking-tight mb-6 leading-[1.1]">
                {translations?.home?.title || "Ultimate RO Parts Collection"}
              </h1>
              <div className="text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto lg:mx-0 flex flex-wrap items-center justify-center lg:justify-start gap-x-2">
                <span>{translations?.home?.subtitle || "Find everything you need for your water purification system."}</span>
              </div>
              {/* Visually Hidden SEO Content */}
              <div className="sr-only">
                <h2>Best Reverse Osmosis (RO) Spare Parts in India</h2>
                <p>
                  Buy high-quality RO membrane, water purifier filters, RO pumps, and all types of
                  RO spare parts at the best prices. We supply Kent RO parts, Aquaguard spares,
                  and universal water purifier components for domestic and commercial systems.
                </p>
                <ul>
                  <li>RO Filter Spares</li>
                  <li>Reverse Osmosis Membranes</li>
                  <li>Water Purifier Service Kits</li>
                  <li>RO SV and Pump</li>
                  <li>Inline Filters and Carbon Filters</li>
                </ul>
              </div>
            </div>
            <div className="flex-1 relative w-full max-w-[180px] sm:max-w-[320px] lg:max-w-[300px]">
              <div className="absolute -inset-4 bg-blue-100/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
              <Image
                src="/ro-system.png"
                alt="RO System Illustration"
                width={180}
                height={180}
                className="w-full h-auto drop-shadow-xl hover:scale-105 transition-transform duration-500"
                priority
              />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 mb-12">
          {/* Search Bar */}
          <div className="max-w-5xl mx-auto mb-10">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[2rem] blur opacity-15 group-hover:opacity-25 transition duration-1000 group-hover:duration-200"></div>
              <form onSubmit={(e) => handleSearchSubmit(searchQuery, e)} className="relative flex items-center bg-white rounded-[2rem] border border-blue-100 shadow-xl overflow-hidden p-1">
                <div className="flex-1 flex items-center px-6">
                  <Search className="h-5 w-5 text-slate-400 mr-3" />
                  <Input
                    type="text"
                    placeholder="Search for parts by name or voice..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    className="flex-1 border-none shadow-none focus-visible:ring-0 text-lg bg-transparent py-7"
                  />
                  {recognitionRef.current && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full hover:bg-blue-50 transition-colors"
                      onClick={handleVoiceSearch}
                    >
                      <Mic className={cn("h-5 w-5", isRecording ? "text-destructive animate-pulse" : "text-slate-400")} />
                    </Button>
                  )}
                </div>
                <Button
                  type="submit"
                  className="rounded-full px-8 py-7 text-lg font-semibold bg-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25"
                >
                  Search
                </Button>
              </form>

              {(showSuggestions || showHistory) && (
                <div ref={searchContainerRef} className="absolute top-full mt-3 w-full rounded-2xl border bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50 ring-1 ring-black/5">
                  {/* ... existing suggestions/history logic ... */}
                  {showSuggestions ? (
                    <ul className="py-2">
                      {suggestions.map((suggestion, index) => (
                        <li key={index}>
                          <button
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full text-left px-6 py-4 text-slate-700 hover:bg-blue-50 flex items-center gap-3 transition-colors"
                          >
                            <Search className="h-4 w-4 text-primary/70" />
                            <span className="font-medium">{suggestion}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : showHistory && (
                    <div>
                      <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Searches</span>
                        <button onClick={clearSearchHistory} className="text-xs text-primary hover:underline">Clear</button>
                      </div>
                      <ul className="py-2">
                        {searchHistory.map((item, index) => (
                          <li key={index}>
                            <button
                              onClick={() => handleSuggestionClick(item)}
                              className="w-full text-left px-6 py-4 text-slate-700 hover:bg-blue-50 flex items-center gap-3 transition-colors"
                            >
                              <History className="h-4 w-4 text-slate-400" />
                              <span className="font-medium">{item}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-10">
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <Button variant="outline" className="rounded-full border-slate-200 text-slate-600 flex-shrink-0">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>

              {subcategories.slice(0, 6).map((cat) => (
                <Button
                  key={cat}
                  variant={selectedSubcategory === cat ? "default" : "secondary"}
                  onClick={() => setSelectedSubcategory(cat)}
                  className={cn(
                    "rounded-full px-5 py-2 whitespace-nowrap transition-all flex-shrink-0",
                    selectedSubcategory === cat ? "shadow-md scale-105" : "bg-blue-50/50 hover:bg-blue-50 text-slate-700 border-transparent"
                  )}
                >
                  {cat === 'All' ? "All Parts" : cat}
                </Button>
              ))}
              <Button variant="ghost" className="rounded-full text-primary font-medium flex-shrink-0">
                More <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Select value={selectedMainCategory} onValueChange={(v) => handleMainCategoryChange(v)}>
                <SelectTrigger className="w-full md:w-[180px] rounded-full border-slate-200 bg-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {MAIN_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="w-full md:w-[140px] rounded-full border-slate-200 bg-white">
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>{brand === 'All' ? "All Brands" : brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" className="rounded-full border-slate-200 flex-shrink-0">
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Promo Banners */}
          {initialBanners.length > 0 ? (
            initialBanners.map((banner) => (
              <div key={banner.id} className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-2xl mb-12 group">
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
                  <div className="absolute top-[-20%] right-[-10%] w-[120%] h-[140%] bg-[radial-gradient(circle,white_0%,transparent_70%)] opacity-30 animate-pulse"></div>
                </div>
                <div className="relative flex flex-row items-center p-3 md:p-4 gap-4 min-h-[120px]">
                  <div className="flex-[2.5] text-left z-10">
                    {(language === 'hi' ? banner.badge_hi : banner.badge) && (
                      <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold mb-4 animate-bounce">
                        {language === 'hi' ? banner.badge_hi || banner.badge : banner.badge}
                      </div>
                    )}
                    <h2 className="text-lg md:text-2xl font-bold mb-0.5 leading-tight whitespace-pre-line">
                      {language === 'hi' ? banner.title_hi || banner.title : banner.title}
                    </h2>
                    <p className="text-[10px] md:text-sm text-white/80 mb-2 max-w-md line-clamp-1 md:line-clamp-2">
                      {language === 'hi' ? banner.subtitle_hi || banner.subtitle : banner.subtitle}
                    </p>
                    {banner.link ? (
                      <Link href={banner.link}>
                        <Button className="bg-white text-blue-600 hover:bg-white/90 rounded-full px-4 py-1.5 h-8 md:h-10 text-xs md:text-base font-bold shadow-lg transition-all hover:scale-105 active:scale-95">
                          {language === 'hi' ? 'अभी खरीदें' : 'Shop Now'}
                        </Button>
                      </Link>
                    ) : (
                      <Button className="bg-white text-blue-600 hover:bg-white/90 rounded-full px-4 py-1.5 h-8 md:h-10 text-xs md:text-base font-bold shadow-lg transition-all hover:scale-105 active:scale-95">
                        {language === 'hi' ? 'अभी खरीदें' : 'Shop Now'}
                      </Button>
                    )}
                  </div>
                  <div className="flex-1 relative w-full max-w-[80px] sm:max-w-[140px]">
                    <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-30 -z-10"></div>
                    <Image
                      src={banner.image}
                      alt={banner.title}
                      width={100}
                      height={100}
                      className="w-full h-auto drop-shadow-[0_5px_15px_rgba(0,0,0,0.3)] transform transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>
                {/* Wave decorations */}
                <div className="absolute bottom-0 left-0 w-full h-24 opacity-30 pointer-events-none">
                  <svg viewBox="0 0 1440 320" className="w-full h-full preserve-aspect-ratio">
                    <path fill="white" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                  </svg>
                </div>
              </div>
            ))
          ) : (
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-2xl mb-12 group">
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[120%] h-[140%] bg-[radial-gradient(circle,white_0%,transparent_70%)] opacity-30 animate-pulse"></div>
              </div>
              <div className="relative flex flex-row items-center p-3 md:p-4 gap-4 min-h-[120px]">
                <div className="flex-[2.5] text-left z-10">
                  <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold mb-4 animate-bounce">
                    Limited Time Offer
                  </div>
                  <h2 className="text-lg md:text-2xl font-bold mb-0.5 leading-tight">
                    30% Off Premium <br />
                    RO Membranes!
                  </h2>
                  <p className="text-[10px] md:text-sm text-white/80 mb-2 max-w-md line-clamp-1 md:line-clamp-2">
                    Upgrade your system for purer water. Long-lasting, efficient, and reliable performance.
                  </p>
                  <Button className="bg-white text-blue-600 hover:bg-white/90 rounded-full px-4 py-1.5 h-8 md:h-10 text-xs md:text-base font-bold shadow-lg transition-all hover:scale-105 active:scale-95">
                    Shop Now
                  </Button>
                </div>
                <div className="flex-1 relative w-full max-w-[80px] sm:max-w-[140px]">
                  <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-30 -z-10"></div>
                  <Image
                    src="/ro-membrane-banner.png"
                    alt="Premium RO Membrane"
                    width={100}
                    height={100}
                    className="w-full h-auto drop-shadow-[0_5px_15px_rgba(0,0,0,0.3)] transform transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-24 opacity-30 pointer-events-none">
                <svg viewBox="0 0 1440 320" className="w-full h-full preserve-aspect-ratio">
                  <path fill="white" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
              </div>
            </div>
          )}
        </section>

        <section className="container mx-auto px-4 pb-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-2">
            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                {activeSearch ? `Search Results for "${activeSearch}"` : "Featured Products"}
              </h3>
              <div className="text-sm text-slate-500 mt-1">
                Showing <span className="font-semibold text-slate-800">{filteredAndSortedParts.length}</span> parts
              </div>
            </div>
          </div>

          {filteredAndSortedParts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8">
              {filteredAndSortedParts.map((part) => (
                <PartCard key={part.id} part={part} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-6">
                <Search className="h-10 w-10 text-slate-400" />
              </div>
              <h4 className="text-2xl font-bold text-slate-700 mb-2">
                {initialParts.length === 0 ? "Database Connection Required" : "No parts found"}
              </h4>
              <p className="text-slate-500 max-w-md mx-auto">
                {initialParts.length === 0
                  ? "We couldn't load any products from the server. Please check if the Firebase configuration is set correctly."
                  : translations?.home?.noPartsHint || "Try adjusting your search or filters."}
              </p>
            </div>
          )}

          <div className="mt-24">
            <RelatedParts allParts={initialParts} />
          </div>
        </section>
      </main>
      <footer className="bg-secondary text-secondary-foreground py-6 mt-auto">
        <div className="container mx-auto text-center text-sm">
          <p>&copy; {new Date().getFullYear()} RoParts Hub. {translations.footer.rightsReserved}</p>
        </div>

      </footer>
    </div>
  );
}
