import { type Ref, type RefObject, useRef } from 'react';

export const useCombinedRefs = <T>(initialValue: T, ...refs: Array<Ref<T> | undefined | null>): RefObject<T> => {
  const currentHolder = useRef<T>(initialValue);

  const updateAllRefs = (current: T) => {
    [currentHolder, ...refs].forEach(ref => {
      if (!ref) return;
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
  } as RefObject<T>;
};
