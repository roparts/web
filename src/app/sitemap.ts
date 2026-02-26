import { MetadataRoute } from 'next'
import { getAllParts } from '@/lib/parts-data-server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://roparts-hub.com'

    // Fetch all parts to include in sitemap
    const parts = await getAllParts()

    const productUrls = parts.map((part) => ({
        url: `${siteUrl}/part/${part.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [
        {
            url: siteUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...productUrls,
    ]
}
