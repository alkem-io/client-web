import { describe, expect, test } from 'vitest';
import { resolveChatLocale } from './chatLocale';

describe('resolveChatLocale', () => {
  test('uses the browser locale when it is a regional variant of the app language', () => {
    expect(resolveChatLocale('en', ['en-GB', 'en-US'])).toBe('en-GB');
  });

  test('with a browser in another language, keeps the app language but takes the 12/24-hour clock from the browser', () => {
    expect(resolveChatLocale('en', ['nl-NL'])).toBe('en-u-hc-h23');
    expect(resolveChatLocale('nl', ['en-US'])).toBe('nl-u-hc-h12');
  });

  test('the resulting locale formats words in the app language and the clock as the browser does', () => {
    const at = new Date(2026, 9, 14, 14, 32);
    expect(new Intl.DateTimeFormat(resolveChatLocale('en', ['nl-NL']), { timeStyle: 'short' }).format(at)).toBe(
      '14:32'
    );
  });

  test('without browser languages the app language is used as is', () => {
    expect(resolveChatLocale('en', [])).toBe('en');
  });

  test('ignores the region of the app language when matching', () => {
    expect(resolveChatLocale('de-AT', ['de-CH'])).toBe('de-CH');
  });

  test('without an app language there is no locale (the browser default applies)', () => {
    expect(resolveChatLocale(undefined, ['en-GB'])).toBeUndefined();
  });
});
