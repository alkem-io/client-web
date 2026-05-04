import { describe, expect, it } from 'vitest';
import { ensureHttps, isValidHttpUrl } from './ensureHttps';

describe('ensureHttps', () => {
  it('keeps an already-prefixed https URL untouched', () => {
    expect(ensureHttps('https://example.org')).toBe('https://example.org');
  });

  it('keeps an already-prefixed http URL untouched', () => {
    expect(ensureHttps('http://example.org')).toBe('http://example.org');
  });

  it('prefixes https:// when missing', () => {
    expect(ensureHttps('example.org')).toBe('https://example.org');
  });

  it('trims surrounding whitespace before checking', () => {
    expect(ensureHttps('  example.org  ')).toBe('https://example.org');
  });

  it('returns an empty string for blank input', () => {
    expect(ensureHttps('')).toBe('');
    expect(ensureHttps('   ')).toBe('');
  });

  it('matches the prefix case-insensitively', () => {
    expect(ensureHttps('HTTPS://example.org')).toBe('HTTPS://example.org');
    expect(ensureHttps('Http://example.org')).toBe('Http://example.org');
  });
});

describe('isValidHttpUrl', () => {
  it('treats blank input as valid (no value)', () => {
    expect(isValidHttpUrl('')).toBe(true);
    expect(isValidHttpUrl('   ')).toBe(true);
  });

  it('accepts a bare host that gets prefixed with https://', () => {
    expect(isValidHttpUrl('example.org')).toBe(true);
  });

  it('accepts a fully-qualified URL', () => {
    expect(isValidHttpUrl('https://example.org/path?q=1')).toBe(true);
  });

  it('rejects strings that do not parse as URLs', () => {
    // `new URL('https:// not a url')` throws.
    expect(isValidHttpUrl('not a url with spaces')).toBe(false);
  });
});
