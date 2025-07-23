
import { Suspense } from 'react';
import { getAllParts } from '@/lib/parts-data-server';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

const HomeClient = dynamic(() => import('@/components/HomeClient').then(mod => mod.HomeClient), {
  loading: () => <HomePageSkeleton />,
});

export default async function Home() {
  const initialParts = await getAllParts();

  return (
      <HomeClient initialParts={initialParts} />
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
