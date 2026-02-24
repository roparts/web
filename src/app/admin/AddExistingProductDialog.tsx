
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus } from 'lucide-react';
import Image from 'next/image';
import type { Part } from '@/lib/types';

interface AddExistingProductDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    allParts: Part[];
    onSelectProduct: (part: Part) => void;
}

export function AddExistingProductDialog({ isOpen, onOpenChange, allParts, onSelectProduct }: AddExistingProductDialogProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredParts = allParts.filter(part =>
        part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.subcategory.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add Existing Product</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                            {filteredParts.length === 0 ? (
                                <p className="text-center text-sm text-muted-foreground py-8">No products found.</p>
                            ) : (
                                filteredParts.map(part => (
                                    <div key={part.id} className="flex items-center justify-between p-2 rounded-md border hover:bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-10 h-10 rounded overflow-hidden border">
                                                <Image
                                                    src={part.image}
                                                    alt={part.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{part.name}</p>
                                                <p className="text-xs text-muted-foreground">{part.subcategory}</p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="secondary" onClick={() => onSelectProduct(part)}>
                                            <Plus className="mr-2 h-3 w-3" /> Select
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
