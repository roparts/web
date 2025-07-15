
import { Header } from '@/components/Header';
import { PartCard } from '@/components/PartCard';
import { RelatedParts } from '@/components/RelatedParts';
import { partsData } from '@/lib/parts-data';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-8 sm:py-12">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline text-primary tracking-tighter">
              Ultimate RO Parts Collection
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
              Find everything you need for your water purification system. High-quality, reliable, and ready to ship.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {partsData.map((part) => (
              <PartCard key={part.id} part={part} />
            ))}
          </div>
          <RelatedParts />
        </section>
      </main>
      <footer className="bg-secondary text-secondary-foreground py-6 mt-auto">
        <div className="container mx-auto text-center text-sm">
           <p>&copy; {new Date().getFullYear()} RoParts Hub. All Rights Reserved.</p>
            <p className="mt-2">
              <Link href="/rajababuadmin" className="hover:text-primary transition-colors">Admin Panel</Link>
            </p>
        </div>
      </footer>
    </div>
  );
}
