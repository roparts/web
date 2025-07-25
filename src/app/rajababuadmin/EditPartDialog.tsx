
"use client";

import { useEffect, useState, type ChangeEvent, useMemo } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Wand2, Upload, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Part } from '@/lib/types';
import { generateDescriptionAction, uploadImageAction, deleteImageAction, generateImageAction } from '@/app/actions';
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from '@/context/LanguageContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const partSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  mainCategory: z.string().min(3, 'Main Category is required'),
  subcategory: z.string().min(3, 'Subcategory is required'),
  brand: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  discountPrice: z.coerce.number().optional(),
  features: z.string().min(5, 'Please list at least one feature'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  image: z.string().min(1, "An image is required.").url("Must be a valid URL."),
  imageFileId: z.string().optional(), // Add imageFileId to the schema
  minQuantity: z.coerce.number().min(1, 'Minimum quantity must be at least 1').optional(),
});

interface EditPartDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  part: Part | null;
  onSave: (partData: Part) => void;
  allParts: Part[];
}

const NO_BRAND_VALUE = "no-brand";

export function EditPartDialog({ isOpen, onOpenChange, part, onSave, allParts }: EditPartDialogProps) {
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [tempImageFileId, setTempImageFileId] = useState<string | null>(null);
  const { toast } = useToast();
  const { translations } = useLanguage();
  const t = translations.admin;

  const { mainCategories, subcategories, brands } = useMemo(() => {
    const mainCatSet = new Set<string>();
    const subCatSet = new Set<string>();
    const brandSet = new Set<string>();
    allParts.forEach(p => {
        if(p.mainCategory) mainCatSet.add(p.mainCategory);
        if(p.subcategory) subCatSet.add(p.subcategory);
        if(p.brand) brandSet.add(p.brand);
    });
    return {
        mainCategories: Array.from(mainCatSet).sort(),
        subcategories: Array.from(subCatSet).sort(),
        brands: Array.from(brandSet).sort(),
    }
  }, [allParts]);


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
      image: 'https://placehold.co/600x600.png',
      imageFileId: '',
      minQuantity: 1,
    },
  });

  const imageValue = form.watch('image');

  const resetDialogState = () => {
    form.reset();
    setTempImageFileId(null);
    setIsGeneratingDesc(false);
    setIsGeneratingImg(false);
    setIsUploading(false);
  }

  useEffect(() => {
    if (isOpen) {
      if (part) {
        form.reset({
          ...part,
          brand: part.brand || '',
          discountPrice: part.discountPrice ?? undefined,
          minQuantity: part.minQuantity ?? 1,
          imageFileId: part.imageFileId ?? '',
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
          image: 'https://placehold.co/600x600.png',
          imageFileId: '',
          minQuantity: 1,
        });
      }
    } else {
       // When dialog is closed, clean up any unsaved temporary image.
      if (tempImageFileId) {
        deleteImageAction(tempImageFileId);
      }
      resetDialogState();
    }
  }, [part, isOpen]);

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
      reader.onerror = (error) => {
        console.error("FileReader error", error);
        toast({
            variant: 'destructive',
            title: "Could not read file",
            description: "Please try a different image.",
        });
        setIsUploading(false);
      }
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

    setIsGeneratingDesc(true);
    try {
      const description = await generateDescriptionAction({
        partName: name,
        partCategory: subcategory,
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
      setIsGeneratingDesc(false);
    }
  };

  const handleGenerateImage = async () => {
    const { name, subcategory } = form.getValues();
     if (!name || !subcategory) {
      toast({
        variant: "destructive",
        title: t.toast.missingInfoTitle,
        description: "Please fill in Name and Category to generate an image.",
      });
      return;
    }
    
    setIsGeneratingImg(true);
    if (tempImageFileId) {
      await deleteImageAction(tempImageFileId);
      setTempImageFileId(null);
    }

    try {
        const { url, fileId } = await generateImageAction({ partName: name, partCategory: subcategory });
        form.setValue('image', url, { shouldValidate: true });
        form.setValue('imageFileId', fileId, { shouldValidate: true });
        setTempImageFileId(fileId);
        toast({
            title: "AI Image Generated!",
            description: "A new image has been generated for your part.",
        });

    } catch (error) {
        console.error("AI image generation failed:", error);
        toast({
            variant: 'destructive',
            title: "AI Image Generation Failed",
            description: "Please try again or upload an image manually.",
        });
    } finally {
        setIsGeneratingImg(false);
    }
  };

  const onSubmit = (values: z.infer<typeof partSchema>) => {
    setTempImageFileId(null); 
    const finalValues = {
        ...values,
        brand: values.brand === NO_BRAND_VALUE ? '' : values.brand,
    }

    onSave({
      ...(finalValues as any),
      id: part?.id || '',
    });
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (tempImageFileId) {
        deleteImageAction(tempImageFileId).catch(err => console.error("Failed to delete temp image on close:", err));
      }
      resetDialogState();
    }
    onOpenChange(open);
  }

  const isGenerating = isGeneratingDesc || isGeneratingImg || isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
                        onError={(e) => e.currentTarget.src = 'https://placehold.co/128x128.png'}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem className="w-full">
                           <FormLabel className="sr-only">Image</FormLabel>
                            <FormControl>
                                <div className="w-full grid grid-cols-2 gap-2">
                                    <Input 
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={isGenerating}
                                    />
                                    <Button asChild variant="outline" className="w-full" disabled={isGenerating}>
                                        <label htmlFor="image-upload" className="cursor-pointer flex items-center justify-center">
                                            {isUploading ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Upload className="mr-2 h-4 w-4" />
                                            )}
                                            {isUploading ? "Uploading..." : t.uploadImageButton}
                                        </label>
                                    </Button>
                                    <Button type="button" variant="outline" className="w-full" onClick={handleGenerateImage} disabled={isGenerating}>
                                        {isGeneratingImg ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Sparkles className="mr-2 h-4 w-4" />
                                        )}
                                        {isGeneratingImg ? t.generatingButton : t.generateImageButton}
                                    </Button>
                                </div>
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
                 
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mainCategory"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Main Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a main category" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {mainCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>
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
                         <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={t.categoryPlaceholder} />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {subcategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.brandLabel}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} >
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={t.brandPlaceholder} />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value={NO_BRAND_VALUE}>None</SelectItem>
                                {brands.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
                            </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          {isGeneratingDesc ? t.generatingButton : t.generateButton}
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
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>{t.cancelButton}</Button>
              <Button type="submit">{t.saveButton}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
