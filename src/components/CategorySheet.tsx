
"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useLanguage } from "@/context/LanguageContext";

interface CategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  selectedCategory?: string;
  onCategoryChange: (category: string) => void;
}

export function CategorySheet({ 
  open, 
  onOpenChange, 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: CategorySheetProps) {
  const { translations, language } = useLanguage();

  const handleCategoryClick = (category: string) => {
    onCategoryChange(category);
    onOpenChange(false); // Close sheet after selection
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex flex-col w-full sm:max-w-xs">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">{translations.categories.title}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-grow my-4">
          <div className="flex flex-col gap-2 pr-4">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'ghost'}
                className="w-full justify-start text-base"
                onClick={() => handleCategoryClick(category)}
              >
                {category === 'All' && language === 'hi' ? 'सभी' : category}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
