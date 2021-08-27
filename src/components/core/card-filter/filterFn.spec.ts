import filterFn from './filterFn';
import { RequiredFields } from './CardFilter';

type SimpleType = Partial<RequiredFields>[];

type TestData = {
  name: string;
  data: SimpleType; //for easier testing
  terms: string[];
  result: string[]; //for easier testing - array of ids of the filtered objects
};

const data = (): TestData[] =>
  (
    [
      // edge cases
      { name: '1', data: [] as SimpleType, terms: [], result: [] },
      { name: '2', data: [] as SimpleType, terms: ['1'], result: [] },
      { name: '3', data: [{ id: '1' }] as SimpleType, terms: [], result: ['1'] },
      // normal full match
      {
        name: '4',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: 'test' },
        ] as SimpleType,
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '5',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: 'test' },
        ] as SimpleType,
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '6',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: 'test123' },
        ] as SimpleType,
        terms: ['test'],
        result: ['1'],
      },
      // normal mismatch
      {
        name: '7',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: 'tes' },
        ] as SimpleType,
        terms: ['test'],
        result: ['1'],
      },
      {
        name: '8',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { background: 'tes' } },
        ] as SimpleType,
        terms: ['test'],
        result: ['1'],
      },
      {
        name: '9',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { impact: 'tes' } },
        ] as SimpleType,
        terms: ['test'],
        result: ['1'],
      },
      {
        name: '10',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { tagline: 'tes' } },
        ] as SimpleType,
        terms: ['test'],
        result: ['1'],
      },
      {
        name: '11',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { vision: 'tes' } },
        ] as SimpleType,
        terms: ['test'],
        result: ['1'],
      },
      {
        name: '12',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { who: 'tes' } },
        ] as SimpleType,
        terms: ['test'],
        result: ['1'],
      },
      // match on different fields
      {
        name: '13',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { background: 'test' } },
        ] as SimpleType,
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '14',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { impact: 'test' } },
        ] as SimpleType,
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '15',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { tagline: 'test' } },
        ] as SimpleType,
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '16',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { vision: 'test' } },
        ] as SimpleType,
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '17',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { who: 'test' } },
        ] as SimpleType,
        terms: ['test'],
        result: ['1', '2'],
      },
      // no duplicate results
      {
        name: '18',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: 'test', context: { who: 'test' } },
        ] as SimpleType,
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '19',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: 'test', context: { who: 'test1' } },
        ] as SimpleType,
        terms: ['test', 'test1'],
        result: ['1', '2'],
      },
      // case insensitive
      {
        name: '20',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: 'tEsT' },
        ] as SimpleType,
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '21',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { background: 'tEsT' } },
        ] as SimpleType,
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '22',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { impact: 'tEsT' } },
        ] as SimpleType,
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '23',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { tagline: 'tEsT' } },
        ] as SimpleType,
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '24',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { vision: 'tEsT' } },
        ] as SimpleType,
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '25',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { who: 'tEsT' } },
        ] as SimpleType,
        terms: ['test'],
        result: ['1', '2'],
      },
      // match words only
      {
        name: '26',
        data: [{ id: '1', displayName: 'this is a display name' }] as SimpleType,
        terms: ['display'],
        result: ['1'],
      },
      {
        name: '27',
        data: [{ id: '1', displayName: 'this is a display name' }] as SimpleType,
        terms: ['play'],
        result: [],
      },
      {
        name: '28',
        data: [{ id: '1', displayName: '', context: { background: 'this is a background name' } }] as SimpleType,
        terms: ['background'],
        result: ['1'],
      },
      {
        name: '29',
        data: [{ id: '1', displayName: '', context: { background: 'this is a background name' } }] as SimpleType,
        terms: ['round', 'back'],
        result: [],
      },
      {
        name: '30',
        data: [{ id: '1', displayName: '', context: { impact: 'this is a impact name' } }] as SimpleType,
        terms: ['impact'],
        result: ['1'],
      },
      {
        name: '31',
        data: [{ id: '1', displayName: '', context: { impact: 'this is a impact name' } }] as SimpleType,
        terms: ['pact', 'imp'],
        result: [],
      },
      {
        name: '32',
        data: [{ id: '1', displayName: '', context: { tagline: 'this is a tagline name' } }] as SimpleType,
        terms: ['tagline'],
        result: ['1'],
      },
      {
        name: '33',
        data: [{ id: '1', displayName: '', context: { tagline: 'this is a tagline name' } }] as SimpleType,
        terms: ['line', 'tag'],
        result: [],
      },
      {
        name: '34',
        data: [{ id: '1', displayName: '', context: { vision: 'this is a vision name' } }] as SimpleType,
        terms: ['vision'],
        result: ['1'],
      },
      {
        name: '35',
        data: [{ id: '1', displayName: '', context: { vision: 'this is a vision name' } }] as SimpleType,
        terms: ['vi', 'sio', 'on'],
        result: [],
      },
      {
        name: '36',
        data: [{ id: '1', displayName: '', context: { who: 'this is a who name' } }] as SimpleType,
        terms: ['who'],
        result: ['1'],
      },
      {
        name: '37',
        data: [{ id: '1', displayName: '', context: { who: 'this is a who name' } }] as SimpleType,
        terms: ['w', 'ho', 'o'],
        result: [],
      },
    ] as TestData[]
  ).map(x => Object.assign(x, { toString: () => x.name })); // using toString operator into test.each

describe('filterFn', () => {
  test.concurrent.each(data())('%s', async ({ data, terms, result }) => {
    const filtered = filterFn(data as RequiredFields[], terms).map(x => x.id);
    expect(filtered).toEqual(result);
  });
});
