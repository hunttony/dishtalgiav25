import { FC } from 'react';

declare module '@/components/paypal/PayPalButtonClient' {
  import { PayPalButtonClientProps } from '@/components/paypal/types';
  
  const PayPalButtonClient: FC<PayPalButtonClientProps>;
  export default PayPalButtonClient;
}
