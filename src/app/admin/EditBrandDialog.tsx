
"use client";

import { useEffect, useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Brand } from '@/lib/types';
import { uploadImageAction, deleteImageAction } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";

const brandSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
    image: z.string().optional(),
    imageFileId: z.string().optional(),
    whatsappNumber: z.string().optional(),
});

interface EditBrandDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    brand: Brand | null;
    onSave: (brandData: Brand) => void;
    onDelete?: (brandId: string) => void;
}

export function EditBrandDialog({ isOpen, onOpenChange, brand, onSave, onDelete }: EditBrandDialogProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [tempImageFileId, setTempImageFileId] = useState<string | null>(null);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof brandSchema>>({
        resolver: zodResolver(brandSchema),
        defaultValues: {
            name: '',
            description: '',
            image: '',
            imageFileId: '',
            whatsappNumber: '',
        }
    });

    const imageValue = form.watch('image');

    useEffect(() => {
        if (isOpen) {
            form.reset(brand ? {
                name: brand.name,
                description: brand.description || '',
                image: brand.image || '',
                imageFileId: brand.imageFileId || '',
                whatsappNumber: brand.whatsappNumber || '',
            } : {
                name: '',
                description: '',
                image: '',
                imageFileId: '',
                whatsappNumber: '',
            });
        }
    }, [isOpen, brand, form]);

    useEffect(() => {
        if (!isOpen && tempImageFileId) {
            deleteImageAction(tempImageFileId);
            setTempImageFileId(null);
        }
    }, [isOpen, tempImageFileId]);

    const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsUploading(true);
            if (tempImageFileId) {
                await deleteImageAction(tempImageFileId);
                setTempImageFileId(null);
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                try {
                    const base64data = reader.result as string;
                    const { url, fileId } = await uploadImageAction(base64data);
                    form.setValue('image', url, { shouldValidate: true });
                    form.setValue('imageFileId', fileId, { shouldValidate: true });
                    setTempImageFileId(fileId);
                    toast({ title: "Image uploaded successfully!" });
                } catch (error) {
                    console.error("Image upload failed", error);
                    toast({
                        variant: 'destructive',
                        title: "Image upload failed",
                        description: "Please try again.",
                    });
                } finally {
                    setIsUploading(false);
                }
            };
        }
    };

    const onSubmit = (values: z.infer<typeof brandSchema>) => {
        setTempImageFileId(null);
        onSave({
            ...values,
            id: brand?.id || '',
        } as Brand);
        onOpenChange(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{brand ? 'Edit Brand' : 'Add Brand'}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="flex flex-col items-center gap-4">
                            {imageValue && (
                                <Image
                                    src={imageValue}
                                    alt="Brand Logo"
                                    width={100}
                                    height={100}
                                    className="object-contain border rounded-md"
                                />
                            )}
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormControl>
                                            <div className="flex items-center justify-center w-full">
                                                <label htmlFor="brand-image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        {isUploading ? <Loader2 className="w-8 h-8 mb-4 animate-spin text-muted-foreground" /> : <Upload className="w-8 h-8 mb-4 text-muted-foreground" />}
                                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload brand logo</span></p>
                                                    </div>
                                                    <Input id="brand-image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                                </label>
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Brand Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter brand name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="whatsappNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>WhatsApp Number (e.g. 919999999999)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter brand WhatsApp number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Short description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="flex justify-between sm:justify-between w-full">
                            {brand && brand.id && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => onDelete && onDelete(brand.id)}
                                >
                                    Delete
                                </Button>
                            )}
                            <div className="flex gap-2">
                                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                                <Button type="submit" disabled={isUploading}>Save Brand</Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
