import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export const useSessionState = <Value>(key: string, defaultValue: Value): [Value, Dispatch<SetStateAction<Value>>] => {
  const [state, setState] = useState(() => {
    const value = sessionStorage.getItem(key);
    if (value) {
      try {
        return JSON.parse(value) as Value;
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  });

  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};
