'use client';

import { useState, useEffect } from 'react';

export function useWebGLSupport(): boolean {
  const [isSupported, setIsSupported] = useState<boolean>(true); // Default to true to prevent hydration mismatch, update on client

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        setIsSupported(false);
        return;
      }
      
      // Check for basic WebGL extension or features if needed, but standard gl is enough
      setIsSupported(true);
    } catch (e) {
      setIsSupported(false);
    }
  }, []);

  return isSupported;
}
