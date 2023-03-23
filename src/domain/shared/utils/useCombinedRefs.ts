import { MutableRefObject, useRef } from 'react';

interface FunctionalRef<T> {
  (refValue: T): void;
}

type Ref<T> = MutableRefObject<T> | FunctionalRef<T> | undefined | null;

export const useCombinedRefs = <T>(initialValue: T, ...refs: Ref<T>[]): MutableRefObject<T> => {
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

  return {
    set current(current: T) {
      updateAllRefs(current);
    },
    get current() {
      return currentHolder.current;
    },
  };
};
