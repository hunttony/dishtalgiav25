'use client';

import { PayPalButtons, usePayPalScriptReducer, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useCart } from '@/contexts/CartContext';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

// Placeholder for LoadingSpinner (replace with actual implementation)
const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ size, className }) => (
  <div className={`spinner ${size} ${className}`}>Loading...</div>
);

// Placeholder for PayPalScriptErrorHandler (replace with actual implementation)
const PayPalScriptErrorHandler: React.FC<{ onError: (err: Error) => void }> = ({ onError }) => {
  const [{ isRejected }] = usePayPalScriptReducer();
  useEffect(() => {
    if (isRejected) {
      onError(new Error('Failed to load PayPal script'));
    }
  }, [isRejected, onError]);
  return null;
};

interface PayPalButtonProps {
  amount: number;
  currency?: string;
  onSuccess?: (details: any) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
  onProcessingChange?: (isProcessing: boolean) => void;
  disabled?: boolean;
  style?: {
    layout?: 'vertical' | 'horizontal';
    color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
    shape?: 'pill' | 'rect';
    label?: 'paypal' | 'checkout' | 'pay' | 'installment' | 'buynow' | 'subscribe' | 'donate';
    height?: number;
  };
  layout?: 'vertical' | 'horizontal';
  color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
  shape?: 'pill' | 'rect';
  label?: 'paypal' | 'checkout' | 'pay' | 'installment' | 'buynow' | 'subscribe' | 'donate';
  height?: number;
}

