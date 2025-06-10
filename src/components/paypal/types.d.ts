// PayPalButtonClient component props
export interface PayPalButtonClientProps {
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

// PayPalButton component props
export interface PayPalButtonProps extends PayPalButtonClientProps {}

// Loading spinner props
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
