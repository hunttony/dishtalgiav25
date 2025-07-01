'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FiLock, FiArrowLeft, FiAlertCircle, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { update } = useSession();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }
      
      // Update session to reflect changes
      await update();
      
      toast.success('Password changed successfully!');
      router.push('/account/settings');
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error.message || 'Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center mb-6">
          <Link 
            href="/account/settings" 
            className="text-chocolate-brown hover:text-soft-red mr-4"
          >
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-chocolate-brown">Change Password</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                value={formData.currentPassword}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 border ${errors.currentPassword ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-soft-red focus:border-soft-red sm:text-sm`}
              />
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FiAlertCircle className="mr-1 h-4 w-4" />
                {errors.currentPassword}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                value={formData.newPassword}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 border ${errors.newPassword ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-soft-red focus:border-soft-red sm:text-sm`}
              />
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FiAlertCircle className="mr-1 h-4 w-4" />
                {errors.newPassword}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-soft-red focus:border-soft-red sm:text-sm`}
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FiAlertCircle className="mr-1 h-4 w-4" />
                {errors.confirmPassword}
              </p>
            )}
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-soft-red hover:bg-chocolate-brown focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soft-red disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Changing...
                </>
              ) : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
