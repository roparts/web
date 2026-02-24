
"use client";

import { useEffect, useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, Loader2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { AdBanner } from '@/lib/types';
import { uploadImageAction, deleteImageAction } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";

const adSchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    title_hi: z.string().optional(),
    subtitle: z.string().min(2, 'Subtitle must be at least 2 characters'),
    subtitle_hi: z.string().optional(),
    badge: z.string().optional(),
    badge_hi: z.string().optional(),
    image: z.string().min(1, 'Image is required'),
    imageFileId: z.string().optional(),
    link: z.string().optional(),
    active: z.boolean().default(true),
    order: z.number().default(0),
});

interface EditAdDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    ad: AdBanner | null;
    onSave: (adData: AdBanner) => void;
    onDelete?: (adId: string) => void;
}

export function EditAdDialog({ isOpen, onOpenChange, ad, onSave, onDelete }: EditAdDialogProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [tempImageFileId, setTempImageFileId] = useState<string | null>(null);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof adSchema>>({
        resolver: zodResolver(adSchema),
        defaultValues: {
            title: '',
            title_hi: '',
            subtitle: '',
            subtitle_hi: '',
            badge: '',
            badge_hi: '',
            image: '',
            imageFileId: '',
            link: '',
            active: true,
            order: 0,
        }
    });

    const imageValue = form.watch('image');

    useEffect(() => {
        if (isOpen) {
            form.reset(ad ? {
                title: ad.title,
                title_hi: ad.title_hi || '',
                subtitle: ad.subtitle,
                subtitle_hi: ad.subtitle_hi || '',
                badge: ad.badge || '',
                badge_hi: ad.badge_hi || '',
                image: ad.image,
                imageFileId: ad.imageFileId || '',
                link: ad.link || '',
                active: ad.active,
                order: ad.order || 0,
            } : {
                title: '',
                title_hi: '',
                subtitle: '',
                subtitle_hi: '',
                badge: '',
                badge_hi: '',
                image: '',
                imageFileId: '',
                link: '',
                active: true,
                order: 0,
            });
        }
    }, [isOpen, ad, form]);

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

    const onSubmit = (values: z.infer<typeof adSchema>) => {
        setTempImageFileId(null);
        onSave({
            ...values,
            id: ad?.id || '',
        } as AdBanner);
        onOpenChange(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{ad ? 'Edit Ad Banner' : 'Add Ad Banner'}</DialogTitle>
                    <DialogDescription>
                        Set up the promotional banner shown on the home page.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title (English)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="30% Off Premium" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="title_hi"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title (Hindi)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="प्रीमियम पर 30% की छूट" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="subtitle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subtitle (English)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Upgrade your system..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="subtitle_hi"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subtitle (Hindi)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="अपने सिस्टम को अपग्रेड करें..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="badge"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Badge Label (English)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Limited Time Offer" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="badge_hi"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Badge Label (Hindi)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="सीमित समय का ऑफर" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="link"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Link URL (Optional)</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-2">
                                                    <LinkIcon className="w-4 h-4 text-muted-foreground" />
                                                    <Input placeholder="/part/some-id or https://..." {...field} />
                                                </div>
                                            </FormControl>
                                            <FormDescription>Where the "Shop Now" button leads to.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="order"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Display Order</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="active"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col justify-end pb-2">
                                                <div className="flex items-center gap-2">
                                                    <FormLabel className="mb-0">Active</FormLabel>
                                                    <FormControl>
                                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-4 bg-muted/30 p-4 rounded-xl">
                            {imageValue && (
                                <div className="relative w-full max-w-[400px] h-48 rounded-lg overflow-hidden border bg-white">
                                    <Image
                                        src={imageValue}
                                        alt="Banner Preview"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            )}
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormControl>
                                            <div className="flex items-center justify-center w-full">
                                                <label htmlFor="ad-image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 bg-background transition-colors">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        {isUploading ? <Loader2 className="w-8 h-8 mb-4 animate-spin text-primary" /> : <Upload className="w-8 h-8 mb-4 text-muted-foreground" />}
                                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-primary">Click to upload banner image</span></p>
                                                        <p className="text-xs text-muted-foreground">PNG, JPG recommended (Transparent for best look)</p>
                                                    </div>
                                                    <Input id="ad-image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                                </label>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter className="flex justify-between sm:justify-between w-full">
                            {ad && ad.id && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => onDelete && onDelete(ad.id)}
                                >
                                    Delete
                                </Button>
                            )}
                            <div className="flex gap-2 ml-auto">
                                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                                <Button type="submit" disabled={isUploading}>Save Banner</Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
