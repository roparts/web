
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { PlusCircle, Trash2, Edit, ChevronRight } from 'lucide-react';
import type { Brand } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { EditBrandDialog } from './EditBrandDialog';
import { deleteBrand, addBrand, updateBrand } from '@/lib/parts-data-admin';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from "@/components/ui/card"

interface BrandManagerProps {
    initialBrands: Brand[];
    onSelectBrand: (brand: Brand) => void;
}

export function BrandManager({ initialBrands, onSelectBrand }: BrandManagerProps) {
    const [brands, setBrands] = useState<Brand[]>(initialBrands);
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const handleAddNew = () => {
        setSelectedBrand(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (e: React.MouseEvent, brand: Brand) => {
        e.stopPropagation();
        setSelectedBrand(brand);
        setIsDialogOpen(true);
    };

    const handleDelete = async (e: React.MouseEvent, brandId: string) => {
        e.stopPropagation();

        // --- Dependency Check ---
        const brandToDelete = brands.find(b => b.id === brandId);
        const isLegacy = brandId.startsWith('legacy-');

        if (isLegacy) {
            toast({
                variant: "destructive",
                title: "Cannot Delete Legacy Item",
                description: "This brand exists only on products. Please update the products first."
            });
            return;
        }

        // We don't have parts list here to check locally, 
        // but the backend should ideally handle this.
        // However, for consistency with AdminPageClient, we should probably pass parts or a handler.
        // For now, let's at least fix the typo and add a warning.

        if (!confirm("Are you sure you want to delete this brand? Products associated with this brand will remain but become unassigned.")) return;

        try {
            await deleteBrand(brandId);
            setBrands(prev => prev.filter(b => b.id !== brandId));
            toast({
                title: "Brand Deleted",
                description: "The brand has been successfully removed.",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error Deleting Brand",
                description: "Could not delete the brand. Please try again.",
            });
        }
    };

    const handleSave = async (brandData: Brand) => {
        try {
            let savedBrand: Brand;
            if (brandData.id) {
                savedBrand = await updateBrand(brandData);
                setBrands(prev => {
                    const updated = prev.map(b => (b.id === savedBrand.id ? savedBrand : b));
                    return updated.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                });
                toast({ title: "Brand Updated" });
            } else {
                const { id, ...newBrandData } = brandData;
                savedBrand = await addBrand(newBrandData);
                setBrands(prev => {
                    const updated = [...prev, savedBrand];
                    return updated.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                });
                toast({ title: "Brand Added" });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error Saving Brand",
                description: "Please try again."
            });
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight font-headline">Manage Brands</h2>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Brand
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {brands.map(brand => (
                    <Card
                        key={brand.id}
                        className="cursor-pointer hover:shadow-md transition-shadow group relative overflow-hidden"
                        onClick={() => onSelectBrand(brand)}
                    >
                        <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                            <div className="relative w-24 h-24 mb-2">
                                <Image
                                    src={brand.image || 'https://placehold.co/150x150.png?text=No+Logo'}
                                    alt={brand.name}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <h3 className="font-semibold text-lg">{brand.name}</h3>
                            {brand.description && <p className="text-xs text-muted-foreground line-clamp-2">{brand.description}</p>}

                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded p-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => handleEdit(e, brand)}>
                                    <Edit className="h-3 w-3" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={(e) => e.stopPropagation()}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Brand?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will delete the brand. Products associated with this brand will remain but become unassigned.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={(e) => handleDelete(e, brand.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <EditBrandDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                brand={selectedBrand}
                onSave={handleSave}
            />
        </div>
    );
}
