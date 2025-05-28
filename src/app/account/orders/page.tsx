'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FiPackage, 
  FiCalendar, 
  FiArrowRight, 
  FiAlertCircle, 
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiHome,
  FiLoader
} from 'react-icons/fi';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/lib/utils';

// Define types for order items
interface OrderItem {
  _id: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  size?: string;
}

// Define OrderStatus type
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Define Order interface
interface Order {
  _id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

// Helper function to get status details
const getStatusDetails = (status: OrderStatus) => {
  switch (status) {
    case 'pending':
      return {
        icon: <FiClock className="h-5 w-5 text-amber-500" />,
        color: 'bg-amber-100 text-amber-800',
        label: 'Processing',
      };
    case 'processing':
      return {
        icon: <FiPackage className="h-5 w-5 text-blue-500" />,
        color: 'bg-blue-100 text-blue-800',
        label: 'Processing',
      };
    case 'shipped':
      return {
        icon: <FiTruck className="h-5 w-5 text-indigo-500" />,
        color: 'bg-indigo-100 text-indigo-800',
        label: 'Shipped',
      };
    case 'delivered':
      return {
        icon: <FiCheckCircle className="h-5 w-5 text-green-500" />,
        color: 'bg-green-100 text-green-800',
        label: 'Delivered',
      };
    case 'cancelled':
      return {
        icon: <FiAlertCircle className="h-5 w-5 text-red-500" />,
        color: 'bg-red-100 text-red-800',
        label: 'Cancelled',
      };
    default:
      return {
        icon: <FiClock className="h-5 w-5 text-gray-500" />,
        color: 'bg-gray-100 text-gray-800',
        label: 'Unknown',
      };
  }
};

export default function OrdersPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (isAuthLoading) return;
    
    if (!isAuthenticated) {
      router.push('/login?callbackUrl=/account/orders');
      return;
    }

    fetchOrders();
  }, [isAuthenticated, isAuthLoading, router]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/orders?page=${currentPage}&limit=${itemsPerPage}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          errorData.message || 
          'Failed to fetch orders. Please try again later.'
        );
      }
      
      const { data, pagination } = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from server');
      }
      
      setOrders(data);
      setTotalPages(pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'An error occurred while fetching your orders.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle order status display
  const renderOrderStatus = (status: OrderStatus) => {
    const { icon, color, label } = getStatusDetails(status);
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {icon}
        <span className="ml-1">{label}</span>
      </span>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mx-auto mb-4">
            <FiLoader className="h-12 w-12 text-chocolate-brown" />
          </div>
          <p className="text-chocolate-brown">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6 bg-white rounded-lg shadow-md">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <FiAlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="mt-3 text-lg font-medium text-chocolate-brown">Error loading orders</h3>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <button
              onClick={fetchOrders}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-soft-red hover:bg-chocolate-brown focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soft-red"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-amber-50 py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-playfair font-bold text-chocolate-brown mb-8">Your Orders</h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-amber-100">
            <FiPackage className="h-12 w-12 text-amber-500" />
          </div>
          <h3 className="mt-6 text-xl font-medium text-chocolate-brown">No orders yet</h3>
          <p className="mt-2 text-gray-600 max-w-md mx-auto">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <div className="mt-8">
            <a
              href="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-soft-red hover:bg-chocolate-brown transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soft-red"
            >
              Browse Our Puddings
            </a>
          </div>
          <div className="mt-6">
            <a
              href="/"
              className="text-sm font-medium text-soft-red hover:text-chocolate-brown flex items-center justify-center"
            >
              <FiHome className="mr-1.5 h-4 w-4" />
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-playfair font-bold text-chocolate-brown">Your Orders</h1>
          <p className="mt-2 text-gray-600">View and track your order history</p>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {orders.map((order) => {
              const orderDate = new Date(order.createdAt);
              const formattedDate = format(orderDate, 'MMMM d, yyyy');
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
              
              return (
                <li key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h2 className="text-lg font-medium text-chocolate-brown">
                          Order #{order.orderNumber}
                        </h2>
                        <div className="ml-3">
                          {renderOrderStatus(order.status)}
                        </div>
                      </div>
                      
                      <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:items-center text-sm text-gray-500">
                        <div className="flex items-center">
                          <FiCalendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          <span>Placed on {formattedDate}</span>
                        </div>
                        <span className="hidden sm:mx-2 sm:inline" aria-hidden="true">&middot;</span>
                        <div className="mt-1 sm:mt-0 flex items-center">
                          <FiPackage className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 sm:mt-0 sm:ml-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total amount</p>
                        <p className="text-lg font-medium text-chocolate-brown">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <div className="flex-1">
                        <h3 className="sr-only">Items</h3>
                        <ul className="divide-y divide-gray-200">
                          {order.items.slice(0, 2).map((item) => (
                            <li key={item._id} className="py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                                  <img
                                    src={item.image || '/images/placeholder.jpg'}
                                    alt={item.name}
                                    className="w-full h-full object-cover object-center"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.onerror = null;
                                      target.src = '/images/placeholder.jpg';
                                    }}
                                  />
                                  {item.quantity > 1 && (
                                    <span className="absolute -mt-6 ml-1 text-xs font-medium text-gray-900 bg-white bg-opacity-75 px-1.5 py-0.5 rounded">
                                      ×{item.quantity}
                                    </span>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <h4 className="text-sm font-medium text-chocolate-brown">
                                    {item.name}
                                  </h4>
                                  {item.size && (
                                    <p className="mt-1 text-xs text-gray-500">
                                      {item.size}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </li>
                          ))}
                          
                          {order.items.length > 2 && (
                            <li className="py-2 text-sm text-gray-500">
                              + {order.items.length - 2} more {order.items.length - 2 === 1 ? 'item' : 'items'}
                            </li>
                          )}
                        </ul>
                      </div>
                      
                      <div className="mt-4 sm:mt-0 sm:ml-6 sm:flex-shrink-0">
                        <a
                          href={`/orders/${order.orderNumber}`}
                          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-soft-red bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soft-red"
                        >
                          View Details
                          <FiArrowRight className="ml-2 h-4 w-4" />
                        </a>
                        
                        {order.status === 'delivered' && (
                          <button
                            type="button"
                            className="mt-2 w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soft-red"
                          >
                            Buy it again
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200"
              aria-label="Pagination"
            >
              <div className="hidden sm:block">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, orders.length)}
                  </span>{' '}
                  of <span className="font-medium">{orders.length}</span> orders
                </p>
              </div>
              <div className="flex-1 flex justify-between sm:justify-end space-x-3">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                      : 'text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                      : 'text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
