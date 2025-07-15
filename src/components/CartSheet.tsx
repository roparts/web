
"use client";

import Image from 'next/image';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, X } from "lucide-react";
import Link from 'next/link';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WHATSAPP_NUMBER = "919523728080";

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart, itemCount } = useCart();

  const handleWhatsAppOrder = () => {
    // Combine a random number with a timestamp for a highly unique RFQ number
    const randomPart = Math.floor(100 + Math.random() * 900).toString();
    const timestampPart = Date.now().toString().slice(-5);
    const rfqNumber = `${randomPart}${timestampPart}`;

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
          <SheetTitle className="font-headline text-2xl">Your Cart ({itemCount})</SheetTitle>
        </SheetHeader>
        <Separator />
        {cartItems.length > 0 ? (
          <>
            <ScrollArea className="flex-grow my-4">
              <div className="flex flex-col gap-6 pr-6">
                {cartItems.map(item => {
                  const price = item.discountPrice ?? item.price;
                  return (
                    <div key={item.id} className="flex gap-4">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded-md object-cover"
                        data-ai-hint={`${item.category} part`}
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
                  <span>Total</span>
                  <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                 <Button onClick={handleWhatsAppOrder} className="w-full bg-green-500 hover:bg-green-600 text-white">
                  Get Quote on WhatsApp
                </Button>
                <Button variant="outline" className="w-full" onClick={clearCart}>
                  Clear Cart
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center gap-4 text-center">
            <h3 className="font-headline text-xl">Your cart is empty</h3>
            <p className="text-muted-foreground">Add some parts to get started!</p>
            <SheetClose asChild>
              <Button>Continue Shopping</Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
