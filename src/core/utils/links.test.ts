import { hasDomainLike } from './links';
import { expect, test, describe } from 'vitest';

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
