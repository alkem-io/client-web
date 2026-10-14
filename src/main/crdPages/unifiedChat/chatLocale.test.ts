import { describe, expect, test } from 'vitest';
import { resolveChatLocale } from './chatLocale';

describe('resolveChatLocale', () => {
  test('uses the browser locale when it is a regional variant of the app language', () => {
    expect(resolveChatLocale('en', ['en-GB', 'en-US'])).toBe('en-GB');
  });

  test('keeps the app language when the browser speaks another language', () => {
    expect(resolveChatLocale('nl', ['en-US'])).toBe('nl');
  });

  test('ignores the region of the app language when matching', () => {
    expect(resolveChatLocale('de-AT', ['de-CH'])).toBe('de-CH');
  });

  test('without an app language there is no locale (the browser default applies)', () => {
    expect(resolveChatLocale(undefined, ['en-GB'])).toBeUndefined();
  });
});
