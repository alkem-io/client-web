import { MutableRefObject } from 'react';

interface FunctionalRef<T> {
  (refValue: T): void;
}

type Ref<T> = MutableRefObject<T> | FunctionalRef<T> | undefined | null;

export function useCombinedRefs<T>(initialValue: T, ...refs: Ref<T>[]) {
  const callbackRef: FunctionalRef<T> & Partial<MutableRefObject<T>> = (current: T) => {
    refs.forEach(ref => {
      if (!ref) {
        return;
      }
      if (typeof ref === 'function') {
        ref(current);
      } else {
        ref.current = current;
      }
    });

    callbackRef.current = current; // Making this callback ref act as a .current ref to save on useRefs
  };

  callbackRef.current = initialValue;

  return callbackRef as FunctionalRef<T> & MutableRefObject<T>;
}
