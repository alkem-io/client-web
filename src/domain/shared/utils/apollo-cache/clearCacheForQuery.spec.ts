import { getRegExpForQueryName } from './clearCacheForQuery';

describe('getRegExpForQueryName', () => {
  const queryName = 'sampleQueryName';

  it('matches the query name', () => {
    expect(getRegExpForQueryName(queryName).test(queryName)).toBeTruthy();
  });

  it('matches the query followed by variables in parentheses', () => {
    expect(getRegExpForQueryName(queryName).test('sampleQueryName({"arg": "value"})')).toBeTruthy();
  });

  it('matches the query followed by a semicolon', () => {
    expect(getRegExpForQueryName(queryName).test('sampleQueryName:{"arg": "value"}')).toBeTruthy();
  });

  it('does not match another query name that starts with the same string', () => {
    expect(getRegExpForQueryName(queryName).test(`${queryName}Two`)).toBeFalsy();
  });
});
