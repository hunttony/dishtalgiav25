'use client';

import { useEffect } from 'react';

export function BrowserExtensionHandler() {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const body = document.querySelector('body');
      if (body) {
        // Remove any browser extension attributes
        if (body.hasAttribute('data-new-gr-c-s-check-loaded')) {
          body.removeAttribute('data-new-gr-c-s-check-loaded');
        }
        if (body.hasAttribute('data-gr-ext-installed')) {
          body.removeAttribute('data-gr-ext-installed');
        }
      }
    }
  }, []);

  return null;
}
