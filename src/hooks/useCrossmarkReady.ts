/**
 * Hook to ensure Crossmark extension is fully loaded and ready
 * Prevents "Could not establish connection" errors
 */

import { useState, useEffect } from 'react';

export function useCrossmarkReady() {
  const [isReady, setIsReady] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 40;
    
    const checkCrossmark = () => {
      attempts++;
      
      // Check if window.crossmark exists
      if (window.crossmark) {
        setIsInstalled(true);
        
        // Additional check: ensure it has key methods/properties
        const hasRequiredMethods = 
          (typeof window.crossmark.connect === 'function' || 
           window.crossmark.methods?.connect ||
           window.crossmark.async?.connect) &&
          (window.crossmark.session !== undefined);
        
        if (hasRequiredMethods) {
          console.log('Crossmark extension is ready');
          setIsReady(true);
          setError(null);
          return true;
        }
      }
      
      // Check if we've exceeded max attempts
      if (attempts >= maxAttempts) {
        if (window.crossmark) {
          setError('Crossmark detected but not fully initialized. Please refresh the page.');
        } else {
          setIsInstalled(false);
          setError('Crossmark extension not detected. Please install it from crossmark.io');
        }
        console.warn('Crossmark initialization timeout');
        return true;
      }
      
      return false;
    };

    // Initial check
    if (checkCrossmark()) {
      return;
    }

    // Poll every 500ms
    const interval = setInterval(() => {
      if (checkCrossmark()) {
        clearInterval(interval);
      }
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return { isReady, isInstalled, error };
}
