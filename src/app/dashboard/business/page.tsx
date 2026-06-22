"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, LogOut, ArrowLeft, ShieldCheck, FileText, ClipboardList } from 'lucide-react';

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  dealer: 'RO Dealer',
  service_center: 'RO Service Center',
  distributor: 'Distributor',
  wholesaler: 'Wholesaler',
  retail_shop: 'Retail Shop',
};

export default function BusinessDashboardPage() {
  const { user, profile, signOut, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (user && profile && profile.role !== 'business') {
      router.push('/dashboard/retail');
    }
  }, [user, profile, isLoading, router]);

  if (isLoading || !user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-500 font-bold animate-pulse">Loading B2B Profile...</p>
      </div>
    );
  }

  const businessTypeLabel = profile.business_type_code
    ? BUSINESS_TYPE_LABELS[profile.business_type_code] || profile.business_type_code
    : 'Business Buyer';

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
            Back to B2B Shop
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

        {/* Wholesale Alert Banner */}
        <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
          <div>
            <h4 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">Wholesale Pricing Active</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Generic retail prices are hidden. B2B wholesale discounts are automatically applied to your cart.
            </p>
          </div>
        </div>

        {/* Dashboard Title */}
        <div className="space-y-1">
          <h1 className="text-4xl font-black font-headline text-slate-800 dark:text-slate-100">
            Wholesale B2B Dashboard
          </h1>
          <p className="text-slate-500">Manage B2B orders, view billing statements, and check verification status.</p>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-1 border border-slate-200/50 shadow-lg rounded-2xl bg-white dark:bg-slate-950">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">Business Profile</CardTitle>
                <CardDescription>Verified B2B Details</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase">Company Name</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{profile.company_name || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase">GSTIN Number</p>
                <p className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200">{profile.gst_number || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase">Business Segment</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{businessTypeLabel}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase">City & State</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {profile.city}, {profile.state}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold uppercase">Status</p>
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase">
                  {profile.verification_status}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Wholesale Orders Card */}
          <Card className="md:col-span-2 border border-slate-200/50 shadow-lg rounded-2xl bg-white dark:bg-slate-950 flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-500" />
                Wholesale Quotes & Orders
              </CardTitle>
              <CardDescription>GST invoice copies and quote summaries</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center p-8 flex-grow">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-slate-300">No B2B orders recorded</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                You haven't requested any bulk quotes yet. Cart items will generate business order entries with price snapshots.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