const PayPalButtonContent: React.FC<PayPalButtonProps> = ({
  amount,
  currency = 'USD',
  onSuccess,
  onError,
  onCancel,
  onProcessingChange,
  disabled = false,
  style = { layout: 'vertical' },
}) => {
  const { data: session } = useSession();
  const { items: cartItems } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  // Call onProcessingChange when isProcessing changes
  useEffect(() => {
    if (onProcessingChange) {
      onProcessingChange(isProcessing);
    }
  }, [isProcessing, onProcessingChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const createOrderInDatabase = useCallback(async (_orderDetails: any, paypalOrderId: string) => {
    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.productId,
            productName: item.productName,
            sizeId: item.sizeId,
            sizeName: item.sizeName,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          paymentId: paypalOrderId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }, [cartItems]);

  const createOrder = useCallback(
    async (_data: any, actions: any) => {
      console.log('[PayPal] createOrder called');

      if (!isMounted.current) return;

      try {
        if (!session?.user?.email) {
          throw new Error('You must be logged in to complete your purchase');
        }

        if (amount <= 0) {
          throw new Error('Invalid order amount');
        }

        setIsProcessing(true);
        setError(null);

        // Calculate the item total from cart items
        const itemTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const taxRate = 0.08; // 8% tax rate
        const tax = itemTotal * taxRate;
        const calculatedTotal = itemTotal + tax;
        
        // Ensure the calculated total matches the amount passed to the component
        if (Math.abs(calculatedTotal - amount) > 0.01) {
          console.warn(`Cart total ($${calculatedTotal.toFixed(2)}) does not match expected amount ($${amount.toFixed(2)})`);
        }

        const orderData = {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: currency,
                value: calculatedTotal.toFixed(2),
                breakdown: {
                  item_total: { 
                    currency_code: currency, 
                    value: itemTotal.toFixed(2) 
                  },
                  shipping: { 
                    currency_code: currency, 
                    value: '0.00' 
                  },
                  tax_total: { 
                    currency_code: currency, 
                    value: tax.toFixed(2) 
                  },
                },
              },
              items: cartItems.map((item, index) => ({
                name: item.productName,
                unit_amount: { 
                  currency_code: currency, 
                  value: item.price.toFixed(2) 
                },
                quantity: item.quantity.toString(),
                description: item.sizeName ? `${item.productName} (${item.sizeName})`.substring(0, 127) : item.productName?.substring(0, 127) || `Item ${index + 1}`,
                sku: `${item.productId}-${item.sizeId}`.substring(0, 127),
                category: 'PHYSICAL_GOODS'
              })),
              description: `Order from DishTalgia - ${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'}`,
              custom_id: `ORDER-${Date.now()}`,
              invoice_id: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            },
          ],
          application_context: {
            brand_name: 'DishTalgia',
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
            shipping_preference: 'NO_SHIPPING',
            return_url: `${window.location.origin}/checkout/success`,
            cancel_url: `${window.location.origin}/checkout`,
            locale: 'en-US',
          },
        };

        console.log('[PayPal] Creating order with data:', JSON.stringify(orderData, null, 2));

        const order = await actions.order.create(orderData);
        console.log('[PayPal] Order created successfully. Order ID:', order);
        return order;
      } catch (err) {
        console.error('[PayPal] Error creating order:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
        if (isMounted.current) {
          setError(errorMessage);
          toast.error(errorMessage);
        }
        throw err;
      }
    },
    [amount, currency, session, cartItems]
  );

  const onApprove = useCallback(
    async (data: any, actions: any) => {
      console.log('[PayPal] Payment approved. Order ID:', data.orderID);

      if (!isMounted.current) return;

      try {
        setIsProcessing(true);
        setError(null);

        // Capture the payment
        const details = await actions.order.capture();
        console.log('[PayPal] Payment captured:', details);

        // Create order in database
        const order = await createOrderInDatabase(details, data.orderID);
        console.log('[Order] Created in database:', order);

        if (onSuccess) {
          onSuccess({
            ...details,
            orderId: order.orderId,
            orderNumber: order.orderNumber
          });
        }

        // Redirect to success page
        window.location.href = `/checkout/success?orderId=${order.orderNumber}`;
      } catch (err) {
        console.error('[PayPal] Error processing order:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to process order';
        setError(errorMessage);
        toast.error(errorMessage);
        if (onError) {
          onError(err instanceof Error ? err : new Error(errorMessage));
        }
      } finally {
        if (isMounted.current) {
          setIsProcessing(false);
        }
      }
    },
    [onSuccess, onError, createOrderInDatabase]
  );

  const paypalOptions = useMemo(
    () => ({
      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
      currency,
      intent: 'capture',
      components: 'buttons',
      dataNamespace: 'paypal_sdk',
      dataSdkIntegrationSource: 'integrationbuilder_sc',
      disableFunding: 'card,venmo,sepa,bancontact,eps,giropay,ideal,mybank,p24',
      enableFunding: 'paypal',
      vault: false,
      debug: process.env.NODE_ENV === 'development',
      commit: true,
    }),
    [currency]
  );

  // Check if we're on the client side
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full flex justify-center p-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
      <PayPalScriptProvider options={paypalOptions}>
        <PayPalScriptErrorHandler
          onError={(err) => {
            console.error('[PayPal] Script Error:', err);
            if (isMounted.current) {
              setError('Failed to load PayPal. Please refresh the page and try again.');
              if (onError) {
                onError(err);
              }
            }
          }}
        />
        <PayPalButtons
          disabled={disabled || isProcessing}
          style={style}
          createOrder={createOrder}
          onApprove={onApprove}
          onCancel={() => {
            console.log('[PayPal] Payment cancelled');
            if (onCancel) {
              onCancel();
            }
          }}
          onError={(err) => {
            console.error('[PayPal] Button Error:', err);
            const errorMessage = err instanceof Error ? err.message : 'An error occurred with PayPal';
            if (isMounted.current) {
              setError(errorMessage);
              toast.error(errorMessage);
              if (onError) {
                onError(new Error(errorMessage));
              }
            }
          }}
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

export default dynamic(() => Promise.resolve(PayPalButtonContent), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center my-4">
      <LoadingSpinner size="md" />
    </div>
  ),
});