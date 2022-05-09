import filterFn, { ValueType } from './filterFn';
import { Identifiable } from '../../../../domain/shared/types/Identifiable';

type TestDataType = Identifiable & {
  displayName?: string;
  tags?: string[];
  context?: {
    background?: string;
    impact?: string;
    tagline?: string;
    vision?: string;
    who?: string;
  };
};

type TestData = {
  name: string;
  data: TestDataType[];
  terms: string[];
  result: string[]; //for easier testing - array of ids of the filtered objects
};

const getter = ({ id, displayName, tags, context: c }: TestDataType): ValueType => ({
  id: id,
  values: [
    displayName || '',
    (tags || []).join(' '),
    c?.background || '',
    c?.impact || '',
    c?.tagline || '',
    c?.vision || '',
    c?.who || '',
  ],
});

const data = (): TestData[] =>
  (
    [
      // edge cases
      { name: '1', data: [], terms: [], result: [] },
      { name: '2', data: [], terms: ['1'], result: [] },
      { name: '3', data: [{ id: '1' }], terms: [], result: ['1'] },
      // normal full match
      {
        name: '4',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: 'test' },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '5',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: 'test' },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '6',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: 'test123' },
        ],
        terms: ['test'],
        result: ['1'],
      },
      // normal mismatch
      {
        name: '7',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: 'tes' },
        ],
        terms: ['test'],
        result: ['1'],
      },
      {
        name: '8',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { background: 'tes' } },
        ],
        terms: ['test'],
        result: ['1'],
      },
      {
        name: '9',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { impact: 'tes' } },
        ],
        terms: ['test'],
        result: ['1'],
      },
      {
        name: '10',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { tagline: 'tes' } },
        ],
        terms: ['test'],
        result: ['1'],
      },
      {
        name: '11',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { vision: 'tes' } },
        ],
        terms: ['test'],
        result: ['1'],
      },
      {
        name: '12',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { who: 'tes' } },
        ],
        terms: ['test'],
        result: ['1'],
      },
      // match on different fields
      {
        name: '13',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { background: 'test' } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '14',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { impact: 'test' } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '15',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { tagline: 'test' } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '16',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { vision: 'test' } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '17',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { who: 'test' } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      // no duplicate results
      {
        name: '18',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: 'test', context: { who: 'test' } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '19',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: 'test', context: { who: 'test1' } },
        ],
        terms: ['test', 'test1'],
        result: ['1', '2'],
      },
      // case insensitive
      {
        name: '20',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: 'tEsT' },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '21',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { background: 'tEsT' } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '22',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { impact: 'tEsT' } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '23',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { tagline: 'tEsT' } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '24',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { vision: 'tEsT' } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '25',
        data: [
          { id: '1', displayName: 'test' },
          { id: '2', displayName: '', context: { who: 'tEsT' } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      // match words only
      {
        name: '26',
        data: [{ id: '1', displayName: 'this is a display name' }],
        terms: ['display'],
        result: ['1'],
      },
      {
        name: '27',
        data: [{ id: '1', displayName: 'this is a display name' }],
        terms: ['play'],
        result: [],
      },
      {
        name: '28',
        data: [{ id: '1', displayName: '', context: { background: 'this is a background name' } }],
        terms: ['background'],
        result: ['1'],
      },
      {
        name: '29',
        data: [{ id: '1', displayName: '', context: { background: 'this is a background name' } }],
        terms: ['round', 'back'],
        result: [],
      },
      {
        name: '30',
        data: [{ id: '1', displayName: '', context: { impact: 'this is a impact name' } }],
        terms: ['impact'],
        result: ['1'],
      },
      {
        name: '31',
        data: [{ id: '1', displayName: '', context: { impact: 'this is a impact name' } }],
        terms: ['pact', 'imp'],
        result: [],
      },
      {
        name: '32',
        data: [{ id: '1', displayName: '', context: { tagline: 'this is a tagline name' } }],
        terms: ['tagline'],
        result: ['1'],
      },
      {
        name: '33',
        data: [{ id: '1', displayName: '', context: { tagline: 'this is a tagline name' } }],
        terms: ['line', 'tag'],
        result: [],
      },
      {
        name: '34',
        data: [{ id: '1', displayName: '', context: { vision: 'this is a vision name' } }],
        terms: ['vision'],
        result: ['1'],
      },
      {
        name: '35',
        data: [{ id: '1', displayName: '', context: { vision: 'this is a vision name' } }],
        terms: ['vi', 'sio', 'on'],
        result: [],
      },
      {
        name: '36',
        data: [{ id: '1', displayName: '', context: { who: 'this is a who name' } }],
        terms: ['who'],
        result: ['1'],
      },
      {
        name: '37',
        data: [{ id: '1', displayName: '', context: { who: 'this is a who name' } }],
        terms: ['w', 'ho', 'o'],
        result: [],
      },
    ] as TestData[]
  ).map(x => Object.assign(x, { toString: () => x.name })); // using toString operator into test.each

describe('filterFn', () => {
  test.concurrent.each(data())('%s', async ({ data, terms, result }) => {
    const filtered = filterFn(data, terms, getter).map(x => x.id);
    expect(filtered).toEqual(result);
  });
});
