
import { getPartsAdmin } from '@/lib/parts-data-admin';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AdminPageClient } from './AdminPageClient';


export default async function AdminPage() {
    const parts = await getPartsAdmin();

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Button asChild size="icon" variant="outline" className="sm:hidden">
                    <Link href="/">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Back to Home</span>
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold font-headline text-primary">Admin Panel</h1>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-0">
                <AdminPageClient initialParts={parts} />
            </main>
        </div>
    );
}


