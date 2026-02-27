
"use client";

import { useState } from 'react';
import { PlusCircle, Edit, Trash2, FolderTree, Tag } from 'lucide-react';
import type { CategoryEntity } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface CategoryManagerProps {
    categories: CategoryEntity[];
    onAdd: (type: 'main' | 'sub') => void;
    onEdit: (category: CategoryEntity) => void;
    onDelete: (id: string) => void;
    stats: {
        main: (CategoryEntity & { count: number; isManaged: boolean })[];
        sub: (CategoryEntity & { count: number; isManaged: boolean })[];
    };
}

export function CategoryManager({ categories, onAdd, onEdit, onDelete, stats }: CategoryManagerProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-headline">Taxonomy Management</h2>
                    <p className="text-muted-foreground">Manage your store's categories and subcategories.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => onAdd('main')} variant="outline">
                        <FolderTree className="mr-2 h-4 w-4" /> Add Main Category
                    </Button>
                    <Button onClick={() => onAdd('sub')}>
                        <Tag className="mr-2 h-4 w-4" /> Add Subcategory
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Main Categories */}
                <Card className="glass-card border-0 bg-white/50 backdrop-blur-md shadow-lg overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-4">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <FolderTree className="h-5 w-5 text-primary" />
                            Main Categories
                        </CardTitle>
                        <CardDescription>Primary groupings for your products.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[500px]">
                            <Table>
                                <TableHeader className="bg-muted/30 sticky top-0 z-10">
                                    <TableRow>
                                        <TableHead className="pl-6">Name</TableHead>
                                        <TableHead>Products</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.main.map((cat) => (
                                        <TableRow key={cat.id} className="hover:bg-primary/5 transition-colors">
                                            <TableCell className="font-medium pl-6">{cat.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-mono">
                                                    {cat.count}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {cat.isManaged ? (
                                                    <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Managed</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">Legacy</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(cat)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(cat.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Subcategories */}
                <Card className="glass-card border-0 bg-white/50 backdrop-blur-md shadow-lg overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-4">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Tag className="h-5 w-5 text-primary" />
                            Subcategories
                        </CardTitle>
                        <CardDescription>Specific classifications within categories.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[500px]">
                            <Table>
                                <TableHeader className="bg-muted/30 sticky top-0 z-10">
                                    <TableRow>
                                        <TableHead className="pl-6">Name</TableHead>
                                        <TableHead>Products</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stats.sub.map((cat) => (
                                        <TableRow key={cat.id} className="hover:bg-primary/5 transition-colors">
                                            <TableCell className="font-medium pl-6">{cat.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-mono">
                                                    {cat.count}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {cat.isManaged ? (
                                                    <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Managed</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">Legacy</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(cat)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(cat.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
