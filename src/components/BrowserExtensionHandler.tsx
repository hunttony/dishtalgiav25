'use client';

import { useEffect, useRef } from 'react';

// List of browser extension attributes that might cause hydration issues
const EXTENSION_ATTRIBUTES = [
  'data-new-gr-c-s-check-loaded',
  'data-gr-ext-installed',
  'data-new-ui',
  'data-grammarly-shadow-root',
  'data-gramm',
  'data-grammarly-shadow-host',
  'data-grammarly-gbd',
  'data-enable-grammarly',
  'data-grammarly-extension',
  'data-grammarly-extension-version',
  'data-grammarly-extension-installed'
];

export function BrowserExtensionHandler() {
  const cleanupInterval = useRef<NodeJS.Timeout>();
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    // Only run on client side and after the page is fully loaded
    if (typeof document === 'undefined' || typeof window === 'undefined') return;

    // Skip if this is a MetaMask page or if ethereum is not available
    if (window.ethereum) {
      // If ethereum is defined but not MetaMask, continue
      if (window.ethereum.isMetaMask === false) {
        return;
      }
    }

    const cleanupExtensions = () => {
      const body = document.body;
      const html = document.documentElement;
      
      if (!body || !html) return;

      // Remove extension attributes from both body and html elements
      [body, html].forEach((element) => {
        // Get all attributes and filter for ones that match our patterns
        const attributes = Array.from(element.attributes);
        attributes.forEach(({ name }) => {
          if (EXTENSION_ATTRIBUTES.some(attr => name.startsWith(attr)) || 
              name.startsWith('data-grammarly-')) {
            element.removeAttribute(name);
          }
        });
      });

      // Add a class to indicate extensions are being handled
      body.classList.add('extensions-handled');
    };

    // Initial cleanup
    cleanupExtensions();

    // Set up a mutation observer to catch any late-adding extensions
    observerRef.current = new MutationObserver((mutations) => {
      let needsCleanup = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (EXTENSION_ATTRIBUTES.some(attr => mutation.attributeName?.startsWith(attr)) ||
             mutation.attributeName?.startsWith('data-grammarly-'))) {
          needsCleanup = true;
        }
      });
      
      if (needsCleanup) {
        cleanupExtensions();
      }
    });

    // Start observing the document
    if (observerRef.current) {
      observerRef.current.observe(document.documentElement, {
        attributes: true,
        attributeFilter: EXTENSION_ATTRIBUTES,
        childList: true,
        subtree: true,
        attributeOldValue: false,
        characterData: false
      });
    }

    // Set up a mutation observer for the body specifically
    const bodyObserver = new MutationObserver(cleanupExtensions);
    bodyObserver.observe(document.body, {
      attributes: true,
      attributeFilter: EXTENSION_ATTRIBUTES,
      childList: false,
      subtree: false
    });

    // Clean up the observers and interval when the component unmounts
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      bodyObserver.disconnect();
      
      if (cleanupInterval.current) {
        clearInterval(cleanupInterval.current);
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
}
