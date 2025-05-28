'use client';

import { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{success: boolean; message: string} | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      setSubmitStatus({
        success: true,
        message: 'Thank you for your message! We\'ll get back to you soon.'
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus({
        success: false,
        message: error instanceof Error ? error.message : 'Something went wrong. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-beige">
      {/* Hero Section */}
      <section className="relative h-64 flex items-center justify-center bg-cover bg-center" 
               style={{ backgroundImage: "url('/images/contact-hero.jpg')" }}>
        <div className="absolute inset-0 bg-chocolate-brown/60 flex items-center justify-center">
          <div className="text-center text-warm-white px-4">
            <h1 className="text-4xl md:text-6xl font-playfair font-bold mb-4">
              Contact Us
            </h1>
            <p className="text-xl md:text-2xl">
              We'd love to hear from you!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-playfair font-bold text-chocolate-brown mb-8">
                Get in Touch
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FaMapMarkerAlt className="h-6 w-6 text-soft-red" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-chocolate-brown">Our Location</h3>
                    <p className="mt-1 text-chocolate-brown/80">
                     <br />
                      Houston, TX 77060
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FaPhone className="h-5 w-5 text-soft-red" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-chocolate-brown">Phone</h3>
                    <p className="mt-1 text-chocolate-brown/80">
                      (832) 617-3766
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FaEnvelope className="h-5 w-5 text-soft-red" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-chocolate-brown">Email</h3>
                    <p className="mt-1 text-chocolate-brown/80">
                      info@dishtalgia.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <FaClock className="h-5 w-5 text-soft-red" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-chocolate-brown">Hours</h3>
                    <div className="mt-1 text-chocolate-brown/80 space-y-1">
                      <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p>Saturday: 10:00 AM - 4:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <h3 className="text-xl font-playfair font-bold text-chocolate-brown mb-4">
                  Follow Us
                </h3>
                <div className="flex space-x-4">
                  {['facebook', 'instagram', 'pinterest'].map((social) => (
                    <a
                      key={social}
                      href={`https://${social}.com/dishtalgia`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 w-10 rounded-full bg-chocolate-brown text-warm-white flex items-center justify-center hover:bg-soft-red transition-colors"
                      aria-label={social}
                    >
                      <span className="sr-only">{social}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-3xl font-playfair font-bold text-chocolate-brown mb-6">
                Send Us a Message
              </h2>
              
              {submitStatus && (
                <div className={`p-4 mb-6 rounded ${submitStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {submitStatus.message}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-chocolate-brown/80 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-chocolate-brown/20 rounded-md focus:ring-2 focus:ring-soft-red focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-chocolate-brown/80 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-chocolate-brown/20 rounded-md focus:ring-2 focus:ring-soft-red focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-chocolate-brown/80 mb-1">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-chocolate-brown/20 rounded-md focus:ring-2 focus:ring-soft-red focus:border-transparent bg-white"
                  >
                    <option value="">Select a subject</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Catering">Catering</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-chocolate-brown/80 mb-1">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-chocolate-brown/20 rounded-md focus:ring-2 focus:ring-soft-red focus:border-transparent"
                  ></textarea>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-soft-red hover:bg-chocolate-brown text-warm-white font-bold py-3 px-6 rounded-md transition-colors ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-96 w-full bg-gray-200">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3285.9685546751707!2d-95.40475866132826!3d29.950132893742794!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8640c9fa1ddc6a81%3A0xbdff2984a735330!2sGreenspoint%2C%20Houston%2C%20TX%2077060!5e1!3m2!1sen!2sus!4v1748297351833!5m2!1sen!2sus"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          aria-hidden="false"
          tabIndex={0}
        ></iframe>
      </section>
    </div>
  );
}
