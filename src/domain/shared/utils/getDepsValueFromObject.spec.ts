import getDepsValueFromObject from './getDepsValueFromObject';

describe('getValuesSorted', () => {
  it('returns values of an object, sorted by key names', () => {
    expect(
      getDepsValueFromObject({
        x: 0,
        '11': 'eleven',
        '1': 'one',
        Alkemio: 'Putting challenges central',
        Alkemio1: 'Allowing everyone to contribute.',
      })
    ).toEqual(
      JSON.stringify([
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
      ])
    );
  });
});
