import { createContext, FC, ReactNode, useState, useEffect, useContext } from 'react';
import { warn as logWarn, TagCategoryValues } from '@/core/logging/sentry/log';
import { clearGuestWhiteboardUrl } from '../utils/sessionStorage';


const STORAGE_KEY = 'alkemio_guest_name';

export interface GuestSessionContextValue {
  guestName: string | null;
  isGuest: boolean;
  isStorageAvailable: boolean;
  setGuestName: (name: string) => void;
  clearGuestSession: () => void;
}

export const GuestSessionContext = createContext<GuestSessionContextValue | undefined>(undefined);

export interface GuestSessionProviderProps {
  children: ReactNode;
}

/**
 * Provider for guest session state management
 * Manages guest name in session storage and provides context to child components
 */
export const GuestSessionProvider: FC<GuestSessionProviderProps> = ({ children }) => {
  const [guestName, setGuestNameState] = useState<string | null>(null);
  const [isStorageAvailable, setIsStorageAvailable] = useState(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        setGuestNameState(stored);
      }
    } catch (error) {
      logWarn(`Session storage unavailable: ${error}`, { category: TagCategoryValues.AUTH });
      setIsStorageAvailable(false);
    }
  }, []);

  const setGuestName = (name: string) => {
    setGuestNameState(name);
    try {
      sessionStorage.setItem(STORAGE_KEY, name);
    } catch (error) {
      logWarn(`Failed to persist guest name: ${error}`, { category: TagCategoryValues.AUTH });
    }
  };

  const clearGuestSession = () => {
    setGuestNameState(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      // Also clear stored whiteboard URL when guest session ends
      clearGuestWhiteboardUrl();
    } catch (error) {
      logWarn(`Failed to clear guest session: ${error}`, { category: TagCategoryValues.AUTH });
    }
  };

  const value: GuestSessionContextValue = {
    guestName,
    setGuestName,
    clearGuestSession,
    isGuest: !!guestName,
    isStorageAvailable,
  };

  return <GuestSessionContext.Provider value={value}>{children}</GuestSessionContext.Provider>;
};

/**
 * Custom hook to access guest session context
 * Must be used within GuestSessionProvider
 */
export const useGuestSessionContext = () => {
  const context = useContext(GuestSessionContext);
  if (!context) {
    throw new Error('useGuestSessionContext must be used within GuestSessionProvider');
  }
  return context;
};
