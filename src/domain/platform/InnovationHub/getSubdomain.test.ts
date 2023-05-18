import getSubdomain from './getSubdomain';

describe('getSubdomain', () => {
  it('returns undefined for 2-level domains', () => {
    expect(getSubdomain('alkem.io')).toBeFalsy();
  });

  it('returns the 1st part for 3-level domains', () => {
    expect(getSubdomain('uwv.alkem.io')).toEqual('uwv');
  });

  it('works for 5-level domains', () => {
    expect(getSubdomain('hub.subdomain.subdomain.domain.zone')).toEqual('hub');
  });
});
