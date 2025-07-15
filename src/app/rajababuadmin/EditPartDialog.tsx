
"use client";

import { useEffect, useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Wand2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Part } from '@/lib/types';
import { generateDescriptionAction } from '../actions';
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from '@/context/LanguageContext';
import { ScrollArea } from '@/components/ui/scroll-area';

const partSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  mainCategory: z.string().min(3, 'Main Category is required'),
  subcategory: z.string().min(3, 'Subcategory is required'),
  brand: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  discountPrice: z.coerce.number().optional(),
  features: z.string().min(5, 'Please list at least one feature'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  image: z.string().min(1, "An image is required."), // Accepts URL or data URI
  minQuantity: z.coerce.number().min(1, 'Minimum quantity must be at least 1').optional(),
});

interface EditPartDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  part: Part | null;
  onSave: (partData: Part) => void;
}

export function EditPartDialog({ isOpen, onOpenChange, part, onSave }: EditPartDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { translations } = useLanguage();
  const t = translations.admin;

  const form = useForm<z.infer<typeof partSchema>>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      name: '',
      mainCategory: 'Domestic RO Parts',
      subcategory: '',
      brand: '',
      price: 0,
      discountPrice: undefined,
      features: '',
      description: '',
      image: 'https://placehold.co/400x400.png',
      minQuantity: 1,
    },
  });

  const imageValue = form.watch('image');

  useEffect(() => {
    if (isOpen) {
      if (part) {
        form.reset({
          ...part,
          brand: part.brand ?? '',
          discountPrice: part.discountPrice ?? undefined,
          minQuantity: part.minQuantity ?? 1,
        });
      } else {
        form.reset({
          name: '',
          mainCategory: 'Domestic RO Parts',
          subcategory: '',
          brand: '',
          price: 0,
          discountPrice: undefined,
          features: '',
          description: '',
          image: 'https://placehold.co/400x400.png',
          minQuantity: 1,
        });
      }
    }
  }, [part, form, isOpen]);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('image', reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };


  const handleGenerateDescription = async () => {
    const { name, subcategory, features } = form.getValues();
    if (!name || !subcategory || !features) {
      toast({
        variant: "destructive",
        title: t.toast.missingInfoTitle,
        description: t.toast.missingInfoDescription,
      });
      return;
    }

    setIsGenerating(true);
    try {
      const description = await generateDescriptionAction({
        partName: name,
        partCategory: subcategory, // Use subcategory for generation
        partFeatures: features,
      });
      form.setValue('description', description, { shouldValidate: true });
       toast({
        title: t.toast.generationSuccessTitle,
        description: t.toast.generationSuccessDescription,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: t.toast.generationFailedTitle,
        description: t.toast.generationFailedDescription,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = (values: z.infer<typeof partSchema>) => {
    onSave({
      ...(values as any), // Cast to any to bypass type errors on schema mismatch
      id: part?.id || '', // Keep existing ID if editing
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{part ? t.editDialogTitle : t.addDialogTitle}</DialogTitle>
          <DialogDescription>
            {part ? t.editDialogDescription : t.addDialogDescription}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
             <ScrollArea className="h-[70vh] pr-6">
              <div className="space-y-4 py-4">
                <div className="flex flex-col items-center gap-4">
                    {imageValue && (
                      <Image
                        src={imageValue}
                        alt="Part preview"
                        width={128}
                        height={128}
                        className="rounded-md object-cover border"
                        onError={(e) => e.currentTarget.src = 'https://placehold.co/400x400.png'}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem className="w-full">
                           <FormLabel className="sr-only">Image</FormLabel>
                            <FormControl>
                                <>
                                    <Input 
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                    <Button asChild variant="outline" className="w-full">
                                        <label htmlFor="image-upload" className="cursor-pointer flex items-center justify-center">
                                            <Upload className="mr-2 h-4 w-4" />
                                            {t.uploadImageButton}
                                        </label>
                                    </Button>
                                </>
                            </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.partNameLabel}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.partNamePlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.brandLabel}</FormLabel>
                      <FormControl>
                        <Input placeholder={t.brandPlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <div className="grid grid-cols-2 gap-4">
                   <FormField
                    control={form.control}
                    name="mainCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Domestic RO Parts" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.categoryLabel}</FormLabel>
                        <FormControl>
                          <Input placeholder={t.categoryPlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.priceLabel}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="discountPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.discountPriceLabel}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder={t.optionalPlaceholder} {...field} value={field.value ?? ''}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.minQuantityLabel}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder={t.minQuantityPlaceholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <FormField
                  control={form.control}
                  name="features"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.featuresLabel}</FormLabel>
                       <FormControl>
                        <Input placeholder={t.featuresPlaceholder} {...field} />
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
                      <div className="flex justify-between items-center">
                        <FormLabel>{t.descriptionLabel}</FormLabel>
                        <Button type="button" variant="outline" size="sm" onClick={handleGenerateDescription} disabled={isGenerating}>
                          <Wand2 className="mr-2 h-4 w-4" />
                          {isGenerating ? t.generatingButton : t.generateButton}
                        </Button>
                      </div>
                      <FormControl>
                        <Textarea placeholder={t.descriptionPlaceholder} className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{t.cancelButton}</Button>
              <Button type="submit">{t.saveButton}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

    