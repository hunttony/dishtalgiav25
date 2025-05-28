import Link from 'next/link';
import { FacebookIcon, InstagramIcon, TwitterIcon } from './Icons';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-chocolate-brown text-warm-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-playfair font-bold mb-4">Dishtalgia</h3>
            <p className="text-sm text-warm-white/80 mb-4">
              Crafting Southern-inspired banana puddings with love and nostalgia. 
              Each bite takes you back to the comforting flavors of home.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-warm-white hover:text-golden-yellow">
                <span className="sr-only">Facebook</span>
                <FacebookIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-warm-white hover:text-golden-yellow">
                <span className="sr-only">Instagram</span>
                <InstagramIcon className="h-6 w-6" />
              </a>
              <a href="#" className="text-warm-white hover:text-golden-yellow">
                <span className="sr-only">Twitter</span>
                <TwitterIcon className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-playfair font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-warm-white/80 hover:text-golden-yellow text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-warm-white/80 hover:text-golden-yellow text-sm">
                  Our Puddings
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-warm-white/80 hover:text-golden-yellow text-sm">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-warm-white/80 hover:text-golden-yellow text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-playfair font-semibold mb-4">Contact Us</h4>
            <address className="not-italic text-sm text-warm-white/80 space-y-2">
              <p>Greenspoint, Houston, TX 77060</p>
              <p>
                <a href="mailto:info@dishtalgia.com" className="hover:text-golden-yellow">
                  info@dishtalgia.com
                </a>
              </p>
              <p>
                <a href="tel:+18326173766" className="hover:text-golden-yellow">
                  (832) 617-3766
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="border-t border-warm-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-warm-white/60">
            &copy; {currentYear} Dishtalgia. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="text-sm text-warm-white/60 hover:text-golden-yellow">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-warm-white/60 hover:text-golden-yellow">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
