'use client';

import { PayPalButtons, usePayPalScriptReducer, PayPalScriptProvider } from '@paypal/react-paypal-js';
import type { CreateOrderData, CreateOrderActions, OnApproveData, OnApproveActions } from '@paypal/paypal-js';
import { useState, useMemo } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useSession } from 'next-auth/react';
import LoadingSpinner from '../ui/LoadingSpinner';
import dynamic from 'next/dynamic';

interface PayPalButtonProps {
  amount: number;
  currency?: string;
  onSuccess: (order?: any) => void;
  onError: (error: Error) => void;
  onCancel?: () => void;
  onProcessingChange?: (isProcessing: boolean) => void;
}

// Component to handle the PayPal script loading state
const ButtonWrapper = ({ currency, showSpinner, ...props }: any) => {
  const [{ isPending, isResolved, isRejected }] = usePayPalScriptReducer();
  
  // Memoize the PayPal buttons to prevent unnecessary re-renders
  const buttons = useMemo(() => {
    if (isRejected) {
      return (
        <div className="text-red-600 text-sm p-4 border border-red-200 bg-red-50 rounded">
          Failed to load PayPal. Please refresh the page or try again later.
        </div>
      );
    }
    
    return (
      <PayPalButtons 
        {...props} 
        style={{ layout: 'vertical' }} 
        forceReRender={[currency]}
      />
    );
  }, [props, currency, isRejected]);

  return (
    <div className="paypal-button-container">
      {showSpinner && isPending && !isResolved && (
        <div className="flex justify-center my-4">
          <LoadingSpinner size="md" />
        </div>
      )}
      {buttons}
    </div>
  );
};

const PayPalButton = ({
  amount,
  currency,
  onSuccess,
  onError,
  onCancel,
  onProcessingChange,
}: PayPalButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cartItems } = useCart();
  const { data: session } = useSession();

  const createOrder = async (_: CreateOrderData, actions: CreateOrderActions) => {
    try {
      if (!session) {
        throw new Error('You must be logged in to complete this purchase');
      }

      setIsProcessing(true);
      setError(null);
      onProcessingChange?.(true);
      
      // Ensure we have a valid amount
      const orderAmount = Number(amount);
      if (isNaN(orderAmount) || orderAmount <= 0) {
        throw new Error('Invalid order amount');
      }

      // Create a simple order with just the required fields
      const orderData: { intent: 'CAPTURE' | 'AUTHORIZE', purchase_units: any[] } = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: orderAmount.toFixed(2)
          },
          items: cartItems.map(item => ({
            name: item.productName?.substring(0, 127) || `Item ${item.productId}`,
            unit_amount: {
              currency_code: currency,
              value: (item.price / Math.max(1, item.quantity)).toFixed(2),
            },
            quantity: Math.max(1, item.quantity).toString(),
            sku: item.productId?.toString() || 'SKU-UNKNOWN',
            category: 'PHYSICAL_GOODS'
          }))
        }]
      };

      console.log('Creating PayPal order:', orderData);
      if (!actions.order) {
        throw new Error('PayPal order actions not available');
      }
      const order = await actions.order.create(orderData);
      return order;
    } catch (error: any) {
      console.error('Error creating PayPal order:', error);
      const errorMessage = error?.message || 'Failed to create order';
      setError(errorMessage);
      onError?.(error);
      throw new Error(errorMessage);
    }
  };

  const onApprove = async (_: OnApproveData, actions: OnApproveActions) => {
    try {
      setIsProcessing(true);
      setError(null);
      onProcessingChange?.(true);
      
      if (!actions.order) {
        throw new Error('PayPal order actions not available');
      }
      
      const order = await actions.order.capture();
      onSuccess?.(order);
      return order;
    } catch (error: any) {
      console.error('Error capturing PayPal order:', error);
      const errorMessage = error?.message || 'Payment processing failed';
      setError(errorMessage);
      onError?.(error);
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
      onProcessingChange?.(false);
    }
  };

  // PayPal script options - memoize to prevent unnecessary re-renders
  const paypalOptions = useMemo(() => ({
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
    currency: currency,
    intent: 'CAPTURE',
    components: 'buttons',
  }), [currency]);

  return (
    <div className="w-full space-y-4">
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
      
      <PayPalScriptProvider options={paypalOptions}>
        <ButtonWrapper
          currency={currency}
          amount={amount}
          showSpinner={isProcessing}
          createOrder={createOrder}
          onApprove={onApprove}
          onCancel={onCancel}
          onError={(err: any) => {
            console.error('PayPal Error:', err);
            setError(err?.message || 'An error occurred with PayPal');
            onError?.(err);
          }}
          style={{ layout: 'vertical' }}
        />
      </PayPalScriptProvider>
      
      {isProcessing && (
        <div className="flex items-center justify-center p-4">
          <LoadingSpinner size="md" className="mr-2" />
          <span>Processing payment...</span>
        </div>
      )}
    </div>
  );
};

// Export a dynamic version of PayPalButton that only renders on the client side
export default dynamic(
  () => Promise.resolve(PayPalButton),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center my-4">
        <LoadingSpinner size="md" />
      </div>
    ),
  }
);
