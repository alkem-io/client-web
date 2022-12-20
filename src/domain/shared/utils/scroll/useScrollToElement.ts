import { Ref, useEffect, useRef } from 'react';
import { defer } from 'lodash';

/**
 * Triggers scroll to an element with matching alias.
 * @returns {{ scrollable: Function }}
 * The function scrollable() produces a ref that has to be attached to an element,
 * in order for the element to become scrollable-to.
 * Example usage:
 * ```
 * const { scrollable } = useScrollToElement('one');
 * <div ref={scrollable('one')} />
 */

const SCROLL_OPTIONS = { behavior: 'smooth' } as const;

type ScrollMethod = 'window' | 'element';

interface Opts {
  enabled?: boolean;
  method?: ScrollMethod;
  defer?: boolean;
}

const chooseScrollImplementation = (method: ScrollMethod) =>
  method === 'window'
    ? (element: HTMLElement) => {
        window.scrollTo({ ...SCROLL_OPTIONS, top: element.offsetTop });
      }
    : (element: HTMLElement) => {
        element.scrollIntoView(SCROLL_OPTIONS);
      };

const deferred =
  <Args extends unknown[], Ret>(fn: (...args: Args) => Ret) =>
  (...args: Args) =>
    defer(() => fn(...args));

const useScrollToElement = (
  elementAliasToScrollTo: string | undefined,
  { enabled = true, method = 'window', defer: shouldDefer = false }: Opts = {}
) => {
  const elements = useRef<Record<string, HTMLElement | null>>({}).current;

  const scrollImplementation = chooseScrollImplementation(method);

  const scrollToElement = shouldDefer ? deferred(scrollImplementation) : scrollImplementation;

  useEffect(() => {
    if (!enabled || !elementAliasToScrollTo) {
      return;
    }

    const element = elements[elementAliasToScrollTo];

    if (element) {
      scrollToElement(element);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, elementAliasToScrollTo]);

  const scrollable =
    <El extends HTMLElement>(alias: string): Ref<El> =>
    (element: El | null) => {
      if (!elements[alias] && element && alias === elementAliasToScrollTo) {
        // The element has just been added to the DOM and is marked as currently-scrolled-to
        scrollToElement(element);
      }
      elements[alias] = element;
    };

  return {
    scrollable,
  };
};

export default useScrollToElement;
