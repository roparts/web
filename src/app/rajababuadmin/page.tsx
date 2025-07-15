"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { partsData } from '@/lib/parts-data';
import type { Part } from '@/lib/types';
import { EditPartDialog } from './EditPartDialog';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [parts, setParts] = useState<Part[]>(partsData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);

  useEffect(() => {
    // Simple password protection for demo purposes.
    // In a real app, use a proper authentication system.
    if (sessionStorage.getItem('ro-admin-auth') === 'true') {
      setIsAuthenticated(true);
      return;
    }

    const password = prompt('Enter admin password:');
    if (password === 'rajababuadmin') {
      sessionStorage.setItem('ro-admin-auth', 'true');
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password. Redirecting to home.');
      window.location.href = '/';
    }
  }, []);

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
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <p>Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image src="/admin-logo.svg" alt="Admin Logo" width={40} height={40} />
            <h1 className="text-2xl font-bold font-headline text-primary">Admin Panel</h1>
          </div>
           <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Part
          </Button>
        </div>
      </header>
      <main className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Parts</CardTitle>
            <CardDescription>Add, edit, or delete RO parts from your catalog.</CardDescription>
          </CardHeader>
          <CardContent>
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
                    <TableCell>₹{part.price.toLocaleString('en-IN')}</TableCell>
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
