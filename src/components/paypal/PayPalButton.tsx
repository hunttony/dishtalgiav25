'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { PayPalButtonClientProps, LoadingSpinnerProps } from './types';

// Loading spinner component
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => (
  <div className={`flex items-center justify-center p-4 ${className}`}>
    <div 
      className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${
        size === 'sm' ? 'h-6 w-6' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8'
      }`}
      aria-label="Loading..."
    />
  </div>
);

// This component will only be rendered on the client side
const ClientOnlyPayPalButton = dynamic<PayPalButtonClientProps>(
  () => import('@/components/paypal/PayPalButtonClient').then(mod => ({
    default: mod.PayPalButtonClient
  })),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex justify-center p-8">
        <LoadingSpinner size="md" />
      </div>
    ) 
  }
);

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
}

const PayPalButton: React.FC<PayPalButtonProps> = ({
  amount,
  currency = 'USD',
  onSuccess,
  onError,
  onCancel,
  onProcessingChange,
  disabled = false,
  style = { layout: 'vertical' },
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full flex justify-center p-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <ClientOnlyPayPalButton
        amount={amount}
        currency={currency}
        onSuccess={onSuccess}
        onError={onError}
        onCancel={onCancel}
        onProcessingChange={onProcessingChange}
        disabled={disabled}
        style={style}
      />
    </div>
  );
};

export default PayPalButton;