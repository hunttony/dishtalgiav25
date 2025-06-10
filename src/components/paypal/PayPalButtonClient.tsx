'use client';

import { PayPalButtons } from '@paypal/react-paypal-js';
import { useCallback, useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface PayPalButtonClientProps {
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
}

const PayPalButtonClient: React.FC<PayPalButtonClientProps> = ({
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const createOrderInDatabase = useCallback(async (paypalOrderId: string) => {
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

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }, [cartItems]);

  const createOrder = useCallback(
    async (_data: any, actions: any) => {
      console.log('[PayPal] createOrder called');

      try {
        if (!session?.user?.email) {
          throw new Error('You must be logged in to complete your purchase');
        }

        if (amount <= 0) {
          throw new Error('Invalid order amount');
        }

        onProcessingChange?.(true);

        const itemTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const taxRate = 0.08;
        const tax = itemTotal * taxRate;
        const calculatedTotal = itemTotal + tax;

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
                  item_total: { currency_code: currency, value: itemTotal.toFixed(2) },
                  shipping: { currency_code: currency, value: '0.00' },
                  tax_total: { currency_code: currency, value: tax.toFixed(2) },
                },
              },
              items: cartItems.map((item, index) => ({
                name: item.productName,
                unit_amount: { currency_code: currency, value: item.price.toFixed(2) },
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
        toast.error(errorMessage);
        onProcessingChange?.(false);
        throw err;
      }
    },
    [amount, currency, cartItems, session, onProcessingChange, toast]
  );

  const onApprove = useCallback(
    async (data: any, actions: any) => {
      console.log('[PayPal] Payment approved. Order ID:', data.orderID);

      try {
        onProcessingChange?.(true);
        
        // 1. First create the order in the database
        let order;
        try {
          order = await createOrderInDatabase(data.orderID);
          console.log('[Order] Created in database:', order);
        } catch (dbError) {
          console.error('[Order] Failed to create order in database:', dbError);
          // Notify admin about the failed order that needs manual processing
          await fetch('/api/admin/notify-failed-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paypalOrderId: data.orderID,
              error: dbError instanceof Error ? dbError.message : 'Unknown error',
              timestamp: new Date().toISOString()
            })
          });
          
          throw new Error('Your payment was processed, but we encountered an issue saving your order. Please contact support with your PayPal transaction ID.');
        }

        // 2. Then capture the payment
        const details = await actions.order.capture();
        console.log('[PayPal] Payment captured:', details);

        // 3. Update the order with payment details
        try {
          const updateResponse = await fetch('/api/orders/update-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: order.orderId,
              paymentDetails: details,
              paymentStatus: details.status || 'completed'
            })
          });
          
          if (!updateResponse.ok) {
            throw new Error('Failed to update order with payment details');
          }
          
          console.log('[Order] Payment details updated successfully');
        } catch (updateError) {
          console.error('[Order] Failed to update order with payment details:', updateError);
          // Non-critical error, log but don't fail the order
          // You might want to implement a retry mechanism here
        }

        if (onSuccess) {
          onSuccess({
            ...details,
            orderId: order.orderId,
            orderNumber: order.orderNumber
          });
        }

        // 4. Only redirect after everything is complete
        window.location.href = `/checkout/success?orderId=${order.orderNumber}`;
      } catch (err) {
        console.error('[PayPal] Error in payment processing:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to process payment';
        toast.error(errorMessage);
        onError?.(new Error(errorMessage));
      } finally {
        onProcessingChange?.(false);
      }
    },
    [onSuccess, onError, onProcessingChange, createOrderInDatabase, toast]
  );

  const handlePayPalError = useCallback(
    (err: any) => {
      console.error('[PayPal] Error:', err);
      const errorMessage = err?.message || 'An error occurred with PayPal';
      toast.error(errorMessage);
      onProcessingChange?.(false);
      onError?.(new Error(errorMessage));
    },
    [onError, onProcessingChange]
  );

  // Don't render anything during SSR
  if (!isMounted) {
    return null;
  }

  return (
    <div className="w-full">
      <PayPalButtons
        style={{
          ...style,
          height: style?.height || 55,
          layout: style?.layout || 'vertical',
          color: style?.color || 'gold',
          shape: style?.shape || 'rect',
          label: style?.label || 'paypal',
        }}
        disabled={disabled}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={handlePayPalError}
        onCancel={onCancel}
      />
    </div>
  );
};

// Export as named export to avoid default export issues
export { PayPalButtonClient };
