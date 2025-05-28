import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | DishTalgia',
  description: 'Terms of Service for DishTalgia',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-chocolate-brown mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to DishTalgia! These terms and conditions outline the rules and regulations for the use of our website.
            </p>

            <h2 className="text-xl font-semibold mb-4 mt-8">2. Intellectual Property</h2>
            <p className="mb-4">
              The content, layout, design, data, and graphics on this website are protected by intellectual property laws.
            </p>

            <h2 className="text-xl font-semibold mb-4 mt-8">3. User Responsibilities</h2>
            <p className="mb-4">
              As a user of our website, you agree to use our services in accordance with all applicable laws and regulations.
            </p>

            <h2 className="text-xl font-semibold mb-4 mt-8">4. Limitation of Liability</h2>
            <p className="mb-4">
              DishTalgia will not be liable for any indirect, consequential, or incidental damages arising out of the use of our services.
            </p>

            <h2 className="text-xl font-semibold mb-4 mt-8">5. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these terms at any time. Your continued use of the site after changes constitutes acceptance.
            </p>

            <h2 className="text-xl font-semibold mb-4 mt-8">6. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at support@dishtalgia.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
