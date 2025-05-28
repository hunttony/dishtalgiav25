'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiArrowLeft } from 'react-icons/fi';
import { Order } from '@/models/Order';

export default function OrderDetailsPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderNumber = params?.orderNumber as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/orders/${orderNumber}`);
      return;
    }

    if (status === 'authenticated' && orderNumber) {
      fetchOrder();
    }
  }, [status, orderNumber, router]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderNumber}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        throw new Error('Failed to fetch order');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soft-red"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-amber-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
            <h1 className="mt-2 text-2xl font-bold text-gray-900">Order not found</h1>
            <p className="mt-1 text-gray-500">We couldn't find the order you're looking for.</p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/account/orders')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-soft-red hover:bg-chocolate-brown focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soft-red"
              >
                <FiArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return <FiClock className="h-5 w-5" />;
      case 'shipped':
        return <FiTruck className="h-5 w-5" />;
      case 'delivered':
        return <FiCheckCircle className="h-5 w-5" />;
      default:
        return <FiPackage className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm font-medium text-chocolate-brown hover:text-soft-red mb-4"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-chocolate-brown">Order #{order.orderNumber}</h1>
              <p className="mt-1 text-gray-600">
                Placed on{' '}
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="ml-1.5 capitalize">{order.status}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
          </div>
          <div className="px-6 py-5">
            <ul className="divide-y divide-gray-200">
              {order.items.map((item, index) => (
                <li key={index} className="py-4 flex">
                  <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={item.image || '/images/placeholder.jpg'}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>{item.productName}</h3>
                        <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Size: {item.sizeName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Subtotal</p>
                  <p>${order.subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Tax</p>
                  <p>${order.tax.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2">
                  <p>Total</p>
                  <p>${order.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Payment Information</h2>
            </div>
            <div className="px-6 py-5">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Method</p>
                  <p className="mt-1 text-sm text-gray-900 capitalize">
                    {order.paymentMethod.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Status</p>
                  <p className="mt-1 text-sm text-gray-900 capitalize">
                    {order.paymentStatus}
                  </p>
                </div>
                {order.paymentId && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                    <p className="mt-1 text-sm text-gray-900 font-mono">
                      {order.paymentId}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Shipping Information</h2>
            </div>
            <div className="px-6 py-5">
              {order.shippingAddress ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Shipping Address</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {order.shippingAddress.name}<br />
                      {order.shippingAddress.street}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                      {order.shippingAddress.country}
                    </p>
                  </div>
                  {order.trackingNumber && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tracking Number</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {order.trackingNumber}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No shipping information available.</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soft-red"
          >
            Print Order
          </button>
        </div>
      </div>
    </div>
  );
}
