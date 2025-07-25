
"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { PlusCircle, Trash2, Edit } from 'lucide-react';

import type { Part } from '@/lib/types';
import { deletePart, addPart, updatePart } from '@/lib/parts-data-admin';
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
import { EditPartDialog } from './EditPartDialog';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AdminPageClientProps {
    initialParts: Part[];
}

export function AdminPageClient({ initialParts }: AdminPageClientProps) {
  const [parts, setParts] = useState<Part[]>(initialParts);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { translations } = useLanguage();
  const t = translations.admin;
  const { toast } = useToast();

  useEffect(() => {
    const sortedParts = [...initialParts].sort((a, b) => a.name.localeCompare(b.name));
    setParts(sortedParts);
  }, [initialParts]);

  const { mainCategories, subcategories, brands } = useMemo(() => {
    const mainCategoryCounts = new Map<string, number>();
    const subcategoryCounts = new Map<string, number>();
    const brandCounts = new Map<string, number>();

    parts.forEach(part => {
      // Main Categories
      if (part.mainCategory) {
        mainCategoryCounts.set(part.mainCategory, (mainCategoryCounts.get(part.mainCategory) || 0) + 1);
      }
      // Subcategories
      if (part.subcategory) {
        subcategoryCounts.set(part.subcategory, (subcategoryCounts.get(part.subcategory) || 0) + 1);
      }
      // Brands
      if (part.brand) {
        brandCounts.set(part.brand, (brandCounts.get(part.brand) || 0) + 1);
      }
    });

    return {
      mainCategories: Array.from(mainCategoryCounts.entries()).sort((a,b) => a[0].localeCompare(b[0])),
      subcategories: Array.from(subcategoryCounts.entries()).sort((a,b) => a[0].localeCompare(b[0])),
      brands: Array.from(brandCounts.entries()).sort((a,b) => a[0].localeCompare(b[0])),
    };
  }, [parts]);

  const handleAddNew = () => {
    setSelectedPart(null);
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
      toast({
        title: "Part Deleted",
        description: "The part has been successfully removed.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Deleting Part",
        description: "Could not delete the part. Please try again.",
      });
    }
  };

 const handleSave = async (partData: Part) => {
    try {
      let savedPart: Part;
      if (partData.id) {
        savedPart = await updatePart(partData);
        setParts(prev => {
          const updatedParts = prev.map(p => (p.id === savedPart.id ? savedPart : p));
          return updatedParts.sort((a, b) => a.name.localeCompare(b.name));
        });
        toast({
          title: "Part Updated",
          description: "The part details have been saved.",
        });
      } else {
        const { id, ...newPartData } = partData;
        savedPart = await addPart(newPartData);
        setParts(prev => {
           const updatedParts = [...prev, savedPart];
           return updatedParts.sort((a, b) => a.name.localeCompare(b.name));
        });
        toast({
          title: "Part Added",
          description: "The new part has been added to the catalog.",
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: "Save Failed",
        description: `Could not save the part. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  return (
    <>
      <Tabs defaultValue="parts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="parts">Manage Parts</TabsTrigger>
          <TabsTrigger value="taxonomy">Manage Categories & Brands</TabsTrigger>
        </TabsList>
        <TabsContent value="parts">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight font-headline">{t.manageTitle}</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> {t.addNewPart}
                    </Button>
                </div>
            </div>
            <div className="rounded-md border mt-4">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[80px]">{t.imageColumn}</TableHead>
                    <TableHead>{t.nameColumn}</TableHead>
                    <TableHead>{t.categoryColumn}</TableHead>
                    <TableHead>{t.brandColumn}</TableHead>
                    <TableHead className="text-right">{t.priceColumn}</TableHead>
                    <TableHead className="text-center">{t.actionsColumn}</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {parts.map(part => (
                    <TableRow key={part.id}>
                    <TableCell>
                        <Image
                        src={part.image}
                        alt={part.name}
                        width={48}
                        height={48}
                        className="rounded-md object-cover"
                        />
                    </TableCell>
                    <TableCell className="font-medium">{part.name}</TableCell>
                    <TableCell>{part.subcategory}</TableCell>
                    <TableCell>{part.brand || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                        {part.discountPrice ? (
                            <div className="flex flex-col">
                                <span className="font-bold">₹{part.discountPrice.toLocaleString('en-IN')}</span>
                                <span className="text-xs text-muted-foreground line-through">₹{part.price.toLocaleString('en-IN')}</span>
                            </div>
                        ) : (
                            `₹${part.price.toLocaleString('en-IN')}`
                        )}
                    </TableCell>
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
                                <AlertDialogTitle>{t.deleteConfirm}</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the part from the database.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(part.id)}>
                                Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </div>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </div>
        </TabsContent>
        <TabsContent value="taxonomy">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Main Categories</CardTitle>
                        <CardDescription>All primary categories in your store.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-96">
                            <ul className="space-y-2">
                                {mainCategories.map(([name, count]) => (
                                    <li key={name} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-muted">
                                        <span>{name}</span>
                                        <span className="font-mono text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">{count}</span>
                                    </li>
                                ))}
                            </ul>
                        </ScrollArea>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Subcategories</CardTitle>
                        <CardDescription>All subcategories across your store.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <ScrollArea className="h-96">
                            <ul className="space-y-2">
                                {subcategories.map(([name, count]) => (
                                     <li key={name} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-muted">
                                        <span>{name}</span>
                                        <span className="font-mono text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">{count}</span>
                                    </li>
                                ))}
                            </ul>
                        </ScrollArea>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Brands</CardTitle>
                        <CardDescription>All brands available in your store.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-96">
                            <ul className="space-y-2">
                                {brands.map(([name, count]) => (
                                    <li key={name} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-muted">
                                        <span>{name}</span>
                                        <span className="font-mono text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">{count}</span>
                                    </li>
                                ))}
                            </ul>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
       </Tabs>
      
      <EditPartDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        part={selectedPart}
        onSave={handleSave}
        allParts={parts}
      />
    </>
  );
}
