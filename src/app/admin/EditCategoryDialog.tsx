
"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CategoryEntity } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const categorySchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    type: z.enum(['main', 'sub']),
    parentId: z.string().optional(),
});

interface EditCategoryDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    category: CategoryEntity | null;
    onSave: (categoryData: CategoryEntity) => void;
    onDelete?: (categoryId: string) => void;
    defaultType?: 'main' | 'sub';
    mainCategories?: CategoryEntity[]; // For parent linkage if needed in future
}

export function EditCategoryDialog({ isOpen, onOpenChange, category, onSave, onDelete, defaultType = 'main', mainCategories = [] }: EditCategoryDialogProps) {
    const { toast } = useToast();

    const form = useForm<z.infer<typeof categorySchema>>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: '',
            type: defaultType,
            parentId: 'none',
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (category) {
                form.reset({
                    name: category.name,
                    type: category.type,
                    parentId: category.parentId || 'none',
                });
            } else {
                form.reset({
                    name: '',
                    type: defaultType,
                    parentId: 'none',
                });
            }
        }
    }, [isOpen, category, defaultType, form]);

    const onSubmit = (values: z.infer<typeof categorySchema>) => {
        const parentId = values.parentId === 'none' ? undefined : values.parentId;
        onSave({
            id: category?.id || '',
            name: values.name,
            type: values.type,
            parentId,
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{category ? 'Edit Category' : 'Add Category'}</DialogTitle>
                    <DialogDescription>
                        {category ? 'Update the category details.' : 'Create a new category.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Category Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Hidden field for type, as we usually enforce it via props, but can be exposed if needed */}
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem className="hidden">
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {defaultType === 'sub' && (
                            <FormField
                                control={form.control}
                                name="parentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Main Category (Optional Parent)</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Parent Category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {mainCategories.filter(c => c.type === 'main').map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <DialogFooter className="flex justify-between sm:justify-between w-full">
                            {category && category.id && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => onDelete && onDelete(category.id)}
                                >
                                    Delete
                                </Button>
                            )}
                            <div className="flex gap-2">
                                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                                <Button type="submit">Save changes</Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
