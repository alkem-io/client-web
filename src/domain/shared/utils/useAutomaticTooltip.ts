import { RefObject, useEffect, useRef } from 'react';
import { useResizeDetector } from 'react-resize-detector';

export type ReturnTuple = [RefObject<HTMLDivElement>, (HTMLElement, string?) => void];

const useAutomaticTooltip = (): ReturnTuple => {
  const container = useRef<HTMLDivElement>(null);
  const refs = useRef<HTMLElement[]>([]);
  const addRef = function (element: HTMLElement | null, tooltip?: string) {
    if (element !== null && refs.current.indexOf(element) === -1) {
      element.dataset.tooltip = tooltip;
      refs.current.push(element);
    }
  };
  const { height, width } = useResizeDetector({
    targetRef: container,
  });

  useEffect(() => {
    refs.current?.forEach(element => {
      if (element && element.parentElement) {
        // Detect text-overflow: ellipsis applying
        if (element.parentElement.offsetWidth < element.offsetWidth) {
          if (element.dataset.tooltip && element.dataset.tooltip !== 'undefined') {
            element.title = element.dataset.tooltip;
          } else {
            element.title = element.textContent || '';
          }
        } else {
          element.title = '';
        }
      }
    });
  }, [container.current, height, width, refs.current]);

  return [container, addRef];
};

export default useAutomaticTooltip;
