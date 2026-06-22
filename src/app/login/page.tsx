"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Landmark, User, Mail, Lock, Phone, Building, MapPin, Briefcase } from 'lucide-react';

type Tab = 'retail' | 'business';

const BUSINESS_TYPES = [
  { code: 'dealer', label: 'RO Dealer' },
  { code: 'service_center', label: 'RO Service Center' },
  { code: 'distributor', label: 'Distributor' },
  { code: 'wholesaler', label: 'Wholesaler' },
  { code: 'retail_shop', label: 'Retail Shop' }
] as const;

export default function CustomerLoginPage() {
  const { signIn, signUp, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>('retail');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Business signup states
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [businessTypeCode, setBusinessTypeCode] = useState<'dealer' | 'service_center' | 'distributor' | 'wholesaler' | 'retail_shop'>('retail_shop');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Validation checks
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        
        if (activeTab === 'business') {
          if (!companyName || !gstNumber || !phoneNumber || !city || !state) {
            throw new Error("Please fill in all required business details.");
          }
          if (gstNumber.length !== 15) {
            throw new Error("Please enter a valid 15-digit GSTIN.");
          }
        }

        // Call signUp from AuthContext
        await signUp(email, password, activeTab, activeTab === 'business' ? {
          companyName,
          gstNumber: gstNumber.toUpperCase(),
          phoneNumber,
          businessTypeCode,
          city,
          state
        } : undefined);

        toast({
          title: "Registration Successful",
          description: activeTab === 'business'
            ? "Your B2B account has been created and auto-approved!"
            : "Your retail account has been created successfully.",
        });
      } else {
        // Sign In
        await signIn(email, password);
        toast({
          title: "Login Successful",
          description: "Welcome back to RoParts Hub.",
        });
      }

      // Successful redirect to the respective dashboard
      const targetDashboard = activeTab === 'retail' ? '/dashboard/retail' : '/dashboard/business';
      router.push(targetDashboard);
      router.refresh();

    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: isSignUp ? "Registration Failed" : "Login Failed",
        description: err.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-sky-400/20 via-sky-50 to-blue-200/20 dark:from-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-lg border border-white/20 dark:border-slate-800 shadow-2xl backdrop-blur-md bg-white/80 dark:bg-slate-950/80 rounded-3xl overflow-hidden">
        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500 mb-2">
            <Landmark className="w-6 h-6 animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-black font-headline text-slate-800 dark:text-slate-100">
            RoParts Hub Portal
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access genuine spare parts at the best rates in India
          </CardDescription>
        </CardHeader>

        {/* Tab Selection */}
        <div className="px-6 pb-2">
          <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800">
            <button
              onClick={() => { setActiveTab('retail'); setIsSignUp(false); }}
              className={`flex-grow flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                activeTab === 'retail'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-md'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <User className="w-4 h-4" />
              Retail Buyer
            </button>
            <button
              onClick={() => { setActiveTab('business'); setIsSignUp(false); }}
              className={`flex-grow flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                activeTab === 'business'
                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-md'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Building className="w-4 h-4" />
              B2B Business
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 px-8 pt-4">
            {activeTab === 'business' && !isSignUp && (
              <div className="p-3 bg-sky-500/5 border border-sky-500/10 rounded-2xl text-xs text-sky-600 font-medium">
                🔒 Log in with your wholesale business account to view discount prices and carton packs.
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:ring-sky-500"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:ring-sky-500"
                  required
                />
              </div>
            </div>

            {isSignUp && (
              <>
                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 h-12 rounded-xl bg-slate-50/50 border-slate-200 focus:ring-sky-500"
                      required
                    />
                  </div>
                </div>

                {/* B2B Business Metadata Form Fields */}
                {activeTab === 'business' && (
                  <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-xs text-indigo-600 font-medium">
                      💡 Wholesale verification fields (Minimum order: ₹500 value).
                    </div>

                    {/* Company Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Company/Firm Name *</label>
                      <div className="relative">
                        <Building className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                        <Input
                          placeholder="e.g. Apex RO Enterprises"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="pl-10 h-12 rounded-xl bg-slate-50/50 border-slate-200"
                          required
                        />
                      </div>
                    </div>

                    {/* GSTIN */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">GSTIN Number *</label>
                      <div className="relative">
                        <Building className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                        <Input
                          placeholder="e.g. 07AAAAA1111A1Z1"
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value)}
                          className="pl-10 h-12 rounded-xl bg-slate-50/50 border-slate-200 uppercase"
                          maxLength={15}
                          required
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                        <Input
                          type="tel"
                          placeholder="e.g. 9876543210"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="pl-10 h-12 rounded-xl bg-slate-50/50 border-slate-200"
                          required
                        />
                      </div>
                    </div>

                    {/* Business Type */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Business Type *</label>
                      <Select
                        value={businessTypeCode}
                        onValueChange={(val: any) => setBusinessTypeCode(val)}
                      >
                        <SelectTrigger className="h-12 rounded-xl bg-slate-50/50 border-slate-200">
                          <SelectValue placeholder="Select Business Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {BUSINESS_TYPES.map(type => (
                            <SelectItem key={type.code} value={type.code}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* City & State */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">City *</label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                          <Input
                            placeholder="Delhi"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="pl-10 h-12 rounded-xl bg-slate-50/50 border-slate-200"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">State *</label>
                        <div className="relative">
                          <MapPin className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                          <Input
                            placeholder="Delhi"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="pl-10 h-12 rounded-xl bg-slate-50/50 border-slate-200"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4 px-8 pb-8 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-sm font-bold bg-primary hover:bg-primary/95 text-white rounded-xl shadow-lg hover:shadow-primary/20 transition-all duration-300"
            >
              {isLoading
                ? "Processing..."
                : isSignUp
                  ? `Register as B2B ${activeTab === 'business' ? 'Business' : 'Retailer'}`
                  : `Log in as B2B ${activeTab === 'business' ? 'Business' : 'Retailer'}`}
            </Button>

            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-sky-600 hover:text-sky-700 font-bold tracking-wide underline transition-colors"
            >
              {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
