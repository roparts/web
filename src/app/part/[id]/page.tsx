import { notFound } from 'next/navigation';
import { partsData } from '@/lib/parts-data';
import type { Part } from '@/lib/types';
import type { Metadata, ResolvingMetadata } from 'next';
import { PartDetailClient } from './PartDetailClient';

type Props = {
  params: { id: string };
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002';

// Note: generateMetadata is a server-only function.
// It can coexist in this file because the file itself is a Server Component.
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const part = partsData.find(p => p.id === params.id);

  if (!part) {
    return {
      title: 'Part Not Found',
    };
  }

  const title = part.name;
  const description = `Buy ${part.name}. ${part.description.substring(0, 120)}... High-quality RO parts available at RoParts Hub.`;
  const imageUrl = part.image.startsWith('http') ? part.image : `${siteUrl}${part.image}`;
  const partUrl = `${siteUrl}/part/${part.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: partUrl,
    },
    openGraph: {
      title,
      description,
      url: partUrl,
      type: 'product',
      images: [
        {
          url: imageUrl,
          width: 600,
          height: 600,
          alt: part.name,
        },
      ],
    },
     twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}


export default function PartDetailPage({ params }: { params: { id: string } }) {
  const part = partsData.find(p => p.id === params.id);

  if (!part) {
    notFound();
  }

  // The page itself is a server component, which fetches data.
  // It then renders the PartDetailClient component, which handles the interactive parts.
  return <PartDetailClient part={part} />;
}
