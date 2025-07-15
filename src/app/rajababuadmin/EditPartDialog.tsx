"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Part } from '@/lib/types';
import { generateDescriptionAction } from '../actions';
import { useToast } from "@/hooks/use-toast"


const partSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  category: z.string().min(3, 'Category is required'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  features: z.string().min(5, 'Please list at least one feature'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
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

  const form = useForm<z.infer<typeof partSchema>>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      name: '',
      category: '',
      price: 0,
      features: '',
      description: '',
    },
  });

  useEffect(() => {
    if (part) {
      form.reset(part);
    } else {
      form.reset({
        name: '',
        category: '',
        price: 0,
        features: '',
        description: '',
      });
    }
  }, [part, form, isOpen]);

  const handleGenerateDescription = async () => {
    const { name, category, features } = form.getValues();
    if (!name || !category || !features) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in Name, Category, and Features to generate a description.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const description = await generateDescriptionAction({
        partName: name,
        partCategory: category,
        partFeatures: features,
      });
      form.setValue('description', description, { shouldValidate: true });
       toast({
        title: "Description Generated!",
        description: "The AI has created a new description for your part.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate description.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = (values: z.infer<typeof partSchema>) => {
    onSave({
      ...values,
      id: part?.id || '',
      image: part?.image || 'https://placehold.co/400x400.png',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{part ? 'Edit Part' : 'Add New Part'}</DialogTitle>
          <DialogDescription>
            {part ? 'Update the details for this part.' : 'Fill in the details for the new part.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Part Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., AquaPure RO Membrane" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Filters" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
                  <FormLabel>Features</FormLabel>
                   <FormControl>
                    <Input placeholder="e.g., High rejection rate, Long lifespan" {...field} />
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
                    <FormLabel>Description</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={handleGenerateDescription} disabled={isGenerating}>
                      <Wand2 className="mr-2 h-4 w-4" />
                      {isGenerating ? 'Generating...' : 'Generate with AI'}
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea placeholder="A compelling description of the part." className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save Part</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
