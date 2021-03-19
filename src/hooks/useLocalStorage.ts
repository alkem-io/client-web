import { useEffect, useState } from 'react';

const parseJSON = (json: string) => {
  try {
    return JSON.parse(json);
  } catch (e) {
    return json;
  }
};

const stringify = (value: any) => {
  if (typeof value === 'string') {
    return value;
  }
  return JSON.stringify(value);
};

export const useLocalStorage = <T>(key: string, initialValue?: T): [T, (value: T | ((val: T) => T)) => void] => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? parseJSON(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });

  // on every render, re-subscribe to the storage event
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      debugger;
      if (e.storageArea === localStorage && e.key === key) {
        setStoredValue(e.newValue as any);
      }
    };
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('storage', handler);
    };
  }, []);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
};
