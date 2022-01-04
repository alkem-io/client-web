import { useEffect, useRef } from 'react';

export function useCombinedRefs<T>(...refs) {
  const targetRef = useRef<T>();

  useEffect(() => {
    refs.forEach(ref => {
      if (!ref) return;

      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        ref.current = targetRef.current;
      }
    });
  }, [refs]);

  return targetRef;
}
