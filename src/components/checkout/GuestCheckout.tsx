'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FiMail, FiUser } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface GuestCheckoutProps {
  onCheckout: (guestInfo: { name: string; email: string }) => void;
}

export default function GuestCheckout({ onCheckout }: GuestCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!name || !email) {
      toast.error('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    onCheckout({ name, email });
    setIsLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Guest Checkout</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<FiUser className="h-5 w-5 text-gray-400" />}
          />
        </div>
        <div>
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<FiMail className="h-5 w-5 text-gray-400" />}
          />
        </div>
        <div>
          <Button
            type="submit"
            className="w-full bg-soft-red hover:bg-chocolate-brown text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <LoadingSpinner className="h-5 w-5" />
            ) : (
              'Continue as Guest'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
