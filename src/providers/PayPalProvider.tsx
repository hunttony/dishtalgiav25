'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useEffect, useState } from 'react';

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

// This ensures the PayPal SDK is only loaded on the client side
const DynamicPayPalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: paypalClientId,
        components: 'buttons',
        currency: 'USD',
        intent: 'capture'
      }}
      deferLoading={true}
    >
      {children}
    </PayPalScriptProvider>
  );
};

export function PayPalProvider({ children }: { children: React.ReactNode }) {
  // Only render the PayPal provider if we have a client ID
  if (!paypalClientId) {
    console.warn('PayPal client ID is missing. PayPal functionality will be disabled.');
    return <>{children}</>;
  }

  return <DynamicPayPalProvider>{children}</DynamicPayPalProvider>;
}
