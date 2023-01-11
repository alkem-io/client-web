import { hasDomainLike } from './links';

describe('hasDomainLike', () => {
  it('matches top-level domains', () => {
    expect(hasDomainLike('alkem.io')).toBeTruthy();
  });

  it('matches 2nd-level domains', () => {
    expect(hasDomainLike('www.alkem.io')).toBeTruthy();
  });

  it('does not match domain-like segments in the middle of the string', () => {
    expect(hasDomainLike('contribute/www.alkem.io')).toBeFalsy();
  });
});
