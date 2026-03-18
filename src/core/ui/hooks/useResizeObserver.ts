import { useEffect, useRef, useState } from 'react';

interface UseResizeObserverOptions<T extends HTMLElement> {
  targetRef?: React.RefObject<T | null>;
  onResize?: () => void;
}

interface ResizeObserverResult<T extends HTMLElement> {
  ref: React.RefObject<T | null>;
  width: number | undefined;
  height: number | undefined;
}

export function useResizeObserver<T extends HTMLElement = HTMLElement>(
  options?: UseResizeObserverOptions<T>
): ResizeObserverResult<T> {
  const internalRef = useRef<T>(null);
  const ref = options?.targetRef ?? internalRef;
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      setWidth(w);
      setHeight(h);
      options?.onResize?.();
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref.current]);

  return { ref, width, height };
}
