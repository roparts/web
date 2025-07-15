
"use client";

import Image from 'next/image';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, X } from "lucide-react";
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WHATSAPP_NUMBER = "919523728080";
const RFQ_COUNTER_KEY = 'roparts-rfq-counter';

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart, itemCount } = useCart();
  const { translations } = useLanguage();

  const getNextRfqNumber = () => {
    let currentCount = 10001; // Starting number
    try {
        const savedCount = localStorage.getItem(RFQ_COUNTER_KEY);
        if (savedCount) {
            const parsedCount = parseInt(savedCount, 10);
            if (!isNaN(parsedCount)) {
                currentCount = parsedCount + 1;
            }
        }
        localStorage.setItem(RFQ_COUNTER_KEY, String(currentCount));
    } catch (error) {
        // LocalStorage might be disabled (e.g., in private browsing)
        console.error("Could not access localStorage for RFQ number:", error);
        // Fallback to a non-sequential number
        return Math.floor(10000 + Math.random() * 90000);
    }
    return currentCount;
  };


  const handleWhatsAppOrder = () => {
    const rfqNumber = getNextRfqNumber();
    const currentDate = new Date().toLocaleDateString('en-GB');

    const productLines = cartItems
      .map(item => `${item.quantity} x ${item.name} (${item.id})`)
      .join('\n');

    const message = `*RFQ from roparts.in*

RFQ Number: ${rfqNumber}
Date: ${currentDate}

Products:
${productLines}

Total: ₹${totalPrice.toLocaleString('en-IN')}
`;
    
    // Manually encode the message to ensure newlines are preserved.
    const encodedMessage = encodeURIComponent(message);

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader className="pr-10">
          <SheetTitle className="font-headline text-2xl">{translations.cart.title} ({itemCount})</SheetTitle>
        </SheetHeader>
        <Separator />
        {cartItems.length > 0 ? (
          <>
            <ScrollArea className="flex-grow my-4">
              <div className="flex flex-col gap-6 pr-6">
                {cartItems.map(item => {
                  const price = item.discountPrice ?? item.price;
                  const categoryKeyword = item.category.split(' ')[0].toLowerCase();
                  return (
                    <div key={item.id} className="flex gap-4">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded-md object-cover"
                        data-ai-hint={`${categoryKeyword} water`}
                      />
                      <div className="flex-grow flex flex-col gap-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">₹{price.toLocaleString('en-IN')}</p>
                        <div className="flex items-center gap-2 mt-auto">
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= (item.minQuantity ?? 1)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-6 text-center">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="mt-4">
              <div className="w-full space-y-4">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>{translations.cart.total}</span>
                  <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                 <Button onClick={handleWhatsAppOrder} className="w-full bg-green-500 hover:bg-green-600 text-white">
                  {translations.cart.getQuote}
                </Button>
                <Button variant="outline" className="w-full" onClick={clearCart}>
                  {translations.cart.clearCart}
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center gap-4 text-center">
            <h3 className="font-headline text-xl">{translations.cart.emptyTitle}</h3>
            <p className="text-muted-foreground">{translations.cart.emptySubtitle}</p>
            <SheetClose asChild>
              <Button>{translations.cart.continueShopping}</Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

    
