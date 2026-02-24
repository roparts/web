
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { PlusCircle, ArrowLeft, Trash2, Edit } from 'lucide-react';
import type { Part, Brand } from '@/lib/types';
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
import { AddExistingProductDialog } from './AddExistingProductDialog';
import { CopyPlus } from 'lucide-react';
import { EditPartDialog } from './EditPartDialog';
import { deletePart, addPart, updatePart } from '@/lib/parts-data-admin';
import { useToast } from '@/hooks/use-toast';

interface BrandDetailProps {
    brand: Brand;
    allParts: Part[];
    onBack: () => void;
}

export function BrandDetail({ brand, allParts, onBack }: BrandDetailProps) {
    const brandParts = allParts.filter(p => p.brandId === brand.id || p.brand === brand.name);

    const [parts, setParts] = useState<Part[]>(brandParts);
    const [selectedPart, setSelectedPart] = useState<Part | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAddExistingOpen, setIsAddExistingOpen] = useState(false);
    const { toast } = useToast();

    // ...

    const handleAddNew = () => {
        setSelectedPart(null);
        setIsDialogOpen(true);
    };

    const handleAddExisting = () => {
        setIsAddExistingOpen(true);
    };

    const handleSelectExisting = (part: Part) => {
        const { id, brand: oldBrand, brandId: oldBrandId, ...rest } = part;
        // Create a new part object based on the selected one, but clear ID and set current brand
        const newPartDraft = {
            ...rest,
            id: '', // Empty ID signals creation
            brand: brand.name,
            brandId: brand.id,
        } as Part;

        setSelectedPart(newPartDraft);
        setIsAddExistingOpen(false);
        setIsDialogOpen(true);
    };

    const handleEdit = (part: Part) => {
        setSelectedPart(part);
        setIsDialogOpen(true);
    };

    const handleDelete = async (partId: string) => {
        try {
            await deletePart(partId);
            setParts(prev => prev.filter(p => p.id !== partId));
            toast({ title: "Part Deleted" });
        } catch (error) {
            toast({ variant: "destructive", title: "Error Deleting Part" });
        }
    };

    const handleSave = async (partData: Part) => {
        try {
            // Ensure the part is associated with this brand
            const dataToSave = {
                ...partData,
                brandId: brand.id,
                brand: brand.name, // Support legacy string field
            };

            let savedPart: Part;
            if (dataToSave.id) {
                savedPart = await updatePart(dataToSave);
                setParts(prev => prev.map(p => p.id === savedPart.id ? savedPart : p));
                toast({ title: "Part Updated" });
            } else {
                const { id, ...newData } = dataToSave;
                savedPart = await addPart(newData);
                setParts(prev => [...prev, savedPart]);
                toast({ title: "Part Added" });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error Saving Part" });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold font-headline">{brand.name}</h2>
                    <p className="text-sm text-muted-foreground">{parts.length} Products</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button onClick={handleAddExisting} variant="outline">
                        <CopyPlus className="mr-2 h-4 w-4" /> Add Existing Product
                    </Button>
                    <Button onClick={handleAddNew}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Product to Brand
                    </Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60px]">Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {parts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No products found in this brand. Add one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            parts.map(part => (
                                <TableRow key={part.id}>
                                    <TableCell>
                                        <Image src={part.image} alt={part.name} width={40} height={40} className="rounded object-cover" />
                                    </TableCell>
                                    <TableCell className="font-medium">{part.name}</TableCell>
                                    <TableCell>{part.subcategory}</TableCell>
                                    <TableCell className="text-right">₹{part.price}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button variant="outline" size="icon" onClick={() => handleEdit(part)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="icon">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Part?</AlertDialogTitle>
                                                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(part.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <EditPartDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                part={selectedPart}
                onSave={handleSave}
                allParts={allParts}
                brandsList={[brand]}
            />

            <AddExistingProductDialog
                isOpen={isAddExistingOpen}
                onOpenChange={setIsAddExistingOpen}
                allParts={allParts}
                onSelectProduct={handleSelectExisting}
            />
        </div>
    );
}
