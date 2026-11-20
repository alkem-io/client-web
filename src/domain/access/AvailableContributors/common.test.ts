import { describe, expect, it } from 'vitest';
import { AVAILABLE_USERS_PAGE_SIZE, resolvePageSize } from './common';

/**
 * client-web#10318: the available-users `fetchMore` was wired straight to a button's
 * `onClick`, so React handed its `MouseEvent` to Apollo as the `first` variable and the
 * request died in `JSON.stringify` with "Converting circular structure to JSON". The
 * published `fetchMore` type takes no arguments, so TypeScript could not catch it — this
 * runtime guard is what does.
 */
describe('resolvePageSize (client-web#10318)', () => {
  it('falls back to the page size when a click event is passed instead of a number', () => {
    const clickEvent = new MouseEvent('click');

    expect(resolvePageSize(clickEvent, AVAILABLE_USERS_PAGE_SIZE)).toBe(AVAILABLE_USERS_PAGE_SIZE);
  });

  it('falls back to the page size when nothing is passed', () => {
    expect(resolvePageSize(undefined, AVAILABLE_USERS_PAGE_SIZE)).toBe(AVAILABLE_USERS_PAGE_SIZE);
  });

  it('honours an explicit positive page size', () => {
    expect(resolvePageSize(25, AVAILABLE_USERS_PAGE_SIZE)).toBe(25);
  });

  it.each([
    0,
    -5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    '10',
    null,
    {},
  ])('rejects %p, which would produce an unusable query variable', input => {
    expect(resolvePageSize(input, AVAILABLE_USERS_PAGE_SIZE)).toBe(AVAILABLE_USERS_PAGE_SIZE);
  });
});
