import { useState } from 'react';

interface UseScrollToElementProps {
  enabled: boolean;
  elementId: string | undefined;
}

/**
 * Executes window.scrollTo as soon as React adds an element to the DOM with the ID specified.
 * Usage: useScrollToElement({ elementId, enabled }) will return a function that should be executed every time an element
 * is added to the DOM for example in a map of components retrieved from the database.
 * if elementId matches the elementIdToScrollTo specified in the hook a window.scrollTo will be triggered.
 * @returns A function to be used as the ref={el => addElement(elId, el) } of the elements that we may want to scroll to.
 */
const useScrollToElement = ({ enabled, elementId: elementIdToScrollTo }: UseScrollToElementProps) => {
  if (!elementIdToScrollTo) {
    enabled = false;
  }

  const [alreadyScrolled, setAlreadyScrolled] = useState(!enabled);

  const addElement = (elementId: string, element: HTMLElement | null) => {
    if (alreadyScrolled) return;
    if (element && elementIdToScrollTo === elementId && typeof element.offsetTop === 'number') {
      window.scrollTo({ top: element.offsetTop, behavior: 'smooth' });
      setAlreadyScrolled(true);
    }
  };

  return {
    addElement,
  };
};

export default useScrollToElement;
