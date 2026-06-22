"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, LogOut, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function RetailDashboardPage() {
  const { user, profile, signOut, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-500 font-bold animate-pulse">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 sm:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            className="flex items-center gap-2 hover:bg-slate-200/50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Button>
          <Button
            onClick={() => signOut().then(() => router.push('/login'))}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* Dashboard Title */}
        <div className="space-y-1">
          <h1 className="text-4xl font-black font-headline text-slate-800 dark:text-slate-100">
            Retail Buyer Dashboard
          </h1>
          <p className="text-slate-500">Manage your profile, wishlist, and track orders</p>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 border border-slate-200/50 shadow-lg rounded-2xl bg-white dark:bg-slate-950">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500">
                <User className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Profile Info</CardTitle>
                <CardDescription>Your personal details</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase">Email Address</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase">Account Role</p>
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 uppercase">
                  {profile?.role || 'Retail'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border border-slate-200/50 shadow-lg rounded-2xl bg-white dark:bg-slate-950 flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-sky-500" />
                Recent Orders
              </CardTitle>
              <CardDescription>Your request-for-quotes and completed transactions</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center p-8 flex-grow">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-slate-300">No orders found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                You haven't requested any quotes or items yet. Add parts to your cart and send an RFQ!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
