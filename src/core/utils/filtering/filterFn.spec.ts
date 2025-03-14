import filterFn, { ValueType } from './filterFn';
import { Identifiable } from '../Identifiable';
import { expect, test, describe } from 'vitest';

type TestDataType = Identifiable & {
  about?: {
    profile?: {
      description?: string;
      displayName?: string;
      tags?: string[];
      tagline?: string;
    };
    when?: string;
    why?: string;
    who?: string;
  };
};

type TestData = {
  name: string;
  data: TestDataType[];
  terms: string[];
  result: string[]; //for easier testing - array of ids of the filtered objects
};

const getter = ({ id, about: c }: TestDataType): ValueType => ({
  id: id,
  values: [
    c?.profile?.displayName || '',
    (c?.profile?.tags || []).join(' '),
    c?.profile?.description || '',
    c?.profile?.tagline || '',
    c?.when || '',
    c?.why || '',
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
          { id: '1', about: { profile: { displayName: 'test' } } },
          { id: '2', about: { profile: { displayName: 'test' } } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '5',
        data: [
          { id: '1', about: { profile: { displayName: 'test' } } },
          { id: '2', about: { profile: { displayName: 'test' } } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '6',
        data: [
          { id: '1', about: { profile: { displayName: 'test' } } },
          { id: '2', about: { profile: { displayName: 'test123' } } },
        ],
        terms: ['test'],
        result: ['1'],
      },
      // normal mismatch
      {
        name: '7',
        data: [
          { id: '1', about: { profile: { displayName: 'test' } } },
          { id: '2', about: { profile: { displayName: 'tes' } } },
        ],
        terms: ['test'],
        result: ['1'],
      },
      {
        name: '8',
        data: [
          { id: '1', about: { profile: { displayName: 'test' } } },
          { id: '2', about: { profile: { displayName: '', description: 'tes' } } },
        ],
        terms: ['test'],
        result: ['1'],
      },
      {
        name: '9',
        data: [
          { id: '1', about: { profile: { displayName: 'test' } } },
          { id: '2', about: { when: 'tes', profile: { displayName: '' } } },
        ],
        terms: ['test'],
        result: ['1'],
      },
      {
        name: '10',
        data: [
          { id: '1', about: { profile: { displayName: 'test' } } },
          { id: '2', about: { profile: { displayName: '', tagline: 'tes' } } },
        ],
        terms: ['test'],
        result: ['1'],
      },
      {
        name: '11',
        data: [
          { id: '1', about: { profile: { displayName: 'test' } } },
          { id: '2', about: { why: 'tes', profile: { displayName: '' } } },
        ],
        terms: ['test'],
        result: ['1'],
      },
      {
        name: '12',
        data: [
          { id: '1', about: { profile: { displayName: 'test' } } },
          { id: '2', about: { who: 'tes', profile: { displayName: '' } } },
        ],
        terms: ['test'],
        result: ['1'],
      },
      // match on different fields
      {
        name: '13',
        data: [
          { id: '1', about: { profile: { displayName: 'test' } } },
          { id: '2', about: { profile: { description: 'test', displayName: '' } } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '14',
        data: [
          { id: '1', about: { profile: { displayName: 'test' } } },
          { id: '2', about: { when: 'test', profile: { displayName: '' } } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '15',
        data: [
          { id: '1', about: { profile: { displayName: 'test' } } },
          { id: '2', about: { profile: { displayName: '', tagline: 'test' } } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '16',
        data: [
          { id: '1', about: { profile: { displayName: 'test' } } },
          { id: '2', about: { why: 'test', profile: { displayName: '' } } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '17',
        data: [
          { id: '1', about: { profile: { displayName: 'test' } } },
          { id: '2', about: { who: 'test', profile: { displayName: '' } } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      // no duplicate results
      {
        name: '18',
        data: [
          { id: '1', about: { profile: { displayName: 'test' } } },
          { id: '2', about: { who: 'test', profile: { displayName: 'test' } } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '19',
        data: [
          { id: '1', about: { profile: { displayName: 'test' } } },
          { id: '2', about: { who: 'test1', profile: { displayName: 'test' } } },
        ],
        terms: ['test', 'test1'],
        result: ['1', '2'],
      },
      // case insensitive
      {
        name: '20',
        data: [
          { id: '1', about: { profile: { displayName: 'test' } } },
          { id: '2', about: { profile: { displayName: 'tEsT' } } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '21',
        data: [
          { id: '1', about: { profile: { displayName: 'test' } } },
          { id: '2', about: { profile: { displayName: '', description: 'tEsT' } } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '22',
        data: [
          { id: '1', about: { profile: { displayName: 'test' } } },
          { id: '2', about: { when: 'tEsT', profile: { displayName: '' } } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '23',
        data: [
          { id: '1', about: { profile: { displayName: 'test' } } },
          { id: '2', about: { profile: { displayName: '', tagline: 'tEsT' } } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '24',
        data: [
          { id: '1', about: { profile: { displayName: 'test' } } },
          { id: '2', about: { why: 'tEsT', profile: { displayName: '' } } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      {
        name: '25',
        data: [
          { id: '1', about: { profile: { displayName: 'test' } } },
          { id: '2', about: { who: 'tEsT', profile: { displayName: '' } } },
        ],
        terms: ['test'],
        result: ['1', '2'],
      },
      // match words only
      {
        name: '26',
        data: [{ id: '1', about: { profile: { displayName: 'this is a display name' } } }],
        terms: ['display'],
        result: ['1'],
      },
      {
        name: '27',
        data: [{ id: '1', about: { profile: { displayName: 'this is a display name' } } }],
        terms: ['play'],
        result: [],
      },
      {
        name: '28',
        data: [{ id: '1', about: { profile: { displayName: '', description: 'this is a background name' } } }],
        terms: ['background'],
        result: ['1'],
      },
      {
        name: '29',
        data: [{ id: '1', about: { profile: { displayName: '', description: 'this is a background name' } } }],
        terms: ['round', 'back'],
        result: [],
      },
      {
        name: '30',
        data: [{ id: '1', about: { when: 'this is a impact name', profile: { displayName: '' } } }],
        terms: ['impact'],
        result: ['1'],
      },
      {
        name: '31',
        data: [{ id: '1', about: { when: 'this is a impact name', profile: { displayName: '' } } }],
        terms: ['pact', 'imp'],
        result: [],
      },
      {
        name: '32',
        data: [{ id: '1', about: { profile: { displayName: '', tagline: 'this is a tagline name' } } }],
        terms: ['tagline'],
        result: ['1'],
      },
      {
        name: '33',
        data: [{ id: '1', about: { profile: { displayName: '', tagline: 'this is a impact name' } } }],
        terms: ['line', 'tag'],
        result: [],
      },
      {
        name: '34',
        data: [{ id: '1', about: { why: 'this is a why name', profile: { displayName: '' } } }],
        terms: ['why'],
        result: ['1'],
      },
      {
        name: '35',
        data: [{ id: '1', about: { why: 'this is a why name', profile: { displayName: '' } } }],
        terms: ['vi', 'sio', 'on'],
        result: [],
      },
      {
        name: '36',
        data: [{ id: '1', about: { who: 'this is a who name', profile: { displayName: '' } } }],
        terms: ['who'],
        result: ['1'],
      },
      {
        name: '37',
        data: [{ id: '1', about: { who: 'this is a who name', profile: { displayName: '' } } }],
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
