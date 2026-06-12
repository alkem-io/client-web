import { describe, expect, test } from 'vitest';
import { isValidEmail, isValidEmailOrEmpty, isValidUrlOrEmpty } from './validators';

describe('isValidEmail', () => {
  test('accepts a well-formed address', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  test('accepts an address with surrounding whitespace (matches the trimmed value forms submit)', () => {
    expect(isValidEmail('  user@example.com  ')).toBe(true);
  });

  test('rejects malformed input and whitespace-only', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('   ')).toBe(false);
  });
});

describe('isValidEmailOrEmpty', () => {
  test('treats empty / whitespace-only as valid (optional field)', () => {
    expect(isValidEmailOrEmpty('')).toBe(true);
    expect(isValidEmailOrEmpty('   ')).toBe(true);
  });

  test('validates the trimmed value so a padded-but-valid email is not wrongly rejected', () => {
    expect(isValidEmailOrEmpty(' contact@org.com ')).toBe(true);
  });

  test('rejects a non-empty malformed value', () => {
    expect(isValidEmailOrEmpty('contact@')).toBe(false);
  });
});

describe('isValidUrlOrEmpty', () => {
  test('treats empty / whitespace-only as valid (optional field)', () => {
    expect(isValidUrlOrEmpty('')).toBe(true);
    expect(isValidUrlOrEmpty('   ')).toBe(true);
  });

  test('validates the trimmed value so a padded-but-valid URL is not wrongly rejected', () => {
    expect(isValidUrlOrEmpty('  https://alkem.io  ')).toBe(true);
  });

  test('rejects an unparseable value', () => {
    expect(isValidUrlOrEmpty('not a url')).toBe(false);
  });
});
