import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | DishTalgia',
  description: 'Privacy Policy for DishTalgia',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-chocolate-brown mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              We collect information that you provide directly to us, such as when you create an account, place an order, or contact us.
            </p>

            <h2 className="text-xl font-semibold mb-4 mt-8">2. How We Use Your Information</h2>
            <p className="mb-4">
              We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
            </p>

            <h2 className="text-xl font-semibold mb-4 mt-8">3. Information Sharing</h2>
            <p className="mb-4">
              We do not share your personal information with third parties except as described in this Privacy Policy.
            </p>

            <h2 className="text-xl font-semibold mb-4 mt-8">4. Data Security</h2>
            <p className="mb-4">
              We implement appropriate security measures to protect against unauthorized access, alteration, or destruction of your personal information.
            </p>

            <h2 className="text-xl font-semibold mb-4 mt-8">5. Your Choices</h2>
            <p className="mb-4">
              You may update, correct, or delete information about you at any time by logging into your account or contacting us.
            </p>

            <h2 className="text-xl font-semibold mb-4 mt-8">6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@dishtalgia.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
