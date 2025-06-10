'use client';

import { useEffect } from 'react';

export default function Body({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Remove extension attributes that cause hydration mismatch
    document.body.removeAttribute('data-new-gr-c-s-check-loaded');
    document.body.removeAttribute('data-gr-ext-installed');
  }, []);

  return <>{children}</>;
}
