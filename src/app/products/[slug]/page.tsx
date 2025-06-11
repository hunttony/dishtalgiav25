import { notFound } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';
import { Product } from '@/types';

// Mock product data - in a real app, this would come from an API or CMS
const products: Product[] = [
  {
    id: 1,
    name: "Original Banana Pudding",
    slug: "original",
    description: "Our classic Southern-style banana pudding made with layers of vanilla wafers, fresh bananas, and homemade vanilla custard, topped with whipped cream and a sprinkle of vanilla wafer crumbs.",
    price: 8.00,
    ingredients: [
      "Fresh bananas",
      "Homemade vanilla custard",
      "Vanilla wafers",
      "Whipped cream",
      "Pure vanilla extract"
    ],
    nutritionInfo: "Serving size: 1 cup (200g) - Calories: 320, Total Fat: 12g, Cholesterol: 45mg, Sodium: 150mg, Total Carbohydrates: 48g, Protein: 4g",
    image: "/images/dishtalgiaoriginal.png",
    sizes: [
      { id: 'regular', name: 'Regular', price: 8.00, description: 'Serves 1-2' },
      { id: 'family', name: 'Family', price: 28.00, description: 'Serves 6-8' },
      { id: 'party', name: 'Party', price: 80.00, description: 'Serves 12-15' }
    ],
    category: "Classic",
    rating: 4.8,
    reviewCount: 124,
    inStock: true
  },
  {
    id: 2,
    name: "Bananas Foster Pudding",
    slug: "bananas-foster",
    description: "A decadent twist on the classic, featuring caramelized bananas, a rich rum-infused sauce, and a graham cracker crust, topped with vanilla bean whipped cream.",
    price: 10.00,
    ingredients: [
      "Caramelized bananas",
      "Rum-infused caramel sauce",
      "Graham cracker crust",
      "Vanilla bean whipped cream",
      "Ground cinnamon"
    ],
    nutritionInfo: "Serving size: 1 cup (220g) - Calories: 380, Total Fat: 15g, Cholesterol: 50mg, Sodium: 180mg, Total Carbohydrates: 55g, Protein: 4g",
    image: "/images/dishtalgia-2.webp",
    sizes: [
      { id: 'regular', name: 'Regular', price: 10.00, description: 'Serves 1-2' },
      { id: 'family', name: 'Family', price: 32.00, description: 'Serves 6-8' },
      { id: 'party', name: 'Party', price: 100.00, description: 'Serves 12-15' }
    ],
    category: "Specialty",
    rating: 4.9,
    reviewCount: 98,
    inStock: true
  },
  {
    id: 3,
    name: "Mississippi Mud Pudding",
    slug: "mississippi-mud",
    description: "A chocolate lover's dream with layers of rich chocolate pudding, chocolate cookie crumbles, and chocolate ganache, finished with whipped cream and chocolate shavings.",
    price: 10.00,
    ingredients: [
      "Rich chocolate pudding",
      "oreo cookie crumbles",
      "Chocolate Fudge Brownie",
      "Coffee infused Whipped Cream"
    ],
    nutritionInfo: "Serving size: 1 cup (210g) - Calories: 400, Total Fat: 18g, Cholesterol: 55mg, Sodium: 220mg, Total Carbohydrates: 58g, Protein: 5g",
    image: "/images/mississippi-mud.png",
    sizes: [
      { id: 'regular', name: 'Regular', price: 10.00, description: 'Serves 1-2' },
      { id: 'family', name: 'Family', price: 28.00, description: 'Serves 6-8' },
      { id: 'party', name: 'Party', price: 100.00, description: 'Serves 12-15' }
    ],
    category: "Chocolate",
    rating: 4.7,
    reviewCount: 87,
    inStock: true
  }
];

export default async function ProductPage({ params }: { params: { slug: string } }) {
  // In a real app, you would fetch the product data here
  // For now, we'll use the mock data
  const product = products.find(p => p.slug === params.slug);
  
  if (!product) {
    notFound();
  }

  return (
    <main>
      <ProductDetail product={product} />
    </main>
  );
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}
