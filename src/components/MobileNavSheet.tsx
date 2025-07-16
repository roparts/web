
"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useLanguage } from "@/context/LanguageContext";
import type { MainCategory } from "@/lib/types";

interface MobileNavSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMainCategory: MainCategory;
  onMainCategoryChange: (category: MainCategory) => void;
}

const MAIN_CATEGORIES: MainCategory[] = [
  'Domestic RO Parts',
  'Commercial RO Parts',
  'RO Accessories & Tools',
  'Complete RO Systems',
  'Service Kits & Combo Packs',
];

export function MobileNavSheet({ 
  open, 
  onOpenChange,
  selectedMainCategory,
  onMainCategoryChange
}: MobileNavSheetProps) {
  const { translations, language } = useLanguage();

  const handleCategoryClick = (category: MainCategory) => {
    onMainCategoryChange(category);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex flex-col w-full sm:max-w-xs">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">{translations.categories.title}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-grow my-4">
          <div className="flex flex-col gap-2 pr-4">
            {MAIN_CATEGORIES.map(category => (
              <Button
                key={category}
                variant={selectedMainCategory === category ? 'default' : 'ghost'}
                className="w-full justify-start text-base"
                onClick={() => handleCategoryClick(category)}
              >
                {language === 'hi' ? translations.categories.main[category] : category}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
