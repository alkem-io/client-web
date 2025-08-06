import { RefObject, useMemo, useRef } from 'react';

interface FunctionalRef<T> {
  (refValue: T): void;
}

type Ref<T> = RefObject<T> | FunctionalRef<T> | undefined | null;

export const useCombinedRefs = <T>(initialValue: T, ...refs: Ref<T>[]): RefObject<T> => {
  const currentHolder = useRef<T>(initialValue);

  const updateAllRefs = (current: T) => {
    [currentHolder, ...refs].forEach(ref => {
      if (!ref) {
        return;
      }
      if (typeof ref === 'function') {
        ref(current);
      } else {
        ref.current = current;
      }
    });
  };

  return useMemo(
    () => ({
      set current(current: T) {
        updateAllRefs(current);
      },
      get current() {
        return currentHolder.current;
      },
    }),
    refs
  );
};
