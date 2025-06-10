'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { FiPlus, FiMinus, FiX } from 'react-icons/fi';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const paypalOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
  currency: 'USD',
  intent: 'capture',
};

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const cartTotal = getCartTotal();

  const createOrder = (_data: unknown, actions: any) => {
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: cartTotal.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: 'USD',
              value: cartTotal.toFixed(2),
            },
          },
        },
        items: items.map((item) => ({
          name: item.productName,
          unit_amount: {
            currency_code: 'USD',
            value: item.price.toFixed(2),
          },
          quantity: item.quantity.toString(),
        })),
      }],
    });
  };

  const onApprove = async (data: any, actions: any) => {
    setIsProcessing(true);
    try {
      // 1. First create the order in the database
      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            sizeId: item.sizeId,
            sizeName: item.sizeName,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          paymentId: data.orderID
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const { orderId, orderNumber } = await orderResponse.json();

      // 2. Then capture the payment
      const details = await actions.order.capture();
      
      // 3. Update the order with payment details
      const updateResponse = await fetch('/api/orders/update-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentDetails: details,
          paymentStatus: details.status || 'completed'
        })
      });

      if (!updateResponse.ok) {
        console.error('Failed to update order with payment details');
        // Non-critical error, continue since the order was created and payment captured
      }

      // 4. Clear cart and redirect to success page
      clearCart();
      window.location.href = `/checkout/success?order=${orderNumber}`;
      
    } catch (error) {
      console.error('Payment processing failed:', error);
      
      // Notify admin about the failed order
      try {
        await fetch('/api/admin/notify-failed-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paypalOrderId: data?.orderID,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          })
        });
      } catch (e) {
        console.error('Failed to log failed order:', e);
      }
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      alert(`Payment processing failed: ${errorMessage}. Please try again or contact support.`);
      
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-amber-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-playfair font-bold text-chocolate-brown mb-8 text-center">Your Cart</h1>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Link
              href="/products"
              className="inline-block bg-soft-red text-white px-6 py-3 rounded-md hover:bg-chocolate-brown transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-playfair font-bold text-chocolate-brown mb-8">Your Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="hidden md:grid grid-cols-12 bg-gray-50 p-4 border-b">
                <div className="col-span-5 font-medium text-gray-600">Product</div>
                <div className="col-span-2 font-medium text-gray-600 text-center">Price</div>
                <div className="col-span-3 font-medium text-gray-600 text-center">Quantity</div>
                <div className="col-span-2 font-medium text-gray-600 text-right">Total</div>
              </div>
              
              <div className="divide-y">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.sizeId}`} className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center">
                      <div className="flex-shrink-0 w-20 h-20 bg-amber-50 rounded-lg overflow-hidden mb-4 md:mb-0">
                        <Image
                          src={item.image || '/images/placeholder.jpg'}
                          alt={item.productName}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 md:ml-4">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-chocolate-brown">{item.productName}</h3>
                            <p className="text-sm text-gray-500">{item.sizeName}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.productId, item.sizeId)}
                            className="text-gray-400 hover:text-red-500 md:ml-4"
                          >
                            <FiX size={20} />
                          </button>
                        </div>
                        
                        <div className="mt-2 flex items-center justify-between md:hidden">
                          <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.productId, item.sizeId, item.quantity - 1)}
                              className="px-2 py-1 text-gray-500 hover:bg-gray-50"
                            >
                              <FiMinus size={14} />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.sizeId, item.quantity + 1)}
                              className="px-2 py-1 text-gray-500 hover:bg-gray-50"
                            >
                              <FiPlus size={14} />
                            </button>
                          </div>
                          <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="hidden md:grid md:grid-cols-3 md:gap-4 md:items-center md:w-64">
                        <div className="text-center">${item.price.toFixed(2)}</div>
                        <div className="flex justify-center">
                          <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.productId, item.sizeId, item.quantity - 1)}
                              className="px-2 py-1 text-gray-500 hover:bg-gray-50"
                            >
                              <FiMinus size={14} />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.sizeId, item.quantity + 1)}
                              className="px-2 py-1 text-gray-500 hover:bg-gray-50"
                            >
                              <FiPlus size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="text-right font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t flex justify-between items-center">
                <button
                  onClick={clearCart}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Clear Cart
                </button>
                <Link
                  href="/products"
                  className="text-sm text-chocolate-brown hover:underline"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-chocolate-brown mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg">${cartTotal.toFixed(2)}</span>
                </div>
                
                <div className="space-y-3 pt-4">
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Pay with PayPal</span>
                    </div>
                  </div>
                  
                  <div className="rounded-md overflow-hidden relative">
                    {isProcessing && (
                      <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-soft-red"></div>
                      </div>
                    )}
                    <PayPalScriptProvider options={paypalOptions}>
                      <PayPalButtons
                        disabled={isProcessing}
                        style={{ 
                          layout: 'horizontal', 
                          tagline: false, 
                          height: 48
                        }}
                        createOrder={createOrder}
                        onApprove={onApprove}
                        onError={(err) => {
                          console.error('PayPal error:', err);
                          setIsProcessing(false);
                          alert('Payment failed. Please try again or use another payment method.');
                        }}
                      />
                    </PayPalScriptProvider>
                  </div>
                </div>
                
                <div className="text-center text-sm text-gray-500 mt-4">
                  <p>or</p>
                  <Link href="/products" className="text-chocolate-brown hover:underline">Continue Shopping</Link>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <h3 className="font-medium text-chocolate-brown mb-3">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Have questions about your order? Our customer service team is here to help.
              </p>
              <Link
                href="/contact"
                className="text-sm text-soft-red hover:underline"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
