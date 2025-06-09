'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiFilter, FiX, FiStar, FiShoppingCart, FiPlus, FiMinus } from 'react-icons/fi';

// Mock data - replace with your actual product data or API call
const products = [
  {
    id: 1,
    name: 'Original Banana Pudding',
    slug: 'original-banana-pudding',
    price: 12.99,
    image: '/images/original-pudding.jpg',
    category: 'classic',
    rating: 4.8,
    reviewCount: 156,
    description: 'Our signature creamy vanilla pudding layered with fresh bananas and vanilla wafers.',
    inStock: true,
  },
  {
    id: 2,
    name: 'Bananas Foster Pudding',
    slug: 'bananas-foster-pudding',
    price: 14.99,
    image: '/images/bananas-foster.jpg',
    category: 'specialty',
    rating: 4.9,
    reviewCount: 98,
    description: 'A boozy twist on the classic, featuring rum-caramelized bananas and cinnamon.',
    inStock: true,
  },
  {
    id: 3,
    name: 'Mississippi Mud Pudding',
    slug: 'mississippi-mud-pudding',
    price: 15.99,
    image: '/images/mississippi-mud.jpg',
    category: 'specialty',
    rating: 4.7,
    reviewCount: 87,
    description: 'Chocolate lovers rejoice! Rich chocolate pudding with fudge swirls and chocolate chunks.',
    inStock: true,
  },
  {
    id: 4,
    name: 'Southern Peach Cobbler Pudding',
    slug: 'peach-cobbler-pudding',
    price: 14.99,
    image: '/images/peach-cobbler.jpg',
    category: 'seasonal',
    rating: 4.9,
    reviewCount: 64,
    description: 'Juicy peaches and buttery crumble topping in our signature vanilla custard.',
    inStock: true,
  },
  {
    id: 5,
    name: 'Pecan Praline Pudding',
    slug: 'pecan-praline-pudding',
    price: 15.99,
    image: '/images/pecan-praline.jpg',
    category: 'specialty',
    rating: 4.8,
    reviewCount: 72,
    description: 'Buttery pecans and praline sauce swirled into our creamy vanilla base.',
    inStock: false,
  },
  {
    id: 6,
    name: 'Lemon Blueberry Pudding',
    slug: 'lemon-blueberry-pudding',
    price: 13.99,
    image: '/images/lemon-blueberry.jpg',
    category: 'seasonal',
    rating: 4.7,
    reviewCount: 53,
    description: 'Tart lemon curd and fresh blueberries layered with vanilla pudding.',
    inStock: true,
  },
];

const categories = [
  { id: 'all', name: 'All Puddings' },
  { id: 'classic', name: 'Classic Favorites' },
  { id: 'specialty', name: 'Specialty Flavors' },
  { id: 'seasonal', name: 'Seasonal Specials' },
];


