import { useState } from 'react';

const usePersistedState = <T,>(
  localStorageKey: string,
  initialValue: T
): [T, (value: T | ((currentValue: T) => T)) => void] => {
  const localStorage = window.localStorage;
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(localStorageKey);
      if (saved === null) {
        localStorage.setItem(localStorageKey, JSON.stringify(initialValue));
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
          localStorage.setItem(localStorageKey, JSON.stringify(newValue));
          return newValue;
        });
      } else {
        setState(value);
        localStorage.setItem(localStorageKey, JSON.stringify(value));
      }
    } catch {
      // Ignore write errors
    }
  };

  return [state, handleChangeState];
};

export default usePersistedState;
