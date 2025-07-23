
"use client";

import { useEffect, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { PlusCircle, Edit, Trash2, LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Part } from '@/lib/types';
import { EditPartDialog } from './EditPartDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import Head from 'next/head';
import { Badge } from '@/components/ui/badge';
import { addPart, deletePart, getPartsAdmin, updatePart } from '@/lib/parts-data-admin';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [parts, setParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const { translations } = useLanguage();
  const t = translations.admin;

  useEffect(() => {
    if (sessionStorage.getItem('ro-admin-auth') === 'true') {
      setIsAuthenticated(true);
    } else {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchParts = async () => {
        setIsLoading(true);
        const fetchedParts = await getPartsAdmin();
        setParts(fetchedParts);
        setIsLoading(false);
      };
      fetchParts();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    // IMPORTANT: This is a simple password check for demonstration purposes.
    // For a real application, use a proper authentication system.
    if (password === 'rajababuadmin') {
      sessionStorage.setItem('ro-admin-auth', 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError(t.incorrectPassword);
    }
  };


  const handleAddNew = () => {
    setEditingPart(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (part: Part) => {
    setEditingPart(part);
    setIsDialogOpen(true);
  };

  const handleDelete = async (partId: string) => {
    if (confirm(t.deleteConfirm)) {
      try {
        await deletePart(partId);
        setParts(prevParts => prevParts.filter(p => p.id !== partId));
      } catch (error) {
        console.error("Failed to delete part", error);
        alert("Could not delete part.");
      }
    }
  };

  const handleSave = async (part: Part) => {
    try {
      if (editingPart) {
        // Update existing part
        const updated = await updatePart(part);
        setParts(prevParts => prevParts.map(p => (p.id === updated.id ? updated : p)));
      } else {
        // Add new part
        const newPart = await addPart(part);
        setParts(prevParts => [newPart, ...prevParts]);
      }
      setIsDialogOpen(false);
    } catch (error) {
       console.error("Failed to save part", error);
       alert("Could not save part.");
    }
  };

  if (isLoading && isAuthenticated) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Head>
            <title>Admin Login</title>
            <meta name="robots" content="noindex, nofollow" />
        </Head>
        <Card className="w-full max-w-sm">
        <CardHeader>
            <CardTitle className="text-2xl font-headline">{t.loginTitle}</CardTitle>
            <CardDescription>
            {t.loginDescription}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="password">{t.passwordLabel}</Label>
                <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
                />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
                <LogIn className="mr-2 h-4 w-4" />
                {t.signInButton}
            </Button>
            </form>
        </CardContent>
        </Card>
      </div>
    );
  }

  const renderPrice = (part: Part) => {
    const hasDiscount = part.discountPrice !== undefined && part.discountPrice < part.price;
    return (
        <div className="flex flex-col">
            {hasDiscount ? (
                <>
                    <span className="font-medium text-destructive">₹{part.discountPrice!.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-muted-foreground line-through">₹{part.price.toLocaleString('en-IN')}</span>
                </>
            ) : (
                <span>₹{part.price.toLocaleString('en-IN')}</span>
            )}
        </div>
    );
  }

  return (
    <>
        <Head>
            <title>Admin Panel</title>
            <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="min-h-screen bg-muted/40">
        <header className="bg-background border-b sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
                 <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="hsl(var(--primary))"/>
                    <path d="M12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18ZM12 10C13.1 10 14 10.9 14 12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12C10 10.9 10.9 10 12 10Z" fill="hsl(var(--accent))"/>
                </svg>
                <h1 className="text-xl sm:text-2xl font-bold font-headline text-primary">{t.headerTitle}</h1>
            </div>
            <Button onClick={handleAddNew} size="sm" className="sm:size-auto">
                <PlusCircle className="mr-0 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t.addNewPart}</span>
            </Button>
            </div>
        </header>
        <main className="container mx-auto p-4 sm:p-6">
            <Card>
            <CardHeader>
                <CardTitle>{t.manageTitle}</CardTitle>
                <CardDescription>{t.manageDescription}</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Table for larger screens */}
                <div className="hidden md:block">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">{t.imageColumn}</TableHead>
                        <TableHead>{t.nameColumn}</TableHead>
                        <TableHead>{t.brandColumn}</TableHead>
                        <TableHead>{t.categoryColumn}</TableHead>
                        <TableHead>{t.priceColumn}</TableHead>
                        <TableHead className="text-right">{t.actionsColumn}</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {parts.map(part => (
                        <TableRow key={part.id}>
                        <TableCell>
                            <Image
                            src={part.image}
                            alt={part.name}
                            width={60}
                            height={60}
                            className="rounded-sm object-cover"
                            />
                        </TableCell>
                        <TableCell className="font-medium">{part.name}</TableCell>
                        <TableCell>{part.brand ? <Badge variant="secondary">{part.brand}</Badge> : '-'}</TableCell>
                        <TableCell>{part.subcategory}</TableCell>
                        <TableCell>{renderPrice(part)}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(part)}>
                            <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(part.id)}>
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </div>
                {/* Card layout for smaller screens */}
                <div className="md:hidden space-y-4">
                {parts.map(part => (
                    <Card key={part.id} className="flex flex-col">
                    <CardContent className="p-4 flex gap-4">
                        <Image
                            src={part.image}
                            alt={part.name}
                            width={64}
                            height={64}
                            className="rounded-md object-cover"
                        />
                        <div className="flex-grow space-y-1">
                            <p className="font-semibold">{part.name}</p>
                            <div className="flex gap-2 items-center">
                                <p className="text-sm text-muted-foreground">{part.subcategory}</p>
                                {part.brand && <Badge variant="secondary">{part.brand}</Badge>}
                            </div>
                            <div className="font-medium">{renderPrice(part)}</div>
                        </div>
                        <div className="flex flex-col justify-between items-center">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(part)}>
                            <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(part.id)}>
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                    </Card>
                ))}
                </div>
            </CardContent>
            </Card>
        </main>

        <EditPartDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            part={editingPart}
            onSave={handleSave}
        />
        </div>
    </>
  );
}
