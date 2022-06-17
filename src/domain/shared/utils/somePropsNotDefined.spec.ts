import somePropsNotDefined from './somePropsNotDefined';

describe('somePropsNotDefined', () => {
  it('returns false for an empty object', () => {
    expect(somePropsNotDefined({})).toBeFalsy();
  });
});
