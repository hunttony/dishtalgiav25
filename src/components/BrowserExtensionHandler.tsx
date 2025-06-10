'use client';

import { useEffect } from 'react';

// List of browser extension attributes that might cause hydration issues
const EXTENSION_ATTRIBUTES = [
  'data-new-gr-c-s-check-loaded',
  'data-gr-ext-installed',
  'data-new-ui',
  'data-grammarly-shadow-root'
];

export function BrowserExtensionHandler() {
  useEffect(() => {
    // Only run on client side
    if (typeof document === 'undefined') return;

    const cleanupExtensions = () => {
      const body = document.body;
      if (!body) return;

      // Remove extension attributes
      EXTENSION_ATTRIBUTES.forEach(attr => {
        if (body.hasAttribute(attr)) {
          body.removeAttribute(attr);
        }
      });

      // Force a reflow to ensure React's hydration completes
      // This helps prevent the hydration mismatch warning
      void document.body.offsetHeight;
    };

    // Run cleanup on mount
    cleanupExtensions();

    // Set up a mutation observer to catch any late-adding extensions
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'data-new-gr-c-s-check-loaded' || 
             mutation.attributeName === 'data-gr-ext-installed')) {
          cleanupExtensions();
        }
      });
    });

    // Start observing the document with the configured parameters
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-new-gr-c-s-check-loaded', 'data-gr-ext-installed'],
      childList: false,
      subtree: true
    });

    // Clean up the observer when the component unmounts
    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
