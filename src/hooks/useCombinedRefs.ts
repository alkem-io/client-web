import { MutableRefObject, useEffect, useRef } from 'react';
import getDepsValueFromObject from '../domain/shared/utils/getDepsValueFromObject';

interface FunctionalRef<T> {
  (refValue: T): void;
}

type Ref<T> = MutableRefObject<T> | FunctionalRef<T> | undefined | null;

export function useCombinedRefs<T>(initialValue: T, ...refs: Ref<T>[]) {
  const targetRef = useRef<T>(initialValue);

  const depsValueFromObjectRefs = getDepsValueFromObject(refs);

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
    }); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsValueFromObjectRefs]);

  return targetRef;
}
