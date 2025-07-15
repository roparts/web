
"use client";

import { useEffect, useState, type FormEvent } from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import { PlusCircle, Edit, Trash2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { partsData } from '@/lib/parts-data';
import type { Part } from '@/lib/types';
import { EditPartDialog } from './EditPartDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import Head from 'next/head';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [parts, setParts] = useState<Part[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const { translations } = useLanguage();
  const t = translations.admin;

  useEffect(() => {
    // Check session storage for authentication status on component mount
    if (sessionStorage.getItem('ro-admin-auth') === 'true') {
      setIsAuthenticated(true);
      setParts(partsData); // Load parts data only after authentication
    }
  }, []);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (password === 'rajababuadmin') {
      sessionStorage.setItem('ro-admin-auth', 'true');
      setIsAuthenticated(true);
      setParts(partsData); // Load parts data
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

  const handleDelete = (partId: string) => {
    if (confirm(t.deleteConfirm)) {
      setParts(prevParts => prevParts.filter(p => p.id !== partId));
    }
  };

  const handleSave = (part: Part) => {
    if (editingPart) {
      // Update existing part
      setParts(prevParts => prevParts.map(p => (p.id === part.id ? part : p)));
    } else {
      // Add new part
      setParts(prevParts => [{ ...part, id: `ROP-${Date.now()}` }, ...prevParts]);
    }
    setIsDialogOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <>
        <Head>
            <meta name="robots" content="noindex, nofollow" />
            <title>Admin Login</title>
        </Head>
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
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
      </>
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
            <meta name="robots" content="noindex, nofollow" />
            <title>Admin Panel</title>
        </Head>
        <div className="min-h-screen bg-muted/40">
        <header className="bg-background border-b sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary"><path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="hsl(var(--primary))" /><path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM5.5 16.5L12 20L18.5 16.5V8.5L12 5L5.5 8.5V16.5Z" stroke="hsl(var(--primary-foreground))" strokeOpacity="0.5" /><path d="M10.1929 14.5459C9.92133 13.9284 9.75 13.2388 9.75 12.5C9.75 10.2909 11.5409 8.5 13.75 8.5C14.0322 8.5 14.3069 8.53501 14.5682 8.59868C14.0736 8.01991 13.3364 7.66667 12.5 7.66667C10.597 7.66667 9 9.26364 9 11.1667C9 12.4293 9.70469 13.5357 10.6978 14.1613L10.1929 14.5459Z" fill="hsl(var(--accent))"/><path d="M12 12.5C12 11.12 13.12 10 14.5 10C15.88 10 17 11.12 17 12.5C17 13.88 15.88 15 14.5 15C13.12 15 12 13.88 12 12.5Z" fill="hsl(var(--primary-foreground))"/></svg>
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
                            width={40}
                            height={40}
                            className="rounded-sm object-cover"
                            data-ai-hint={`${part.category.split(' ')[0].toLowerCase()} water`}
                            />
                        </TableCell>
                        <TableCell className="font-medium">{part.name}</TableCell>
                        <TableCell>{part.category}</TableCell>
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
                            data-ai-hint={`${part.category.split(' ')[0].toLowerCase()} water`}
                        />
                        <div className="flex-grow space-y-1">
                            <p className="font-semibold">{part.name}</p>
                            <p className="text-sm text-muted-foreground">{part.category}</p>
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
