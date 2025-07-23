
import { Suspense } from 'react';
import { HomeClient } from '@/components/HomeClient';
import { getAllParts } from '@/lib/parts-data-server';
import { Skeleton } from '@/components/ui/skeleton';

export default async function Home() {
  // Fetch data on the server
  const initialParts = await getAllParts();

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomeClient initialParts={initialParts} />
    </Suspense>
  );
}

function HomePageSkeleton() {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 w-full max-w-sm">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
}
