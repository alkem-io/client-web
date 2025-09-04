import React, { createContext, useContext, useState, ReactNode } from 'react';

type GlobalErrorContextType = {
  error: Error | null;
  setError: (error: Error | null) => void;
};

// Global function to set error (to be initialized by provider)
let setGlobalError: ((error: Error | null) => void) | null = null;

export const useGlobalError = (): GlobalErrorContextType => {
  const context = useContext(GlobalErrorContext);
  if (!context) {
    throw new Error('useGlobalError must be used within a GlobalErrorProvider');
  }
  return context;
};

const GlobalErrorContext = createContext<GlobalErrorContextType | undefined>(undefined);

// GlobalErrorProvider but used only for LazyLoading ATM
// see SentryErrorBoundary for global error handling
export const GlobalErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [error, setError] = useState<Error | null>(null);

  // Set the global error function during initialization
  setGlobalError = setError;

  return <GlobalErrorContext value={{ error, setError }}>{children}</GlobalErrorContext>;
};

// the global error setter
export const getGlobalErrorSetter = (): ((error: Error | null) => void) => {
  if (!setGlobalError) {
    throw new Error('GlobalErrorProvider is not initialized.');
  }
  return setGlobalError;
};
