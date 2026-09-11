import { describe, expect, test } from 'vitest';
import { NAMEID_MAX_LENGTH as LEGACY_NAMEID_MAX_LENGTH } from '@/core/ui/forms/validator/nameIdValidator';
import { isValidEmail, isValidEmailOrEmpty, isValidNameId, isValidUrlOrEmpty, NAMEID_MAX_LENGTH } from './validators';

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

describe('isValidNameId', () => {
  test('accepts lowercase letters, digits and hyphens', () => {
    expect(isValidNameId('acme')).toBe(true);
    expect(isValidNameId('canocorp')).toBe(true);
    expect(isValidNameId('acme-corp-2')).toBe(true);
  });

  test('rejects uppercase — the server scalar refuses it for variables', () => {
    expect(isValidNameId('CanoCorp')).toBe(false);
  });

  test('rejects values outside the 3-25 user-entry window', () => {
    expect(isValidNameId('ab')).toBe(false);
    expect(isValidNameId('a'.repeat(26))).toBe(false);
    expect(isValidNameId('a'.repeat(25))).toBe(true);
  });

  test('agrees with the pre-CRD nameIdValidator on the maximum', () => {
    // 26-28 is reserved headroom for the server's own collision suffix, not
    // for user entry — two client validators disagreeing on this is how the
    // same alias gets accepted in one form and rejected in another.
    expect(NAMEID_MAX_LENGTH).toBe(LEGACY_NAMEID_MAX_LENGTH);
  });

  test('rejects spaces and other disallowed characters', () => {
    expect(isValidNameId('cano corp')).toBe(false);
    expect(isValidNameId('cano_corp')).toBe(false);
    expect(isValidNameId('cano.corp')).toBe(false);
    expect(isValidNameId('')).toBe(false);
  });

  test('validates the trimmed value so a padded-but-valid alias is not wrongly rejected', () => {
    expect(isValidNameId('  acme  ')).toBe(true);
  });
});
