import { useState, useEffect } from 'react';

export function useMediaQuery() {
  const [state, setState] = useState(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1280;
    return {
      isMobile: w < 768,
      isTablet: w >= 768 && w < 1024,
      isDesktop: w >= 1024,
    };
  });

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      setState({
        isMobile: w < 768,
        isTablet: w >= 768 && w < 1024,
        isDesktop: w >= 1024,
      });
    }
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return state;
}
