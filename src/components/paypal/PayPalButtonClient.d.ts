import { FC } from 'react';

declare const PayPalButtonClient: FC<{
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
}>;

export default PayPalButtonClient;
