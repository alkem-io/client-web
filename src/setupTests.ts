// <<<<<<< HEAD
// // jest-dom adds custom jest matchers for asserting on DOM nodes.
// // allows you to do things like:
// // expect(element).toHaveTextContent(/react/i)
// // learn more: https://github.com/testing-library/jest-dom
// import '@testing-library/jest-dom';
// import { InMemoryCache } from '@apollo/client';
// import { invariant } from '@apollo/client/utilities/globals';
//
// // Apollo Client 3.14 removes support for the canonizeResults flag on cache.diff.
// // MockedProvider still passes the flag in tests, so strip it to silence warnings.
// const originalDiff = InMemoryCache.prototype.diff;
//
// function patchedDiff(this: InMemoryCache, options: Parameters<typeof originalDiff>[0]) {
//   let sanitizedOptions = options;
//
//   if (sanitizedOptions && 'canonizeResults' in sanitizedOptions) {
//     sanitizedOptions = { ...sanitizedOptions };
//     Reflect.deleteProperty(sanitizedOptions as unknown as Record<string, unknown>, 'canonizeResults');
//   }
//
//   return originalDiff.call(this, sanitizedOptions);
// }
//
// InMemoryCache.prototype.diff = patchedDiff as typeof originalDiff;
//
// // Apollo 3.14 emits warning code 13 for cache.lookup when MockedProvider returns
// // synthetic ROOT_QUERY data. Filter it in tests to keep output focused on failures.
// const originalInvariantWarn = invariant.warn;
//
// invariant.warn = function patchedInvariantWarn(message, ...args) {
//   if (typeof message === 'number' && message === 13 && args[0] === 'lookup') {
//     return;
//   }
//   originalInvariantWarn.call(this, message, ...args);
// };
// =======
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
// >>>>>>> origin/feature-whiteboards-public
