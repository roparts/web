
"use client";

import { useEffect, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { PlusCircle, Edit, Trash2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { partsData } from '@/lib/parts-data';
import type { Part } from '@/lib/types';
import { EditPartDialog } from './EditPartDialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [parts, setParts] = useState<Part[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);

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
      setError('Incorrect password. Please try again.');
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
    if (confirm('Are you sure you want to delete this part?')) {
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
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Admin Access</CardTitle>
            <CardDescription>
              Enter the password to manage your products.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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
                Sign In
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
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary"><path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM5.5 16.5L12 20L18.5 16.5V8.5L12 5L5.5 8.5V16.5Z" fill="currentColor"/><path d="M12 14.5L15.5 12.5L12 10.5L8.5 12.5L12 14.5Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 14.5L15.5 16.5L12 18.5L8.5 16.5L12 14.5Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <h1 className="text-xl sm:text-2xl font-bold font-headline text-primary">Admin Panel</h1>
          </div>
           <Button onClick={handleAddNew} size="sm" className="sm:size-auto">
            <PlusCircle className="mr-0 sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add New Part</span>
          </Button>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Parts</CardTitle>
            <CardDescription>Add, edit, or delete RO parts from your catalog.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Table for larger screens */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                          data-ai-hint={`${part.category} part`}
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
                        data-ai-hint={`${part.category} part`}
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
  );
}
