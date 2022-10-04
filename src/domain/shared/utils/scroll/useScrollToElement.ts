import { useCallback, useState } from 'react';

/**
 * Executes window.scrollTo as soon as React adds an element to the DOM with the ID specified.
 * Usage: useScrollToElement(enabled, elementId) will return a function that should be executed every time an element
 * is added to the DOM for example in a map of components retrieved from the database.
 * if elementId matches the elementIdToScrollTo specified in the hook a window.scrollTo will be triggered.
 * @returns A function to be used as the ref={el => addElement(elId, el) } of the elements that we may want to scroll to.
 */
const useScrollToElement = function (enabled: boolean, elementIdToScrollTo: string | undefined) {
  const [alreadyScrolled, setAlreadyScrolled] = useState(false);

  const addElement = useCallback(
    (elementId: string, element: HTMLElement | null) => {
      if (!enabled || !elementIdToScrollTo || alreadyScrolled) {
        return;
      }
      if (element && elementIdToScrollTo === elementId) {
        window.scrollTo({ top: element.offsetTop, behavior: 'smooth' });
        setAlreadyScrolled(true);
      }
    },
    [enabled, elementIdToScrollTo, alreadyScrolled]
  );

  return addElement;
};

export default useScrollToElement;
