// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { InMemoryCache } from '@apollo/client';
import { invariant } from '@apollo/client/utilities/globals';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom does not implement ResizeObserver, but several components (notably Radix
// UI primitives like Tooltip/Popover via @radix-ui/react-use-size) instantiate
// one in a layout effect. Without this stub the constructor throws
// "ResizeObserver is not defined" mid-render, which surfaces as a flaky
// unhandled error that can swallow the interaction under test (e.g. a form
// submit triggered by a button wrapped in a Tooltip).
if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom does not implement window.matchMedia, but components that read responsive
// breakpoints (e.g. core/ui/grid useScreenSize → crd/hooks/useMediaQuery, and CRD
// components) call it in a state initializer. Without this stub the call throws
// mid-render. Defaults to non-matching, which is the safe mobile-first base used
// elsewhere in the codebase.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

// Apollo Client 3.14 removes support for the canonizeResults flag on cache.diff.
// MockedProvider still passes the flag in tests, so strip it to silence warnings.
const originalDiff = InMemoryCache.prototype.diff;

function patchedDiff(this: InMemoryCache, options: Parameters<typeof originalDiff>[0]) {
  let sanitizedOptions = options;

  if (sanitizedOptions && 'canonizeResults' in sanitizedOptions) {
    sanitizedOptions = { ...sanitizedOptions };
    Reflect.deleteProperty(sanitizedOptions as unknown as Record<string, unknown>, 'canonizeResults');
  }

  return originalDiff.call(this, sanitizedOptions);
}

InMemoryCache.prototype.diff = patchedDiff as typeof originalDiff;

// Apollo 3.14 emits warning code 13 for cache.lookup when MockedProvider returns
// synthetic ROOT_QUERY data. Filter it in tests to keep output focused on failures.
const originalInvariantWarn = invariant.warn;

invariant.warn = function patchedInvariantWarn(message, ...args) {
  if (typeof message === 'number' && message === 13 && args[0] === 'lookup') {
    return;
  }
  originalInvariantWarn.call(this, message, ...args);
};

afterEach(() => {
  cleanup();
});
