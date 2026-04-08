import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export function useScreenSize() {
  const isSmallScreen = useMediaQuery('(max-width: 639px)');
  const isMediumScreen = useMediaQuery('(min-width: 640px) and (max-width: 1099px)');
  const isLargeScreen = useMediaQuery('(min-width: 1100px)');

  return { isSmallScreen, isMediumScreen, isLargeScreen };
}
