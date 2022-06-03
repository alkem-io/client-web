import getValuesSorted from './getValuesSorted';

describe('getValuesSorted', () => {
  it('returns values of an object, sorted by key names', () => {
    expect(
      getValuesSorted({
        x: 0,
        '11': 'eleven',
        '1': 'one',
        Alkemio: 'Putting challenges central',
        Alkemio1: 'Allowing everyone to contribute.',
      })
    ).toEqual(['one', 'eleven', 'Putting challenges central', 'Allowing everyone to contribute.', 0]);
  });
});
