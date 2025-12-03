import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Maintains a navigation history of the last few visited paths.
 * Used for debugging 404 errors and for safe back navigation.
 */
const history: string[] = [];
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
 * Returns a previous path in the navigation history.
 * @param steps - How many steps back to go (1 = previous page, 2 = two pages back, etc.)
 * Returns undefined if there's no path at that position (e.g., user landed directly on this page).
 */
export const getPreviousPath = (steps: number = 1): string | undefined => {
  // history[history.length - 1] is current
  // history[history.length - 2] is 1 step back (previous)
  // history[history.length - 3] is 2 steps back, etc.
  const index = history.length - 1 - steps;
  return index >= 0 ? history[index] : undefined;
};

export const NavigationHistoryTracker = () => {
  const location = useLocation();

  useEffect(() => {
    addHistoryEntry(location.pathname + location.search + location.hash);
  }, [location]);

  return null;
};
