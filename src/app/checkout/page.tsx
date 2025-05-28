'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import PayPalButton from '../../components/paypal/PayPalButton';

export default function CheckoutPage() {
  const { getCartTotal, clearCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const cartTotal = getCartTotal();
  const shippingCost = 0; // Free shipping
  const tax = cartTotal * 0.08; // 8% tax
  const orderTotal = cartTotal + shippingCost + tax;

  const handlePayPalSuccess = () => {
    setIsProcessing(false);
    setIsSuccess(true);
    clearCart();
    setTimeout(() => {
      router.push('/');
    }, 3000);
  };

  const handlePayPalError = (error: any) => {
    setIsProcessing(false);
    console.error('PayPal error:', error);
    toast.error(`Payment processing failed. Please try again.`);
  };

  const handlePayPalCancel = () => {
    setIsProcessing(false);
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-beige">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-soft-red mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-chocolate-brown mb-2">Processing Payment</h1>
          <p className="text-gray-600">Please wait while we process your payment...</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-beige">
        <div className="text-center">
          <FiCheckCircle className="w-16 h-16 text-soft-red mb-4" />
          <h1 className="text-3xl font-bold text-chocolate-brown mb-4">
            Thank you for your order!
          </h1>
          <p className="text-gray-600 mb-8">
            Your order has been placed successfully. We'll notify you when it's ready for pickup.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-soft-red text-white px-6 py-2 rounded-md hover:bg-chocolate-brown transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-chocolate-brown hover:text-soft-red transition-colors"
          >
            <FiArrowLeft className="mr-1" /> Back to Cart
          </button>
        </div>
        
        <h1 className="text-3xl font-playfair font-bold text-chocolate-brown mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-chocolate-brown mb-6 pb-4 border-b">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${orderTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6">
                <PayPalButton
                  amount={orderTotal}
                  currency="USD"
                  onSuccess={handlePayPalSuccess}
                  onError={handlePayPalError}
                  onCancel={handlePayPalCancel}
                  onProcessingChange={(isProcessing) => setIsProcessing(isProcessing)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
