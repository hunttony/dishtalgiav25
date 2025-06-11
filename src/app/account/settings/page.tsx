'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiPhone, FiMapPin, FiLogOut, FiLock, FiAlertCircle, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ProtectedRoute from '../../../../components/ProtectedRoute';

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface UserData {
  name: string;
  email: string;
  phone?: string;
  address?: Address;
}

interface UserSession {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified?: Date | null;
  address?: Address;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface UserData {
  name: string;
  email: string;
  phone?: string;
  address?: Address;
}

interface UserSession extends UserData {
  id: string;
  image?: string | null;
  emailVerified?: Date | null;
}

export default function AccountSettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    },
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (session?.user) {
      const user = session.user as UserSession;
      // Initialize form with user data from session
      setUserData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || 'United States',
        },
      });
      setIsLoading(false);
    }
  }, [session]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!userData.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!userData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Phone validation (optional)
    if (userData.phone && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(userData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Address validation (if address exists)
    if (userData.address) {
      const { street, city, state, zipCode, country } = userData.address;
      if (!street?.trim()) newErrors['address.street'] = 'Street address is required';
      if (!city?.trim()) newErrors['address.city'] = 'City is required';
      if (!state?.trim()) newErrors['address.state'] = 'State is required';
      if (!zipCode?.trim()) newErrors['address.zipCode'] = 'ZIP code is required';
      if (!country?.trim()) newErrors['address.country'] = 'Country is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1] as keyof Address;
      setUserData(prev => ({
        ...prev,
        address: {
          ...(prev.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'United States',
          }),
          [addressField]: value,
        },
      }));
    } else {
      setUserData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setIsSaving(true);

    try {
      // Update user data in your database
      const response = await fetch('/api/account/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update profile');
      }

      // Update the session with new data
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          ...userData,
        },
      });

      toast.success('Profile updated successfully!', {
        position: 'bottom-center',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to update profile. Please try again.',
        { duration: 5000 }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = () => {
    // Implement password change flow
    router.push('/account/change-password');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="animate-spin mx-auto mb-4">
            <FiLoader className="h-12 w-12 text-chocolate-brown" />
          </div>
          <p className="text-chocolate-brown">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-amber-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-playfair font-bold text-chocolate-brown">
              Account Settings
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your account information and preferences
            </p>
          </div>

          {Object.keys(errors).length > 0 && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FiAlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    There {Object.keys(errors).length === 1 ? 'is' : 'are'} {Object.keys(errors).length} error{Object.keys(errors).length !== 1 ? 's' : ''} with your profile
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul role="list" className="list-disc pl-5 space-y-1">
                      {Object.entries(errors).map(([field, message]) => (
                        <li key={field}>
                          {field.startsWith('address.') ? `${field.split('.')[1]}: ${message}` : message}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <form onSubmit={handleSubmit} className="divide-y divide-gray-200" noValidate>
              {/* Personal Information */}
              <div className="px-6 py-5">
                <h2 className="text-lg font-medium text-chocolate-brown mb-4 flex items-center">
                  <FiUser className="mr-2" />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={userData.name}
                        onChange={handleChange}
                        className={`focus:ring-soft-red focus:border-soft-red block w-full pl-10 sm:text-sm border-gray-300 rounded-md ${
                          errors.name ? 'border-red-300 text-red-900 placeholder-red-300' : ''
                        }`}
                        placeholder="John Doe"
                        disabled={isSaving}
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                      />
                      {errors.name && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <FiAlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600" id="name-error">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={userData.email}
                          onChange={handleChange}
                          className={`bg-gray-100 focus:ring-soft-red focus:border-soft-red block w-full pl-10 sm:text-sm border-gray-300 rounded-md ${
                            errors.email ? 'border-red-300 text-red-900 placeholder-red-300' : ''
                          }`}
                          placeholder="you@example.com"
                          disabled={isSaving}
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? 'email-error' : undefined}
                        />
                        {errors.email && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <FiAlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-600" id="email-error">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="relative">
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={userData.phone || ''}
                          onChange={handleChange}
                          className={`focus:ring-soft-red focus:border-soft-red block w-full pl-10 sm:text-sm border-gray-300 rounded-md ${
                            errors.phone ? 'border-red-300 text-red-900 placeholder-red-300' : ''
                          }`}
                          placeholder="(123) 456-7890"
                          disabled={isSaving}
                          aria-invalid={!!errors.phone}
                          aria-describedby={errors.phone ? 'phone-error' : undefined}
                        />
                        {errors.phone && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <FiAlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      {errors.phone && (
                        <p className="mt-2 text-sm text-red-600" id="phone-error">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleChangePassword}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-soft-red bg-amber-50 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soft-red"
                    >
                      <FiLock className="mr-2 h-4 w-4" />
                      Change Password
                    </button>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="px-6 py-5">
                <h2 className="text-lg font-medium text-chocolate-brown mb-4 flex items-center">
                  <FiMapPin className="mr-2" />
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="md:col-span-2">
                    <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                      Street Address
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="address.street"
                        id="address.street"
                        value={userData.address?.street || ''}
                        onChange={handleChange}
                        className={`mt-1 focus:ring-soft-red focus:border-soft-red block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors['address.street'] ? 'border-red-300 text-red-900 placeholder-red-300' : ''
                        }`}
                        placeholder="123 Main St"
                        disabled={isSaving}
                        aria-invalid={!!errors['address.street']}
                        aria-describedby={errors['address.street'] ? 'address-street-error' : undefined}
                      />
                      {errors['address.street'] && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none top-6">
                          <FiAlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    {errors['address.street'] && (
                      <p className="mt-2 text-sm text-red-600" id="address-street-error">
                        {errors['address.street']}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="address.city"
                        id="address.city"
                        value={userData.address?.city || ''}
                        onChange={handleChange}
                        className={`mt-1 focus:ring-soft-red focus:border-soft-red block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors['address.city'] ? 'border-red-300 text-red-900 placeholder-red-300' : ''
                        }`}
                        placeholder="New York"
                        disabled={isSaving}
                        aria-invalid={!!errors['address.city']}
                        aria-describedby={errors['address.city'] ? 'address-city-error' : undefined}
                      />
                      {errors['address.city'] && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none top-6">
                          <FiAlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    {errors['address.city'] && (
                      <p className="mt-2 text-sm text-red-600" id="address-city-error">
                        {errors['address.city']}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                      State / Province
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="address.state"
                        id="address.state"
                        value={userData.address?.state || ''}
                        onChange={handleChange}
                        className={`mt-1 focus:ring-soft-red focus:border-soft-red block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors['address.state'] ? 'border-red-300 text-red-900 placeholder-red-300' : ''
                        }`}
                        placeholder="California"
                        disabled={isSaving}
                        aria-invalid={!!errors['address.state']}
                        aria-describedby={errors['address.state'] ? 'address-state-error' : undefined}
                      />
                      {errors['address.state'] && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none top-6">
                          <FiAlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    {errors['address.state'] && (
                      <p className="mt-2 text-sm text-red-600" id="address-state-error">
                        {errors['address.state']}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700">
                      ZIP / Postal Code
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="address.zipCode"
                        id="address.zipCode"
                        value={userData.address?.zipCode || ''}
                        onChange={handleChange}
                        className={`mt-1 focus:ring-soft-red focus:border-soft-red block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors['address.zipCode'] ? 'border-red-300 text-red-900 placeholder-red-300' : ''
                        }`}
                        placeholder="10001"
                        disabled={isSaving}
                        aria-invalid={!!errors['address.zipCode']}
                        aria-describedby={errors['address.zipCode'] ? 'address-zipCode-error' : undefined}
                      />
                      {errors['address.zipCode'] && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none top-6">
                          <FiAlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    {errors['address.zipCode'] && (
                      <p className="mt-2 text-sm text-red-600" id="address-zipCode-error">
                        {errors['address.zipCode']}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="address.country" className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <div className="relative">
                      <select
                        id="address.country"
                        name="address.country"
                        value={userData.address?.country || 'United States'}
                        onChange={handleChange}
                        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-soft-red focus:border-soft-red sm:text-sm rounded-md ${
                          errors['address.country'] ? 'border-red-300 text-red-900' : ''
                        }`}
                        disabled={isSaving}
                        aria-invalid={!!errors['address.country']}
                        aria-describedby={errors['address.country'] ? 'address-country-error' : undefined}
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="Mexico">Mexico</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors['address.country'] && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <FiAlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    {errors['address.country'] && (
                      <p className="mt-2 text-sm text-red-600" id="address-country-error">
                        {errors['address.country']}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="px-6 py-4 bg-gray-50 text-right">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soft-red"
                  >
                    <FiLogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </button>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soft-red disabled:opacity-70 disabled:cursor-not-allowed"
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-soft-red hover:bg-chocolate-brown focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soft-red disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <span className="animate-spin mr-2">
                            <FiLoader className="h-4 w-4" />
                          </span>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
