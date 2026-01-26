import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Maintains a navigation history of the last few visited paths.
 * Used for debugging 404 errors and for safe back navigation.
 */
const history: string[] = [];
const historyErrors: string[] = [];
const MAX_HISTORY_LENGTH = 5;

const addHistoryEntry = (path: string) => {
  if (history.length > 0 && history[history.length - 1] === path) {
    return;
  }
  history.push(path);
  if (history.length > MAX_HISTORY_LENGTH) {
    history.shift();
  }
};

export const getNavigationHistory = () => [...history];

/**
 * Returns a previous path in the navigation history that is not marked as an error.
 * @param steps - How many steps back to go (1 = previous page, 2 = two pages back, etc.)
 * Returns undefined if there's no path at that position (e.g., user landed directly on this page).
 */
export const getPreviousSafePath = (minSteps: number = 1): string | undefined => {
  // history[history.length - 1] is current
  // history[history.length - 2] is 1 step back (previous)
  // history[history.length - 3] is 2 steps back, etc.

  for (let i = history.length - minSteps - 1; i >= 0; i--) {
    const path = history[i];
    if (!historyErrors.includes(path)) {
      return path;
    }
  }
  return undefined;
};

/**
 * Mark a URL as problematic, either user doesn't have permission to see it or it doesn't exist anymore...
 * We don't restrict navigate to such URLs in any way, but we will avoid redirecting users back to them automatically.
 */
export const setNavigationHistoryError = (url: string | undefined) => {
  if (!url || historyErrors.includes(url)) {
    return;
  }
  historyErrors.push(url);
};

export const NavigationHistoryTracker = () => {
  const location = useLocation();

  useEffect(() => {
    addHistoryEntry(location.pathname + location.search + location.hash);
  }, [location]);

  return null;
};
