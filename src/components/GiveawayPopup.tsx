'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface GiveawayPopupProps {
  onClose: () => void;
}

export default function GiveawayPopup({ onClose }: GiveawayPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Show popup after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if user has already seen the popup
      const hasSeenPopup = localStorage.getItem('hasSeenGiveawayPopup');
      if (!hasSeenPopup) {
        setIsVisible(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email && !phone) {
      setError('Please provide either an email or phone number');
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real app, you would send this data to your backend
      console.log('Giveaway entry:', { email, phone });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mark as submitted successfully
      setIsSuccess(true);
      
      // Remember that user has seen the popup
      localStorage.setItem('hasSeenGiveawayPopup', 'true');
      
      // Close popup after 3 seconds
      setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 3000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    // Remember that user has seen the popup
    localStorage.setItem('hasSeenGiveawayPopup', 'true');
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={handleClose}
          aria-hidden="true"
        />
        
        {/* Popup */}
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 p-6 text-left align-middle shadow-xl transition-all">
          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 text-chocolate-brown hover:text-soft-red transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-2xl font-playfair font-bold text-chocolate-brown">
                You're in!
              </h3>
              <p className="mt-2 text-chocolate-brown/80">
                Good luck! We'll contact the winner at the end of the month.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                  <svg
                    className="h-8 w-8 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-2xl font-playfair font-bold text-chocolate-brown">
                  Win a Free Dessert!
                </h3>
                <p className="mt-2 text-chocolate-brown/80">
                  Enter your email or phone for a chance to win a free dessert delivered to your door!
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="block w-full rounded-md border-chocolate-brown/20 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-3"
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-chocolate-brown/20" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-amber-50 px-2 text-chocolate-brown/60">
                      OR
                    </span>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="sr-only">
                    Phone number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    className="block w-full rounded-md border-chocolate-brown/20 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-3"
                  />
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-soft-red hover:bg-chocolate-brown focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? 'Entering...' : 'Enter to Win'}
                  </button>
                </div>
              </form>
              
              <p className="mt-4 text-xs text-center text-chocolate-brown/60">
                One winner chosen monthly. No purchase necessary. Must be 18+ to enter.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
