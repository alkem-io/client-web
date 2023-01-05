import { hasDomainLike } from './links';

describe('hasDomainLike', () => {
  test('It matches top-level domains', () => {
    expect(hasDomainLike('alkem.io')).toBeTruthy();
  });

  test('It matches 2nd-level domains', () => {
    expect(hasDomainLike('www.alkem.io')).toBeTruthy();
  });

  test('It does not match domain-like things in the middle of the string', () => {
    expect(hasDomainLike('contribute/www.alkem.io')).toBeFalsy();
  });
});
