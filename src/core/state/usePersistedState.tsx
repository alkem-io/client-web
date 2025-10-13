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
      let newValue: T;
      if (typeof value === 'function') {
        newValue = (value as (currentValue: T) => T)(state);
      } else {
        newValue = value;
      }
      setState(newValue);
      localStorage.setItem(localStorageKey, JSON.stringify(newValue));
    } catch {
      // Ignore write errors
    }
  };

  return [state, handleChangeState];
};

export default usePersistedState;
