
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import type { Part, Brand, CategoryEntity, AdBanner } from '@/lib/types';
import { deletePart, addPart, updatePart, addBrand, updateBrand, deleteBrand, addCategory, updateCategory, deleteCategory, addBanner, updateBanner, deleteBanner } from '@/lib/parts-data-admin';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Edit, Tag, Image as ImageIcon, ExternalLink, Eye, EyeOff } from 'lucide-react';
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
import { EditBrandDialog } from './EditBrandDialog';
import { EditCategoryDialog } from './EditCategoryDialog';
import { EditAdDialog } from './EditAdDialog';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BrandManager } from './BrandManager';
import { BrandDetail } from './BrandDetail';

interface AdminPageClientProps {
  initialParts: Part[];
  initialBrands: Brand[];
  initialCategories: CategoryEntity[];
  initialBanners: AdBanner[];
}

type ViewMode = 'parts' | 'brands' | 'brandDetail';

export function AdminPageClient({ initialParts, initialBrands, initialCategories, initialBanners }: AdminPageClientProps) {
  const [parts, setParts] = useState<Part[]>(initialParts);
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [banners, setBanners] = useState<AdBanner[]>(initialBanners);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);


  // Category State
  const [categories, setCategories] = useState<CategoryEntity[]>(initialCategories);

  // Brand Dialog State
  const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
  const [selectedBrandForEdit, setSelectedBrandForEdit] = useState<Brand | null>(null);

  // Category Dialog State
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState<CategoryEntity | null>(null);
  const [categoryDialogType, setCategoryDialogType] = useState<'main' | 'sub'>('main');

  // Ad Dialog State
  const [isAdDialogOpen, setIsAdDialogOpen] = useState(false);
  const [selectedAdForEdit, setSelectedAdForEdit] = useState<AdBanner | null>(null);

  const { translations } = useLanguage();
  const t = translations?.admin || {};
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<ViewMode>('parts');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  useEffect(() => {
    const sortedParts = [...(initialParts || [])].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    setParts(sortedParts);
  }, [initialParts]);

  useEffect(() => {
    setBrands(initialBrands);
  }, [initialBrands]);

  useEffect(() => {
    setBanners(initialBanners);
  }, [initialBanners]);

  // Derived counts for ANALYTICS (Taxonomy Tab)
  // Derived counts and entities for ANALYTICS (Taxonomy Tab)
  // We use the MANAGED lists (brands, categories) combined with legacy/unmanaged data from parts
  const { brandStats, mainCategoryStats, subCategoryStats } = useMemo(() => {
    const countParts = (predicate: (p: Part) => boolean) => (parts || []).filter(predicate).length;

    const managedBrandNames = new Set((brands || []).map(b => b.name));
    const unmanagedBrandsMap = new Map<string, Brand>();
    (parts || []).forEach(p => {
      const bName = p.brand;
      if (bName && !managedBrandNames.has(bName)) {
        unmanagedBrandsMap.set(bName, { id: `legacy-${bName}`, name: bName });
      }
    });

    const allBrands = [...(brands || []), ...Array.from(unmanagedBrandsMap.values())];
    const bStats = allBrands.map(b => ({
      ...b,
      count: countParts(p => p.brandId === b.id || p.brand === b.name),
      isManaged: !b.id.startsWith('legacy-')
    })).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const mainCats = (categories || []).filter(c => c.type === 'main');
    const managedMainCatNames = new Set(mainCats.map(c => c.name));
    const unmanagedMainCatsMap = new Map<string, CategoryEntity>();
    (parts || []).forEach(p => {
      const mcName = p.mainCategory;
      if (mcName && !managedMainCatNames.has(mcName)) {
        unmanagedMainCatsMap.set(mcName, { id: `legacy-mc-${mcName}`, name: mcName, type: 'main' });
      }
    });

    const allMainCats = [...mainCats, ...Array.from(unmanagedMainCatsMap.values())];
    const mcStats = allMainCats.map(c => ({
      ...c,
      count: countParts(p => p.mainCategory === c.name),
      isManaged: !c.id.startsWith('legacy-')
    })).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const subCats = (categories || []).filter(c => c.type === 'sub');
    const managedSubCatNames = new Set(subCats.map(c => c.name));
    const unmanagedSubCatsMap = new Map<string, CategoryEntity>();
    (parts || []).forEach(p => {
      const scName = p.subcategory;
      if (scName && !managedSubCatNames.has(scName)) {
        unmanagedSubCatsMap.set(scName, { id: `legacy-sc-${scName}`, name: scName, type: 'sub' });
      }
    });

    const allSubCats = [...subCats, ...Array.from(unmanagedSubCatsMap.values())];
    const scStats = allSubCats.map(c => ({
      ...c,
      count: countParts(p => p.subcategory === c.name),
      isManaged: !c.id.startsWith('legacy-')
    })).sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return { brandStats: bStats, mainCategoryStats: mcStats, subCategoryStats: scStats };
  }, [parts, brands, categories]);

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
          return updatedParts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
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
          return updatedParts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
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

  // --- Brand Handlers ---
  const handleAddNewBrand = () => {
    setSelectedBrandForEdit(null);
    setIsBrandDialogOpen(true);
  }
  const handleEditBrand = (brand: Brand) => {
    setSelectedBrandForEdit(brand);
    setIsBrandDialogOpen(true);
  }
  const handleSaveBrand = async (brandData: Brand) => {
    try {
      if (brandData.id) {
        await updateBrand(brandData);
        setBrands(prev => prev.map(b => b.id === brandData.id ? brandData : b));
        toast({ title: "Brand Updated" });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = brandData;
        const newBrand = await addBrand(rest);
        setBrands(prev => [...prev, newBrand]);
        toast({ title: "Brand Added" });
      }
      setIsBrandDialogOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Error saving brand" });
    }
  }

  const handleDeleteBrand = async (brandId: string) => {
    // 1. Dependency Check
    const brandToDelete = brands.find(b => b.id === brandId);
    const isLegacy = brandId.startsWith('legacy-');

    if (isLegacy) {
      toast({ variant: "destructive", title: "Cannot Delete Legacy Item", description: "This brand exists only on products. Please update the products first." });
      return;
    }

    const hasProducts = parts.some(p => p.brandId === brandId || (brandToDelete && p.brand === brandToDelete.name));
    if (hasProducts) {
      toast({ variant: "destructive", title: "Cannot Delete Brand", description: "This brand is linked to existing products. Please remove or reassign them first." });
      return;
    }

    if (!confirm("Are you sure you want to delete this brand?")) return;

    try {
      await deleteBrand(brandId); // Assuming deleteBrand exists and handles backend deletion
      setBrands(prev => prev.filter(b => b.id !== brandId));
      setIsBrandDialogOpen(false);
      toast({ title: "Brand Deleted" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error deleting brand" });
    }
  }

  // --- Category Handlers ---
  const handleAddNewCategory = (type: 'main' | 'sub') => {
    setSelectedCategoryForEdit(null);
    setCategoryDialogType(type);
    setIsCategoryDialogOpen(true);
  }
  const handleEditCategory = (cat: CategoryEntity) => {
    setSelectedCategoryForEdit(cat);
    setCategoryDialogType(cat.type);
    setIsCategoryDialogOpen(true);
  }
  const handleSaveCategory = async (catData: CategoryEntity) => {
    try {
      if (catData.id) {
        await updateCategory(catData);
        setCategories(prev => prev.map(c => c.id === catData.id ? catData : c));
        toast({ title: "Category Updated" });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = catData;
        const newCat = await addCategory(rest);
        setCategories(prev => [...prev, newCat]);
        toast({ title: "Category Added" });
      }
      setIsCategoryDialogOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Error saving category" });
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    const catToDelete = categories.find(c => c.id === categoryId);
    const isLegacy = categoryId.startsWith('legacy-');

    if (isLegacy) {
      toast({ variant: "destructive", title: "Cannot Delete Legacy Item", description: "This category exists only on products. Please update the products first." });
      return;
    }

    if (catToDelete) {
      const hasProducts = parts.some(p =>
        (catToDelete.type === 'main' && p.mainCategory === catToDelete.name) ||
        (catToDelete.type === 'sub' && p.subcategory === catToDelete.name)
      );

      if (hasProducts) {
        toast({ variant: "destructive", title: "Cannot Delete Category", description: "This category is linked to existing products. Please remove or reassign them first." });
        return;
      }
    }

    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await deleteCategory(categoryId);
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      setIsCategoryDialogOpen(false);
      toast({ title: "Category Deleted" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error deleting category" });
    }
  }

  const handleSelectBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    setViewMode('brandDetail');
  }

  // --- Ad Handlers ---
  const handleAddNewAd = () => {
    setSelectedAdForEdit(null);
    setIsAdDialogOpen(true);
  }

  const handleEditAd = (ad: AdBanner) => {
    setSelectedAdForEdit(ad);
    setIsAdDialogOpen(true);
  }

  const handleSaveAd = async (adData: AdBanner) => {
    try {
      if (adData.id) {
        await updateBanner(adData);
        setBanners(prev => prev.map(b => b.id === adData.id ? adData : b).sort((a, b) => a.order - b.order));
        toast({ title: "Ad Banner Updated" });
      } else {
        const { id, ...rest } = adData;
        const newAd = await addBanner(rest);
        setBanners(prev => [...prev, newAd].sort((a, b) => a.order - b.order));
        toast({ title: "Ad Banner Added" });
      }
      setIsAdDialogOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Error saving ad" });
    }
  }

  const handleDeleteAd = async (adId: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;
    try {
      await deleteBanner(adId);
      setBanners(prev => prev.filter(b => b.id !== adId));
      setIsAdDialogOpen(false);
      toast({ title: "Ad Banner Deleted" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error deleting ad" });
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">Verifying sessions...</p>
        </div>
      </div>
    );
  }

  // Render content based on viewMode
  const renderContent = () => {
    if (viewMode === 'brands') {
      return <BrandManager initialBrands={brands} onSelectBrand={handleSelectBrand} />;
    }

    if (viewMode === 'brandDetail' && selectedBrand) {
      return <BrandDetail brand={selectedBrand} allParts={parts} onBack={() => setViewMode('brands')} />;
    }

    // Default 'parts' view
    return (
      <>
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight font-headline">{t.manageTitle}</h2>
          <div className="flex items-center space-x-2">
            <Button onClick={() => setViewMode('brands')} variant="outline">
              <Tag className="mr-2 h-4 w-4" /> Manage Brands
            </Button>
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
      </>
    );
  }

  return (
    <>
      <Tabs defaultValue="parts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="parts" onClick={() => setViewMode('parts')}>Manage Parts</TabsTrigger>
          <TabsTrigger value="banners">Manage Ads</TabsTrigger>
          <TabsTrigger value="taxonomy">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="parts">
          {renderContent()}
        </TabsContent>
        <TabsContent value="banners">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight font-headline">Manage Ads</h2>
            <Button onClick={handleAddNewAd}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Ad
            </Button>
          </div>
          <div className="rounded-md border mt-4 bg-white/50 backdrop-blur-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Preview</TableHead>
                  <TableHead>Title \ Subtitle</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      No ad banners found. Click "Add New Ad" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  banners.map(ad => (
                    <TableRow key={ad.id}>
                      <TableCell>
                        <div className="relative w-32 h-16 rounded-md overflow-hidden bg-muted">
                          <Image
                            src={ad.image}
                            alt={ad.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold">{ad.title}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1">{ad.subtitle}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">{ad.order}</span>
                      </TableCell>
                      <TableCell>
                        {ad.active ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <Eye className="w-4 h-4" /> <span>Visible</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-400">
                            <EyeOff className="w-4 h-4" /> <span>Hidden</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleEditAd(ad)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => handleDeleteAd(ad.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="taxonomy">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Brands Stats - First */}
            <Card className="glass-card border-0 bg-transparent">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Brands Stats</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/20" onClick={handleAddNewBrand}>
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>Product distribution by brands.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 pr-4">
                  <ul className="space-y-3">
                    {brandStats.map((brand) => (
                      <li key={brand.id} className="group flex justify-between items-center text-sm p-3 rounded-xl bg-white/30 hover:bg-white/50 transition-colors cursor-pointer border border-transparent hover:border-white/20 shadow-sm" onClick={() => handleSelectBrand(brand)}>
                        <span className="font-medium">{brand.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">{brand.count}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); handleEditBrand(brand); }}>
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Main Categories - Second */}
            <Card className="glass-card border-0 bg-transparent">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Main Categories</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/20" onClick={() => handleAddNewCategory('main')}>
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>All primary categories in your store.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 pr-4">
                  <ul className="space-y-3">
                    {mainCategoryStats.map((cat) => (
                      <li key={cat.id} className="group flex justify-between items-center text-sm p-3 rounded-xl bg-white/30 hover:bg-white/50 transition-colors cursor-pointer border border-transparent hover:border-white/20 shadow-sm">
                        <span className="font-medium">{cat.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">{cat.count}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); handleEditCategory(cat); }}>
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Subcategories - Third */}
            <Card className="glass-card border-0 bg-transparent">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Subcategories</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/20" onClick={() => handleAddNewCategory('sub')}>
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>All subcategories across your store.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 pr-4">
                  <ul className="space-y-3">
                    {subCategoryStats.map((cat) => (
                      <li key={cat.id} className="group flex justify-between items-center text-sm p-3 rounded-xl bg-white/30 hover:bg-white/50 transition-colors cursor-pointer border border-transparent hover:border-white/20 shadow-sm">
                        <span className="font-medium">{cat.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">{cat.count}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); handleEditCategory(cat); }}>
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <EditBrandDialog
            isOpen={isBrandDialogOpen}
            onOpenChange={setIsBrandDialogOpen}
            brand={selectedBrandForEdit}
            onSave={handleSaveBrand}
            onDelete={handleDeleteBrand}
          />

          <EditCategoryDialog
            isOpen={isCategoryDialogOpen}
            onOpenChange={setIsCategoryDialogOpen}
            category={selectedCategoryForEdit}
            onSave={handleSaveCategory}
            onDelete={handleDeleteCategory}
            defaultType={categoryDialogType}
            mainCategories={categories}
          />
        </TabsContent>
      </Tabs>

      <EditPartDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        part={selectedPart}
        onSave={handleSave}
        allParts={parts}
        brandsList={brands}
      />

      <EditAdDialog
        isOpen={isAdDialogOpen}
        onOpenChange={setIsAdDialogOpen}
        ad={selectedAdForEdit}
        onSave={handleSaveAd}
        onDelete={handleDeleteAd}
      />
    </>
  );
}
