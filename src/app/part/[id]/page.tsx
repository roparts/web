
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';
import { PartDetailClient } from './PartDetailClient';
import { getPartById, getAllParts } from '@/lib/parts-data-server';

type Props = {
  params: { id: string };
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002';

// This function allows Next.js to pre-render all the part pages at build time
export async function generateStaticParams() {
  const parts = await getAllParts();
  return parts.map((part) => ({
    id: part.id,
  }));
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const part = await getPartById(params.id);

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
      type: 'website',
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


export default async function PartDetailPage({ params }: { params: { id: string } }) {
  const part = await getPartById(params.id);

  if (!part) {
    notFound();
  }

  // The page itself is a server component, which fetches data.
  // It then renders the PartDetailClient component, which handles the interactive parts.
  const allParts = await getAllParts();
  return <PartDetailClient part={part} allParts={allParts} />;
}
