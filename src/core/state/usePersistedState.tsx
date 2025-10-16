import { useState } from 'react';

/**
 * Behaves like React's useState, but persists the state in the browser's localStorage if available.
 * On initialization, it checks if there's a saved value in localStorage for the given key.
 * If found, it uses that value; otherwise, it falls back to the provided initial value.
 * Whenever the state is updated, the new value is also saved to localStorage.
 * @param localStorageKey
 * @param initialValue if not set in localStorage, this value will be used as initial state
 * @returns
 */
const usePersistedState = <T,>(
  localStorageKey: string,
  initialValue: T
): [T, (value: T | ((currentValue: T) => T)) => void] => {
  const getLocalStorage = () => (typeof window !== 'undefined' ? window.localStorage : undefined);

  const [state, setState] = useState<T>(() => {
    try {
      const saved = getLocalStorage()?.getItem(localStorageKey) ?? null;
      if (saved === null) {
        getLocalStorage()?.setItem(localStorageKey, JSON.stringify(initialValue));
        return initialValue;
      }
      return JSON.parse(saved) as T;
    } catch {
      return initialValue;
    }
  });

  const handleChangeState = (value: T | ((currentValue: T) => T)) => {
    try {
      if (typeof value === 'function') {
        // Use React's functional update to get the current state
        setState(currentState => {
          const newValue = (value as (currentValue: T) => T)(currentState);
          getLocalStorage()?.setItem(localStorageKey, JSON.stringify(newValue));
          return newValue;
        });
      } else {
        setState(value);
        getLocalStorage()?.setItem(localStorageKey, JSON.stringify(value));
      }
    } catch {
      // Ignore write errors
    }
  };

  return [state, handleChangeState];
};

export default usePersistedState;
