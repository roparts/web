
export function generateOrganizationSchema() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://roparts-hub.com';
    return {
        '@context': 'https://schema.org',
        '@type': 'Store',
        'name': 'RoParts Hub',
        'description': 'Leading supplier of high-quality RO spare parts, filters, and membranes in India.',
        'url': siteUrl,
        'logo': `${siteUrl}/icon.png`,
        'address': {
            '@type': 'PostalAddress',
            'addressCountry': 'IN',
        },
        'potentialAction': {
            '@type': 'SearchAction',
            'target': `${siteUrl}/?search={search_term_string}`,
            'query-input': 'required name=search_term_string'
        }
    };
}

export function generateProductSchema(part: any) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://roparts-hub.com';
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': part.name,
        'image': part.image,
        'description': part.description,
        'brand': {
            '@type': 'Brand',
            'name': part.brand || 'RoParts Hub'
        },
        'offers': {
            '@type': 'Offer',
            'url': `${siteUrl}/part/${part.id}`,
            'priceCurrency': 'INR',
            'price': part.price,
            'availability': 'https://schema.org/InStock',
            'seller': {
                '@type': 'Organization',
                'name': 'RoParts Hub'
            }
        }
    };
}
