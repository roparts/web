"use client";

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Phone, Mail, MapPin, Clock, ShieldCheck, ArrowRight, Lock, MessageSquare } from 'lucide-react';

export function Footer() {
  const { translations } = useLanguage();
  const { user, profile } = useAuth();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-slate-950 text-slate-200 border-t border-slate-900 mt-auto overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          
          {/* Column 1: Company Logo & Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <svg width="36" height="36" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary hover:scale-110 transition-transform duration-300">
                <path d="M200 20L46.4 110V290L200 380L353.6 290V110L200 20Z" stroke="currentColor" strokeWidth="20" strokeLinejoin="round" />
                <path d="M200 50L72.4 125V275L200 350L327.6 275V125L200 50Z" stroke="currentColor" strokeWidth="12" strokeLinejoin="round" />
                <circle cx="200" cy="200" r="105" fill="#7C3AED" />
                <path d="M200 120C200 120 140 190 140 230C140 263.137 166.863 290 200 290C233.137 290 260 263.137 260 230C260 190 200 120 200 120Z" fill="white" />
              </svg>
              <span className="font-bold font-headline text-xl text-white tracking-wide">
                RoParts Hub
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              {translations.footer.description}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>{translations.footer.qualityGuarantee}</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-100 font-headline border-l-2 border-primary pl-2">
              {translations.footer.quickLinks}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-slate-400 hover:text-white hover:pl-1 transition-all duration-200 flex items-center gap-1.5 group">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>{translations.footer.home}</span>
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-slate-400 hover:text-white hover:pl-1 transition-all duration-200 flex items-center gap-1.5 group">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>{translations.footer.b2cStore}</span>
                </Link>
              </li>
              <li>
                <Link href={user ? "/dashboard" : "/login?tab=business"} className="text-slate-400 hover:text-white hover:pl-1 transition-all duration-200 flex items-center gap-1.5 group">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="flex items-center gap-1">
                    {translations.footer.b2bPortal}
                    {(!user || profile?.role !== 'business') && <Lock className="h-3 w-3 text-slate-500" />}
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-slate-400 hover:text-white hover:pl-1 transition-all duration-200 flex items-center gap-1.5 group">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>{translations.footer.adminPanel}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Main Categories */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-100 font-headline border-l-2 border-primary pl-2">
              {translations.footer.categories}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                "Domestic RO Parts",
                "Commercial RO Parts",
                "RO Accessories & Tools",
                "Complete RO Systems"
              ].map((category) => (
                <li key={category}>
                  <Link 
                    href={`/?category=${encodeURIComponent(category)}`} 
                    className="text-slate-400 hover:text-white hover:pl-1 transition-all duration-200 flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span>{translations.categories.main[category] || category}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Corporate Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-100 font-headline border-l-2 border-primary pl-2">
              {translations.footer.contactUs}
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-slate-400 leading-relaxed">
                  {translations.footer.addressVal}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <a href="tel:+919523728080" className="text-slate-400 hover:text-white transition-colors">
                  +91 95237 28080
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 text-green-500 shrink-0" />
                <a 
                  href="https://wa.me/919523728080" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-400 hover:text-green-400 transition-colors flex items-center gap-1"
                >
                  WhatsApp Support
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a href="mailto:support@roparts.in" className="text-slate-400 hover:text-white transition-colors">
                  support@roparts.in
                </a>
              </li>
              <li className="flex items-start gap-3 pt-1 border-t border-slate-900">
                <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="text-slate-400 text-xs leading-relaxed">
                  <div className="font-semibold text-slate-300">{translations.footer.hoursLabel}</div>
                  <div>{translations.footer.hoursVal}</div>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {currentYear} RoParts Hub. {translations.footer.rightsReserved}</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