export default function ShopPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [cart, setCart] = useState<{id: number, quantity: number}[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Filter products based on selected category
  const filteredProducts = products.filter((product) => {
    if (selectedCategory === 'all') return true;
    return product.category === selectedCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0; // featured (default)
    }
  });

  // Update quantity for a product
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 0) return;
    setQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
  };

  // Add to cart
  const addToCart = (productId: number) => {
    const quantity = quantities[productId] || 1;
    setCart(prev => {
      const existingItem = prev.find(item => item.id === productId);
      if (existingItem) {
        return prev.map(item => 
          item.id === productId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { id: productId, quantity }];
    });
    
    // Reset quantity
    setQuantities(prev => ({
      ...prev,
      [productId]: 1
    }));
    
    // Show cart preview
    setShowCart(true);
    setTimeout(() => setShowCart(false), 3000);
  };

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => {
    const product = products.find(p => p.id === item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);

  // Calculate cart item count
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-100 to-amber-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-chocolate-brown mb-4">
            Our Delicious Puddings
          </h1>
          <p className="text-lg text-chocolate-brown/80 max-w-3xl mx-auto">
            Handcrafted with love using the finest ingredients. Each bite is a taste of Southern comfort.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters and Sort */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          {/* Mobile filter button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-amber-200"
          >
            <FiFilter className="text-amber-600" />
            <span className="text-chocolate-brown">Filters</span>
          </button>

          {/* Category tabs */}
          <div className="hidden md:flex items-center space-x-1 bg-amber-100/50 p-1 rounded-xl">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-white text-amber-900 shadow-sm'
                    : 'text-amber-800 hover:bg-amber-50/50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center">
            <label htmlFor="sort" className="mr-2 text-sm text-chocolate-brown/80">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Mobile filters panel */}
        {showFilters && (
          <div className="md:hidden mb-8 bg-white p-4 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-chocolate-brown">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="text-amber-600">
                <FiX size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-chocolate-brown/80 mb-2">Categories</h4>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setShowFilters(false);
                      }}
                      className={`px-3 py-2 text-sm text-left rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-amber-100 text-amber-900'
                          : 'text-chocolate-brown hover:bg-amber-50'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedProducts.map((product) => (
            <div key={product.id} className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <div className="relative h-64 overflow-hidden">
                <div className="relative w-full h-full">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/images/placeholder-food.svg';
                      target.classList.add('p-4'); // Add padding for the SVG
                    }}
                    unoptimized={process.env.NODE_ENV !== 'production'}
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-white/90 text-chocolate-brown px-3 py-1 rounded-full text-sm font-medium">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                    <FiStar className="mr-1" size={12} />
                    {product.rating}
                  </div>
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-playfair font-bold text-chocolate-brown mb-2">
                  {product.name}
                </h3>
                <p className="text-chocolate-brown/70 mb-4 flex-grow">
                  {product.description}
                </p>
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-soft-red">
                      ${product.price.toFixed(2)}
                    </span>
                    <div className="flex items-center border border-amber-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(product.id, (quantities[product.id] || 1) - 1)}
                        className="px-3 py-1 text-amber-600 hover:bg-amber-50 transition-colors"
                        disabled={(quantities[product.id] || 1) <= 1}
                      >
                        <FiMinus size={16} />
                      </button>
                      <span className="w-8 text-center text-chocolate-brown">
                        {quantities[product.id] || 1}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, (quantities[product.id] || 1) + 1)}
                        className="px-3 py-1 text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => product.inStock && addToCart(product.id)}
                    disabled={!product.inStock}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      product.inStock
                        ? 'bg-soft-red hover:bg-chocolate-brown text-white'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <FiShoppingCart size={18} />
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Preview */}
      {showCart && (
        <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-xl border border-amber-100 p-4 w-80 z-50 animate-fade-in-up">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-chocolate-brown">Added to Cart</h3>
            <button 
              onClick={() => setShowCart(false)}
              className="text-chocolate-brown/60 hover:text-chocolate-brown"
            >
              <FiX size={20} />
            </button>
          </div>
          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
            {cart.map((item) => {
              const product = products.find(p => p.id === item.id);
              if (!product) return null;
              
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-amber-50">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                    <div className="absolute -top-1 -right-1 bg-soft-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium text-chocolate-brown">{product.name}</h4>
                    <p className="text-sm text-chocolate-brown/60">
                      {item.quantity} × ${product.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-amber-100 pt-3">
            <div className="flex justify-between items-center mb-4">
              <span className="text-chocolate-brown/80">Subtotal</span>
              <span className="font-medium text-chocolate-brown">${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
              <Link 
                href="/cart"
                className="flex-1 py-2 text-center text-sm font-medium text-chocolate-brown border border-chocolate-brown/20 rounded-lg hover:bg-amber-50 transition-colors"
              >
                View Cart
              </Link>
              <Link 
                href="/checkout"
                className="flex-1 py-2 text-center text-sm font-medium text-white bg-soft-red rounded-lg hover:bg-chocolate-brown transition-colors"
              >
                Checkout
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Cart Floating Button */}
      {cart.length > 0 && !showCart && (
        <button 
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-soft-red text-white p-3 rounded-full shadow-lg hover:bg-chocolate-brown transition-colors flex items-center justify-center"
        >
          <div className="relative">
            <FiShoppingCart size={24} />
            <span className="absolute -top-2 -right-2 bg-white text-soft-red text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {cartItemCount}
            </span>
          </div>
        </button>
      )}
    </div>
  );
}
