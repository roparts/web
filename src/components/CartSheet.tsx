
"use client";

import Image from 'next/image';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, Phone } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';
import { getAllBrands } from "@/lib/parts-data-server";
import type { Brand } from "@/lib/types";
import { useEffect, useState } from "react";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WHATSAPP_NUMBER = "919523728080";
const RFQ_COUNTER_KEY = 'roparts-rfq-counter';

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart, itemCount } = useCart();
  const { translations } = useLanguage();
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    getAllBrands().then(setBrands);
  }, []);

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


  const handleWhatsAppOrder = (brandName?: string) => {
    const rfqNumber = getNextRfqNumber();
    const currentDate = new Date().toLocaleDateString('en-GB');

    // Filter items by brand if a brandName is provided
    const itemsToOrder = brandName
      ? cartItems.filter(item => (item.brand || 'Unbranded') === brandName)
      : cartItems;

    if (itemsToOrder.length === 0) return;

    // Determine target WhatsApp ID
    let targetNumber = WHATSAPP_NUMBER;
    if (brandName) {
      const brand = brands.find(b => b.name === brandName);
      if (brand && brand.whatsappNumber) {
        targetNumber = brand.whatsappNumber;
      }
    }

    const productLines = itemsToOrder
      .map(item => `${item.quantity} x ${item.name} (${item.id})`)
      .join('\n');

    const brandHeader = brandName ? ` for ${brandName}` : '';

    const message = `*RFQ from roparts.in${brandHeader}*
    
RFQ Number: ${rfqNumber}
Date: ${currentDate}

Products:
${productLines}

Total: ₹${itemsToOrder.reduce((acc, item) => acc + (item.discountPrice ?? item.price) * item.quantity, 0).toLocaleString('en-IN')}
`;

    // Manually encode the message to ensure newlines are preserved.
    const encodedMessage = encodeURIComponent(message);

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetNumber}&text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  // Group items by brand
  const brandGroups = Array.from(new Set(cartItems.map(item => item.brand || 'Unbranded')));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg p-0 border-none bg-transparent overflow-visible">
        <div className="flex flex-col h-full water-splash-container ml-4 my-4 rounded-3xl">
          <div className="water-splash-bg" />

          <SheetHeader className="pt-10 px-8 pb-6 bg-white/40 backdrop-blur-sm border-b border-white/20">
            <SheetTitle className="text-3xl water-title">
              {translations.cart.title} <span className="text-sky-500/50 ml-1">/{itemCount}</span>
            </SheetTitle>
          </SheetHeader>

          {cartItems.length > 0 ? (
            <>
              <ScrollArea className="flex-grow px-6 py-6 scrollbar-hide">
                <div className="flex flex-col gap-4">
                  {cartItems.map(item => {
                    const price = item.discountPrice ?? item.price;
                    return (
                      <div key={item.id} className="flex gap-4 minimal-cart-item group">
                        <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-white shadow-sm border border-white/50">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover p-1.5 scale-95 group-hover:scale-100 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-grow flex flex-col justify-between py-0.5">
                          <div>
                            <h3 className="font-bold text-base leading-tight text-slate-800 line-clamp-2">{item.name}</h3>
                            <p className="text-sky-600 font-bold mt-0.5">₹{price.toLocaleString('en-IN')}</p>
                          </div>

                          <div className="flex items-center justify-between mt-auto">
                            <div className="quantity-control">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= (item.minQuantity ?? 1)}
                                className="quantity-btn"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="font-bold text-slate-700 min-w-[1.5rem] text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="quantity-btn"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            <button
                              className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <SheetFooter className="px-8 py-8 bg-white/40 backdrop-blur-md border-t border-white/20 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                <div className="w-full space-y-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium text-lg">{translations.cart.total}</span>
                    <span className="text-3xl font-black text-slate-900">₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {brandGroups.map(brandName => (
                      <Button
                        key={brandName}
                        onClick={() => handleWhatsAppOrder(brandName)}
                        className="water-btn w-full h-14 text-lg"
                      >
                        <Phone className="mr-2 h-5 w-5 fill-white/20" />
                        {translations.cart.getQuote} {brandGroups.length > 1 ? `(${brandName})` : ''}
                      </Button>
                    ))}

                    <button
                      onClick={clearCart}
                      className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors py-2"
                    >
                      {translations.cart.clearCart}
                    </button>
                  </div>
                </div>
              </SheetFooter>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center gap-6 text-center px-12 relative">
              <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mb-1">
                <div className="w-12 h-12 bg-sky-500/10 rounded-full animate-ping absolute" />
                <div className="relative z-10 text-sky-500">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">{translations.cart.emptyTitle}</h3>
                <p className="text-slate-500 text-sm max-w-[180px] mx-auto leading-relaxed">{translations.cart.emptySubtitle}</p>
              </div>
              <SheetClose asChild>
                <Button className="water-btn-outline px-8 h-12 mt-2">
                  {translations.cart.continueShopping}
                </Button>
              </SheetClose>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>

  );
}
