'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, CartItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  cartItems: CartItem[]; // Alias for items for backward compatibility
  addToCart: (product: Product, sizeId: string, quantity: number) => void;
  removeFromCart: (productId: number, sizeId: string) => void;
  updateQuantity: (productId: number, sizeId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);


export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Load cart from localStorage on client-side
  useEffect(() => {
    setIsClient(true);
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isClient]);

  const addToCart = (product: any, sizeId: string, quantity: number) => {
    const size = product.sizes.find((s: any) => s.id === sizeId);
    if (!size) return;

    setItems(prevItems => {
      const existingItem = prevItems.find(
        item => item.productId === product.id && item.sizeId === sizeId
      );

      if (existingItem) {
        return prevItems.map(item =>
          item.productId === product.id && item.sizeId === sizeId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prevItems,
        {
          productId: product.id,
          productName: product.name,
          sizeId,
          sizeName: size.name,
          price: size.price,
          quantity,
          image: product.image,
        },
      ];
    });
  };

  const removeFromCart = (productId: number, sizeId: string) => {
    setItems(prevItems =>
      prevItems.filter(
        item => !(item.productId === productId && item.sizeId === sizeId)
      )
    );
  };

  const updateQuantity = (productId: number, sizeId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, sizeId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId && item.sizeId === sizeId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        cartItems: items, // Alias for backward compatibility
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
