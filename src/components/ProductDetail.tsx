'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';

interface ProductSize {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (!selectedSize) {
      // You might want to show an error message to the user
      alert('Please select a size');
      return;
    }

    setIsAdding(true);
    
    // Add the selected product with the chosen size to the cart
    addToCart(product, selectedSize, quantity);
    
    // Reset after adding
    setTimeout(() => {
      setIsAdding(false);
      // Optional: Show a success message or notification here
    }, 1000);
  };

  // Set default size when component mounts or product changes
  useEffect(() => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0].id);
    }
  }, [product.sizes, selectedSize]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
        {/* Product Image */}
        <div className="relative h-96 lg:h-[500px] rounded-lg overflow-hidden mb-8 lg:mb-0">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Product Info */}
        <div className="lg:pl-8">
          <h1 className="text-4xl font-playfair font-bold text-chocolate-brown mb-4">
            {product.name}
          </h1>
          
          <p className="text-2xl font-bold text-soft-red mb-6">
            ${product.price.toFixed(2)}
          </p>
          
          <p className="text-lg text-chocolate-brown/90 mb-8">
            {product.description}
          </p>
          
          {product.ingredients && product.ingredients.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-playfair font-bold text-chocolate-brown mb-3">
                Ingredients
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                {product.ingredients.map((ingredient, index) => (
                  <li key={index} className="text-chocolate-brown/80">
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
          )}
            
          {product.nutritionInfo && (
            <div className="mb-8">
              <h2 className="text-xl font-playfair font-bold text-chocolate-brown mb-3">
                Nutrition Information
              </h2>
              <p className="text-chocolate-brown/80">{product.nutritionInfo}</p>
            </div>
          )}
          
          <div className="space-y-4 mb-8">
            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-medium text-chocolate-brown mb-2">Size</h3>
              <div className="grid grid-cols-3 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setSelectedSize(size.id)}
                    className={`py-2 px-4 border rounded-md text-center transition-colors ${
                      selectedSize === size.id
                        ? 'border-soft-red bg-soft-red/10 text-soft-red'
                        : 'border-gray-300 hover:border-chocolate-brown/40'
                    }`}
                  >
                    <div className="font-medium">{size.name}</div>
                    <div className="text-sm">${size.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-chocolate-brown/20 rounded-md">
                <button 
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-chocolate-brown hover:bg-chocolate-brown/5"
                >
                  -
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button 
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-chocolate-brown hover:bg-chocolate-brown/5"
                >
                  +
                </button>
              </div>
              
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`flex-1 bg-soft-red hover:bg-chocolate-brown text-warm-white font-bold py-3 px-6 rounded-md transition-colors ${
                  isAdding ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isAdding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
          
          <div className="text-sm text-chocolate-brown/60">
            <p>Free delivery on orders over $25</p>
            <p>Pre-order available for next day delivery</p>
          </div>
        </div>
      </div>
    </div>
  );
}
