import React from 'react';
import { getGlobalErrorSetter } from './GlobalErrorContext';

type ImportFunc<T> = () => Promise<{ default: React.ComponentType<T> }>;

export class LazyLoadError extends Error {
  constructor(originalError: Error) {
    super(originalError.message);
    this.name = 'LazyLoadError';
    Object.setPrototypeOf(this, LazyLoadError.prototype);
  }
}

export const lazyWithGlobalErrorHandler = <T>(
  importFunc: ImportFunc<T>
): React.LazyExoticComponent<React.ComponentType<T>> => {
  return React.lazy(async () => {
    try {
      console.log('lazyWithGlobalErrorHandler init 1');
      return await importFunc();
    } catch (error) {
      const setError = getGlobalErrorSetter();
      const originalError: Error =
        error instanceof Error ? error : error?.['message'] ? new Error(error['message']) : new Error('Unknown error');

      setError(new LazyLoadError(originalError));

      // it looks like this error is already logged by the useErrorLoggerLink (network error)

      // Instead of throwing, return a fallback component to prevent
      // catching it in the ErrorBoundary
      return {
        default: () => null,
      };
    }
  });
};

export const lazyImportWithErrorHandler = async <T>(importFunc: () => Promise<T>): Promise<T> => {
  try {
    console.log('lazyImportWithErrorHandler init 2');
    return await importFunc();
  } catch (error) {
    const setError = getGlobalErrorSetter();
    const originalError: Error =
      error instanceof Error ? error : error?.['message'] ? new Error(error['message']) : new Error('Unknown error');

    setError(new LazyLoadError(originalError));
    throw new LazyLoadError(originalError);
  }
};