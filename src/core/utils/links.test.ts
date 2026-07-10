import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { hasDomainLike, resolveInternalReturnPath } from './links';

describe('hasDomainLike', () => {
  test('matches top-level domains', () => {
    expect(hasDomainLike('alkem.io')).toBeTruthy();
  });

  test('matches 2nd-level domains', () => {
    expect(hasDomainLike('www.alkem.io')).toBeTruthy();
  });

  test('does not match domain-like segments in the middle of the string', () => {
    expect(hasDomainLike('contribute/www.alkem.io')).toBeFalsy();
  });
});

describe('resolveInternalReturnPath', () => {
  const APEX = 'https://sandbox-alkem.io';

  beforeEach(() => {
    // The auth screens are served here in every deployed environment.
    vi.stubGlobal('location', { origin: 'https://identity.sandbox-alkem.io' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('strips an apex-absolute url to its path', () => {
    expect(resolveInternalReturnPath(`${APEX}/challenges/my-subspace`, APEX)).toBe('/challenges/my-subspace');
  });

  test('preserves search and hash', () => {
    expect(resolveInternalReturnPath(`${APEX}/space?tab=2#members`, APEX)).toBe('/space?tab=2#members');
  });

  test('accepts the current (identity subdomain) origin', () => {
    expect(resolveInternalReturnPath('https://identity.sandbox-alkem.io/home', APEX)).toBe('/home');
  });

  test('resolves a relative path against the apex', () => {
    expect(resolveInternalReturnPath('/spaces', APEX)).toBe('/spaces');
  });

  test('rejects a foreign origin', () => {
    expect(resolveInternalReturnPath('https://evil.example.com/steal', APEX)).toBeNull();
  });

  test('rejects a protocol-relative url to a foreign host', () => {
    expect(resolveInternalReturnPath('//evil.example.com/steal', APEX)).toBeNull();
  });

  test('rejects a lookalike host', () => {
    expect(resolveInternalReturnPath('https://sandbox-alkem.io.evil.com/steal', APEX)).toBeNull();
  });

  test('returns null for empty and blank input', () => {
    expect(resolveInternalReturnPath(undefined, APEX)).toBeNull();
    expect(resolveInternalReturnPath('   ', APEX)).toBeNull();
  });

  test('falls back to the current origin when the apex is unknown', () => {
    expect(resolveInternalReturnPath('https://identity.sandbox-alkem.io/home', undefined)).toBe('/home');
    expect(resolveInternalReturnPath(`${APEX}/home`, undefined)).toBeNull();
  });
});
