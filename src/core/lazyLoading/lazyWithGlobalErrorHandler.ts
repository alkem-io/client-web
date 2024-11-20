import React from 'react';
import { getGlobalErrorSetter } from './GlobalErrorContext';

type ImportFunc<T> = () => Promise<{ default: React.ComponentType<T> }>;

export const lazyWithGlobalErrorHandler = <T>(
  importFunc: ImportFunc<T>
): React.LazyExoticComponent<React.ComponentType<T>> => {
  return React.lazy(async () => {
    try {
      return await importFunc();
    } catch (error) {
      const setError = getGlobalErrorSetter();
      setError(error as Error);

      // it looks like this error is already logged by the useErrorLoggerLink (network error)

      // Instead of throwing, return a fallback component to prevent
      // catching it in the ErrorBoundary
      return {
        default: () => null,
      };
    }
  });
};
