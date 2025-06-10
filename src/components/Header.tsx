'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { FiShoppingCart, FiPackage, FiSettings, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { CartItem } from '@/types';

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartDropdownOpen, setIsCartDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Get cart and auth state
  const { items, removeFromCart, updateQuantity, getCartTotal, getItemCount } = useCart();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Initialize state after hydration
  const [hasMounted, setHasMounted] = useState(false);

  // Calculate cart items and total - removing memoization to ensure updates
  const cartItems = getItemCount();
  const cartTotal = getCartTotal();

  // Handle hydration and cart updates
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsCartDropdownOpen(false);
    setIsUserDropdownOpen(false);
  }, [pathname]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCartDropdownOpen(false);
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent rendering until mounted
  if (!hasMounted || isAuthLoading) {
    return <div className="h-16 bg-chocolate-brown" />;
  }

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ callbackUrl: '/', redirect: true });
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleRemoveFromCart = async (item: CartItem) => {
    try {
      await removeFromCart(item.productId, item.sizeId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleUpdateQuantity = async (item: CartItem, quantity: number) => {
    try {
      await updateQuantity(item.productId, item.sizeId, quantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const displayName = user?.name || 'Account';

  return (
    <header className="bg-chocolate-brown text-warm-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-playfair font-bold hover:text-golden-yellow transition-colors">
              Dishtalgia
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="hover:text-golden-yellow transition-colors">
              Home
            </Link>
            <Link href="/products" className="hover:text-golden-yellow transition-colors">
              Our Puddings
            </Link>
            <Link href="/about" className="hover:text-golden-yellow transition-colors">
              Our Story
            </Link>
            <Link href="/contact" className="hover:text-golden-yellow transition-colors">
              Contact
            </Link>
          </nav>

          {/* User Menu, Cart, and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                  className="flex items-center space-x-1 text-warm-white hover:text-soft-red transition-colors group"
                  aria-haspopup="true"
                  aria-expanded={isUserDropdownOpen}
                >
                  <div className="relative flex items-center justify-center h-8 w-8 rounded-full bg-soft-red text-warm-white">
                    <span className="text-sm font-medium">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:inline-flex items-center">
                    {displayName}
                    <FiChevronDown
                      className={`ml-1 h-4 w-4 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </span>
                </button>

                {isUserDropdownOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/account/orders"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-chocolate-brown"
                        role="menuitem"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <FiPackage className="mr-3 h-5 w-5 text-gray-400" />
                        My Orders
                      </Link>
                      <Link
                        href="/account/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-chocolate-brown"
                        role="menuitem"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        <FiSettings className="mr-3 h-5 w-5 text-gray-400" />
                        Account Settings
                      </Link>
                    </div>
                    <div className="py-1 border-t border-gray-100">
                      <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-chocolate-brown disabled:opacity-50"
                        role="menuitem"
                      >
                        <FiLogOut className="mr-3 h-5 w-5 text-gray-400" />
                        {isSigningOut ? 'Signing Out...' : 'Sign Out'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-warm-white hover:text-soft-red transition-colors text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="hidden md:inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-chocolate-brown bg-soft-red hover:bg-amber-100 transition-colors"
                >
                  Create Account
                </Link>
              </div>
            )}

            <div className="relative" ref={cartRef}>
              <button
                onClick={() => setIsCartDropdownOpen((prev) => !prev)}
                className="p-2 rounded-full text-warm-white hover:text-golden-yellow focus:outline-none relative"
                aria-label="Shopping cart"
              >
                <FiShoppingCart className="h-6 w-6" />
                {cartItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-soft-red text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartItems}
                  </span>
                )}
              </button>

              {isCartDropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50"
                >
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-medium text-chocolate-brown">Your Cart</h3>
                    <button
                      onClick={() => setIsCartDropdownOpen(false)}
                      className="text-gray-400 hover:text-chocolate-brown"
                      aria-label="Close cart"
                    >
                      <FiLogOut className="mr-3 h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-4">
                    {items.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">Your cart is empty</p>
                    ) : (
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div
                            key={`${item.productId}-${item.sizeId}`}
                            className="flex items-center gap-3"
                          >
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-amber-50">
                              <Image
                                src={item.image || '/images/placeholder.jpg'}
                                alt={item.productName}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute -top-1 -right-1 bg-soft-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                {item.quantity}
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-chocolate-brown">{item.productName}</h4>
                              <p className="text-sm text-gray-500">{item.sizeName}</p>
                              <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                                  <button
                                    onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                                    className="px-2 py-1 text-gray-500 hover:bg-gray-50"
                                    disabled={item.quantity <= 1}
                                  >
                                    -
                                  </button>
                                  <span className="w-8 text-center">{item.quantity}</span>
                                  <button
                                    onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                                    className="px-2 py-1 text-gray-500 hover:bg-gray-50"
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  onClick={() => handleRemoveFromCart(item)}
                                  className="text-red-500 hover:text-red-700 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                            <div className="font-medium text-chocolate-brown">
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {items.length > 0 && (
                    <div className="p-4 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-medium">Subtotal</span>
                        <span className="font-bold">${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href="/cart"
                          className="bg-white border border-chocolate-brown/20 text-chocolate-brown hover:bg-amber-50 transition-colors py-2 px-4 rounded-md text-center text-sm font-medium"
                          onClick={() => setIsCartDropdownOpen(false)}
                          role="menuitem"
                        >
                          View Cart
                        </Link>
                        {/* <Link
                          href="/checkout"
                          className="bg-soft-red text-white hover:bg-chocolate-brown transition-colors py-2 px-4 rounded-md text-center text-sm font-medium"
                          onClick={() => setIsCartDropdownOpen(false)}
                          role="menuitem"
                        >
                          Checkout
                        </Link> */}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-1 rounded-md text-warm-white hover:text-golden-yellow focus:outline-none"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-chocolate-brown/95 absolute w-full z-10 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className="block px-3 py-2 text-base font-medium hover:bg-chocolate-brown/80 hover:text-golden-yellow"
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link
              href="/products"
              className="block px-3 py-2 text-base font-medium hover:bg-chocolate-brown/80 hover:text-golden-yellow"
              onClick={closeMenu}
            >
              Our Puddings
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 text-base font-medium hover:bg-chocolate-brown/80 hover:text-golden-yellow"
              onClick={closeMenu}
            >
              Our Story
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 text-base font-medium hover:bg-chocolate-brown/80 hover:text-golden-yellow"
              onClick={closeMenu}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}