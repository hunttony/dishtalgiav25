import { MetadataRoute } from 'next';

// Mock product data - in a real app, this would come from your database or CMS
const products = [
  {
    id: 1,
    slug: 'original',
    name: 'Original Banana Pudding',
  },
  {
    id: 2,
    slug: 'bananas-foster',
    name: 'Bananas Foster Pudding',
  },
  {
    id: 3,
    slug: 'mississippi-mud',
    name: 'Mississippi Mud Pudding',
  },
];

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dishtalgia.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { 
      url: baseUrl, 
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    { 
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    { 
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    { 
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    { 
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    { 
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
  ];

  const productPages = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    ...staticPages,
    ...productPages,
  ];
}
