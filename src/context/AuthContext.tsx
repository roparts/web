"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabasePublic } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Tables } from '@/types/database';
import { setUserRoleCookie } from '@/app/actions';

type Profile = Tables<'profiles'>['Row'];

interface SignUpProfileData {
  companyName?: string;
  gstNumber?: string;
  phoneNumber?: string;
  businessTypeCode?: 'dealer' | 'service_center' | 'distributor' | 'wholesaler' | 'retail_shop';
  city?: string;
  state?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, role: 'retail' | 'business', profileData?: SignUpProfileData) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabasePublic
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
        await setUserRoleCookie(data.role);
      } else {
        setProfile(null);
        await setUserRoleCookie(null);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setProfile(null);
      await setUserRoleCookie(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Get initial session
    supabasePublic.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabasePublic.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
        await setUserRoleCookie(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabasePublic.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signUp = async (
    email: string,
    password: string,
    role: 'retail' | 'business',
    profileData?: SignUpProfileData
  ) => {
    const { data, error } = await supabasePublic.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    if (!data.user) throw new Error("Registration failed.");

    // Auto-approve business accounts for Phase 1
    const newProfile = {
      id: data.user.id,
      email,
      role,
      verification_status: role === 'business' ? 'approved' : 'pending',
      company_name: profileData?.companyName || null,
      gst_number: profileData?.gstNumber || null,
      phone_number: profileData?.phoneNumber || null,
      business_type_code: profileData?.businessTypeCode || null,
      city: profileData?.city || null,
      state: profileData?.state || null,
    };

    const { error: profileError } = await supabasePublic
      .from('profiles')
      .insert([newProfile]);

    if (profileError) {
      console.error("Error creating user profile:", profileError);
      throw profileError;
    }

    return data;
  };

  const signOut = async () => {
    setIsLoading(true);
    await supabasePublic.auth.signOut();
    setUser(null);
    setProfile(null);
    await setUserRoleCookie(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
