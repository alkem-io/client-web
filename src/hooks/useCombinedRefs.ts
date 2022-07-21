import { MutableRefObject, useEffect, useRef } from 'react';

interface FunctionalRef<T> {
  (refValue: T): void;
}

type Ref<T> = MutableRefObject<T> | FunctionalRef<T> | undefined | null;

export function useCombinedRefs<T>(initialValue: T, ...refs: Ref<T>[]) {
  const targetRef = useRef<T>(initialValue);

  useEffect(() => {
    refs.forEach(ref => {
      if (!ref) {
        return;
      }
      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        ref.current = targetRef.current;
      }
    });
  }, [targetRef.current]);

  return targetRef;
}
