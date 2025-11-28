import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Maintains a navigation history of the last few visited paths to help with debugging 404 errors.
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

export const NavigationHistoryTracker = () => {
  const location = useLocation();

  useEffect(() => {
    addHistoryEntry(location.pathname + location.search + location.hash);
  }, [location]);

  return null;
};
