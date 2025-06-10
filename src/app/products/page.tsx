'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-hot-toast';

// Define product types
interface ProductSize {
  id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  sizes: ProductSize[];
}

// Mock product data with size options
const products: Product[] = [
  {
    id: 1,
    name: "Original Banana Pudding",
    slug: "original",
    description: "Classic Southern comfort with creamy vanilla pudding, ripe bananas, and crunchy Nilla wafers.",
    price: 8.00,
    image: "/images/IMG_2016-removebg-preview (2).png",
    sizes: [
      { id: 'small', name: 'Small (8oz)', price: 6.00, description: 'Small size', stock: 10 },
      { id: 'regular', name: 'Regular (16oz)', price: 8.00, description: 'Regular size', stock: 10 },
      { id: 'large', name: 'Large (32oz)', price: 14.00, description: 'Large size', stock: 5 }
    ]
  },
  {
    id: 2,
    name: "Bananas Foster Pudding",
    slug: "bananas-foster",
    description: "A decadent twist with caramelized bananas, rum-infused sauce, and a graham cracker crust.",
    price: 10.00,
    image: "/images/dishtalgia-2.webp",
    sizes: [
      { id: 'small', name: 'Small (8oz)', price: 8.00, description: 'Small size', stock: 10 },
      { id: 'regular', name: 'Regular (16oz)', price: 10.00, description: 'Regular size', stock: 10 },
      { id: 'large', name: 'Large (32oz)', price: 18.00, description: 'Large size', stock: 5 }
    ]
  },
  {
    id: 3,
    name: "Mississippi Mud Pudding",
    slug: "mississippi-mud",
    description: "Rich chocolate pudding layered with cookie crumbles and whipped cream.",
    price: 10.00,
    image: "/images/mississippi-mud.png",
    sizes: [
      { id: 'small', name: 'Small (8oz)', price: 8.00, description: 'Small size', stock: 10 },
      { id: 'regular', name: 'Regular (16oz)', price: 10.00, description: 'Regular size', stock: 10 },
      { id: 'large', name: 'Large (32oz)', price: 18.00, description: 'Large size', stock: 5 }
    ]
  }
];

// Component for the Add to Cart button
function AddToCartButton({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0].id);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    setIsAdding(true);
    const selectedSizeObj = product.sizes.find(size => size.id === selectedSize);
    
    if (!selectedSizeObj) {
      toast.error('Please select a size');
      setIsAdding(false);
      return;
    }

    // Create a product object that matches the expected type
    const productWithSizes = {
      ...product,
      sizes: product.sizes.map(size => ({
        ...size,
        description: size.description || `${size.name} size`,
        stock: size.stock || 10
      })),
      inStock: true,
      category: 'pudding'
    };
    
    addToCart(productWithSizes, selectedSize, quantity);
    toast.success(`${quantity} x ${product.name} (${selectedSizeObj.name}) added to cart!`);
    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={`size-${product.id}`} className="block text-sm font-medium text-gray-700 mb-1">
          Size
        </label>
        <select
          id={`size-${product.id}`}
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-soft-red focus:border-soft-red"
          disabled={isAdding}
        >
          {product.sizes.map((size: ProductSize) => (
            <option key={size.id} value={size.id}>
              {size.name} - ${size.price.toFixed(2)}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Quantity</label>
        <div className="flex items-center border rounded-md overflow-hidden">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || isAdding}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
          >
            -
          </button>
          <span className="px-4 py-1 bg-white text-center w-12">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            disabled={isAdding}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isAdding}
        className={`w-full py-2.5 rounded-md font-medium text-sm transition-colors ${
          isAdding 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-soft-red text-white hover:bg-chocolate-brown'
        }`}
      >
        {isAdding ? 'Adding...' : 'Add to Cart'}
      </button>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="py-12 bg-cream-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-playfair font-bold text-chocolate-brown mb-4">
            Our Delicious Puddings
          </h1>
          <div className="w-20 h-1 bg-golden-yellow mx-auto mb-8"></div>
          <p className="text-xl text-chocolate-brown/80 max-w-3xl mx-auto">
            Handcrafted with love using the finest ingredients. Each pudding is made fresh to order.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-64 w-full">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <AddToCartButton product={product} />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-playfair font-bold text-chocolate-brown mb-2">
                  {product.name}
                </h2>
                <p className="text-chocolate-brown/80 mb-4">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-soft-red">
                    ${product.price.toFixed(2)}
                  </span>
                  <Link 
                    href={`/products/${product.slug}`}
                    className="text-chocolate-brown hover:text-golden-yellow font-semibold transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-playfair font-bold text-chocolate-brown mb-6">
            Special Requests?
          </h2>
          <p className="text-chocolate-brown/80 mb-6 max-w-2xl mx-auto">
            Have a special occasion or dietary restrictions? Contact us for custom orders and we'll do our best to accommodate your needs.
          </p>
          <Link 
            href="/contact" 
            className="inline-block bg-chocolate-brown hover:bg-golden-yellow text-warm-white font-bold py-3 px-8 rounded-full text-lg transition-colors duration-300"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
