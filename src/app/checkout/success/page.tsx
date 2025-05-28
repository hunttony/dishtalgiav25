'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiLoader, FiMail, FiPackage, FiClock } from 'react-icons/fi';
import { Order } from '@/models/Order';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(!!orderNumber);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderNumber) return;
      
      try {
        const response = await fetch(`/api/orders/${orderNumber}`);
        if (response.ok) {
          const orderData = await response.json();
          setOrder(orderData);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soft-red"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <FiCheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Order Confirmed!</h1>
          {orderNumber && (
            <p className="text-lg text-gray-600">
              Your order number is: <span className="font-medium">{orderNumber}</span>
            </p>
          )}
          <p className="text-lg text-gray-600 mt-2">
            A confirmation email has been sent to your email address.
          </p>
        </div>

        {order ? (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Order Number</h3>
                      <p className="text-gray-900">{order.orderNumber}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Date</h3>
                      <p className="text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Items</h3>
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-start">
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                            <img
                              src={item.image || '/images/placeholder.jpg'}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {item.productName}
                            </h4>
                            <p className="text-sm text-gray-500">Size: {item.sizeName}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
                      <p>Subtotal</p>
                      <p>${order.subtotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
                      <p>Tax</p>
                      <p>${order.tax.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200 mt-4">
                      <p>Total</p>
                      <p>${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">What's Next?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mb-3">
                      <FiMail className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Order Confirmation</h3>
                    <p className="text-sm text-gray-500">Check your email for order confirmation and details</p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 text-yellow-600 mb-3">
                      <FiPackage className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">Processing</h3>
                    <p className="text-sm text-gray-500">We're preparing your order for shipment</p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 mb-3">
                      <FiClock className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">On the Way</h3>
                    <p className="text-sm text-gray-500">We'll notify you when your order ships</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-soft-red hover:bg-chocolate-brown transition-colors"
              >
                Continue Shopping
              </Link>
              {orderNumber && (
                <Link
                  href={`/orders/${orderNumber}`}
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  View Order Details
                </Link>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No order details available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <FiLoader className="animate-spin h-12 w-12 text-soft-red" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
