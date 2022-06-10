import { getRegExpForQueryName } from './clearCacheForQuery';

describe('getRegExpForQueryName', () => {
  const sampleQueryName = 'sampleQueryName';

  it('matches the query name', () => {
    expect(getRegExpForQueryName(sampleQueryName).test(sampleQueryName)).toBeTruthy();
  });

  it('matches the query followed by variables in parentheses', () => {
    expect(getRegExpForQueryName(sampleQueryName).test('sampleQueryName({"arg": "value"})')).toBeTruthy();
  });

  it('matches the query followed by a semicolon', () => {
    expect(getRegExpForQueryName(sampleQueryName).test('sampleQueryName:{"arg": "value"}')).toBeTruthy();
  });

  it('does not match another query name that starts with the same string', () => {
    expect(getRegExpForQueryName(sampleQueryName).test(`${sampleQueryName}Two`)).toBeFalsy();
  });

  it('Potential RegExp statefulness does not affect the match', () => {
    const regExp = getRegExpForQueryName(sampleQueryName);
    expect(
      [
        sampleQueryName,
        'sampleQueryName({"arg": "value"})',
        'sampleQueryName:{"arg": "value"}',
        sampleQueryName,
        'sampleQueryName({"arg": "value"})',
        'sampleQueryName:{"arg": "value"}',
      ].map(queryName => regExp.test(queryName))
    ).toEqual(Array(6).fill(true));
  });
});
