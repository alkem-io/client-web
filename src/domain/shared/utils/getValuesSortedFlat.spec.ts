import getEntriesSortedFlat from './getEntriesSortedFlat';

describe('getValuesSorted', () => {
  it('returns values of an object, sorted by key names', () => {
    expect(
      getEntriesSortedFlat({
        x: 0,
        '11': 'eleven',
        '1': 'one',
        Alkemio: 'Putting challenges central',
        Alkemio1: 'Allowing everyone to contribute.',
      })
    ).toEqual([
      '1',
      'one',
      '11',
      'eleven',
      'Alkemio',
      'Putting challenges central',
      'Alkemio1',
      'Allowing everyone to contribute.',
      'x',
      0,
    ]);
  });
});
