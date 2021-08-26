import mostCommonTags from './most-common-tags';
import { RequiredFields } from './CardFilter';
import { Tagset } from '../../../models/graphql-schema';

type SimpleType = Partial<Tagset>;

type TestData = {
  name: string;
  data: SimpleType; //for easier testing
  result: string[];
};

const data = [
  // edge cases
  { name: 'a', data: [], result: [] },
  { name: 'b', data: [{ tagset: { tags: [] } }], result: [] },
  // normal match
  { name: '3', data: [{ tagset: { tags: ['a'] } }], result: ['a'] },
  { name: '4', data: [{ tagset: { tags: ['a', 'b'] } }], result: ['a', 'b'] },
  // from multiple sources
  { name: '5', data: [{ tagset: { tags: ['a'] } }, { tagset: { tags: ['a'] } }], result: ['a'] },
  { name: '6', data: [{ tagset: { tags: ['a'] } }, { tagset: { tags: ['b'] } }], result: ['a', 'b'] },
  { name: '7', data: [{ tagset: { tags: ['a'] } }, { tagset: { tags: ['a', 'b'] } }], result: ['a', 'b'] },
  // with sorting
  { name: '8', data: [{ tagset: { tags: ['a', 'b'] } }, { tagset: { tags: ['b'] } }], result: ['b', 'a'] },
  { name: '9', data: [{ tagset: { tags: ['a', 'b'] } }, { tagset: { tags: ['b', 'c'] } }], result: ['b', 'a', 'c'] },
] as TestData[];

describe('mostCommonTags', () => {
  data.forEach(({ name, data, result }) =>
    test(name, () => {
      const tags = mostCommonTags(data as RequiredFields[]);
      expect(tags).toEqual(result);
    })
  );
});
