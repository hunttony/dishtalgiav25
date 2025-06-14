import type { Metadata } from 'next';

// Custom type for our metadata to avoid type conflicts
type CustomMetadata = Omit<Metadata, 'openGraph'> & {
  openGraph?: {
    type?: 'website';
    title?: string;
    description?: string;
    url?: string | URL;
    siteName?: string;
    images?: Array<{
      url: string | URL;
      width?: number;
      height?: number;
      alt?: string;
    }>;
    locale?: string;
    product?: {
      name: string;
      description: string;
      images: Array<{ url: string }> | string;
    };
  };
};

type PageType = 'home' | 'product' | 'about' | 'contact' | 'shop' | 'cart' | 'checkout' | 'privacy' | 'terms';

interface SeoParams {
  title?: string;
  description?: string;
  path?: string;
  product?: {
    name: string;
    description: string;
    image: string;
    price: number;
  };
}

export function generateMetadata(type: PageType, params: SeoParams = {}): CustomMetadata {
  const siteName = 'Dishtalgia';
  const defaultDescription = 'Indulge in our creamy, dreamy banana puddings crafted with Southern love. Order Original, Bananas Foster, or Mississippi Mud Pudding today!';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dishtalgia.com';
  
  const title = params.title ? `${params.title} | ${siteName}` : siteName;
  const description = params.description || defaultDescription;
  const url = params.path ? new URL(params.path, baseUrl).toString() : baseUrl;
  
  const metadata: CustomMetadata = {
    title,
    description,
    metadataBase: new URL(baseUrl),
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: params.product?.image || `${baseUrl}/images/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: params.product?.name || title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [params.product?.image || `${baseUrl}/images/og-image.jpg`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: url,
    },
    keywords: [
      'banana pudding',
      'Southern desserts',
      'Houston desserts',
      'Dishtalgia',
      'Original pudding',
      'Bananas Foster',
      'Mississippi Mud',
      'homemade pudding',
      'dessert delivery',
      'best banana pudding',
      ...(params.product?.name.toLowerCase().split(' ') || []),
    ].filter(Boolean).join(', '),
  };

  if (type === 'product' && params.product) {
    // For products, we'll use the default 'website' type which is more appropriate for e-commerce
    // and add additional product-specific metadata
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'website',
      product: {
        name: params.product.name,
        description: params.product.description,
        images: [
          typeof params.product.image === 'string' 
            ? { url: params.product.image } 
            : params.product.image
        ],
      },
    };
    
    // Add product-specific metadata
    const baseKeywords = typeof metadata.keywords === 'string' ? 
      metadata.keywords.split(', ') : 
      (Array.isArray(metadata.keywords) ? metadata.keywords : []);
      
    const keywords = [
      ...baseKeywords,
      params.product.name,
      'buy',
      'order',
      'online',
      'delivery',
    ].filter(Boolean) as string[];
  
    // Create a new metadata object with the updated keywords
    return {
      ...metadata,
      keywords: keywords.join(', '),
    };
  }

  return metadata;
}

// Helper function to generate JSON-LD structured data
export function generateJsonLd(type: 'website' | 'product', data: any) {
  if (type === 'website') {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Dishtalgia',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://dishtalgia.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://dishtalgia.com'}/shop?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    };
  }

  if (type === 'product' && data) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: data.name,
      image: data.image,
      description: data.description,
      brand: {
        '@type': 'Brand',
        name: 'Dishtalgia',
      },
      offers: {
        '@type': 'Offer',
        url: data.url,
        priceCurrency: 'USD',
        price: data.price,
        availability: data.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'Dishtalgia',
        },
      },
      aggregateRating: data.rating ? {
        '@type': 'AggregateRating',
        ratingValue: data.rating,
        reviewCount: data.reviewCount || 0,
      } : undefined,
    };
  }
  
  return null;
}
