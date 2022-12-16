import { useCallback, useRef } from 'react';

/**
 * Executes window.scrollTo as soon as React adds an element to the DOM with the ID specified.
 * Usage: useScrollToElement(enabled, elementId) will return a function that should be executed every time an element
 * is added to the DOM for example in a map of components retrieved from the database.
 * if elementId matches the elementIdToScrollTo specified in the hook a window.scrollTo will be triggered.
 * @returns a function to be used as the ref={el => onElementAdded(el, alias) } on the elements that we may want to scroll to.
 */
const useScrollToElement = function (elementAliasToScrollTo: string | undefined, enabled: boolean = true) {
  const prevElementAliasRef = useRef<string>();

  const onElementAdded = useCallback(
    (element: HTMLElement | null, alias: string) => {
      if (!enabled || !elementAliasToScrollTo || prevElementAliasRef.current === alias) {
        return;
      }
      if (element && elementAliasToScrollTo === alias) {
        window.scrollTo({ top: element.offsetTop, behavior: 'smooth' });
        prevElementAliasRef.current = alias;
      }
    },
    [enabled, elementAliasToScrollTo]
  );

  return onElementAdded;
};

export default useScrollToElement;
