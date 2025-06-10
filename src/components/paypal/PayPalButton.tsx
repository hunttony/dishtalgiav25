'use client';

import { PayPalButtons, usePayPalScriptReducer, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

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

        const orderValue = amount.toFixed(2);
        const itemTotal = cartItems
          .reduce((sum, item) => sum + item.price * item.quantity, 0)
          .toFixed(2);

        const orderData = {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: currency,
                value: orderValue,
                breakdown: {
                  item_total: { currency_code: currency, value: itemTotal },
                  shipping: { currency_code: currency, value: '0.00' },
                  tax_total: { currency_code: currency, value: '0.00' },
                },
              },
              items: cartItems.map((item, index) => ({
                name: item.productName,
                unit_amount: { currency_code: currency, value: item.price.toFixed(2) },
                quantity: item.quantity,
                description: item.productName?.substring(0, 127) || `Item ${index + 1}`,
                sku: item.productId.toString().substring(0, 127),
              })),
              description: `Order from DishTalgia - ${cartItems.length} items`,
              custom_id: `ORDER-${Date.now()}`,
              invoice_id: `INV-${Date.now()}`,
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
      console.log('[PayPal] onApprove called with data:', data);
      try {
        setIsProcessing(true);
        const order = await actions.order.capture();
        console.log('[PayPal] Order captured successfully. Order details:', {
          orderID: order.id,
          status: order.status,
          createTime: order.create_time,
          payer: order.payer,
          purchaseUnits: order.purchase_units,
        });

        if (isMounted.current) {
          setError(null);
          if (onSuccess) {
            console.log('[PayPal] Calling onSuccess callback');
            onSuccess(order);
          } else {
            console.warn('[PayPal] No onSuccess callback provided');
          }
        }
      } catch (err) {
        console.error('[PayPal] Error capturing order:', err);
        const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
        if (isMounted.current) {
          setError(errorMessage);
          toast.error(errorMessage);
          if (onError) {
            onError(new Error(errorMessage));
          }
        }
      } finally {
        if (isMounted.current) {
          setIsProcessing(false);
        }
      }
    },
    [onSuccess, onError]
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