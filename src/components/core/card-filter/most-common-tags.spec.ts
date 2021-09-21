import mostCommonTags from './most-common-tags';
import { Tagset } from '../../../models/graphql-schema';

type SimpleType = Partial<Tagset>;

type TestData = {
  name: string;
  data: SimpleType; //for easier testing
  result: string[];
};

const getter = (val: SimpleType) => val?.tags || [];

const data = (): TestData[] =>
  (
    [
      // edge cases
      { name: '1', data: [], result: [] },
      { name: '2', data: [{ tags: [] }], result: [] },
      // normal match
      { name: '3', data: [{ tags: ['a'] }], result: ['a'] },
      { name: '4', data: [{ tags: ['a', 'b'] }], result: ['a', 'b'] },
      // from multiple sources
      { name: '5', data: [{ tags: ['a'] }, { tags: ['a'] }], result: ['a'] },
      { name: '6', data: [{ tags: ['a'] }, { tags: ['b'] }], result: ['a', 'b'] },
      { name: '7', data: [{ tags: ['a'] }, { tags: ['a', 'b'] }], result: ['a', 'b'] },
      // with sorting
      { name: '8', data: [{ tags: ['a', 'b'] }, { tags: ['b'] }], result: ['b', 'a'] },
      {
        name: '9',
        data: [{ tags: ['a', 'b'] }, { tags: ['b', 'c'] }],
        result: ['b', 'a', 'c'],
      },
    ] as TestData[]
  ).map(x => Object.assign(x, { toString: () => x.name })); // using toString operator into test.each

describe('mostCommonTags', () => {
  test.concurrent.each(data())('%s', async ({ data, result }) => {
    const tags = mostCommonTags(data as any[], getter);
    expect(tags).toEqual(result);
  });
});
