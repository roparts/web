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

const WHATSAPP_NUMBER = "911234567890"; // Replace with your WhatsApp number

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart, itemCount } = useCart();

  const handleWhatsAppOrder = () => {
    const message = `Hello RoParts Hub, I would like to place an order for the following items:\n\n${cartItems
      .map(item => `${item.name} (x${item.quantity}) - ₹${(item.price * item.quantity).toLocaleString('en-IN')}`)
      .join('\n')}\n\n*Total: ₹${totalPrice.toLocaleString('en-IN')}*`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
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
                {cartItems.map(item => (
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
                      <p className="text-sm text-muted-foreground">₹{item.price.toLocaleString('en-IN')}</p>
                      <div className="flex items-center gap-2 mt-auto">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
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
                ))}
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
                  Order on WhatsApp
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
