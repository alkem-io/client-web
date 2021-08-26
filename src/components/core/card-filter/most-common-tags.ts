import { RequiredFields } from './CardFilter';

type TagMap = {
  [key: string]: number;
};

export default function mostCommonTags<T extends RequiredFields>(data: T[]): string[] {
  if (!data.length) {
    return [];
  }
  // holds tags and usages
  const tagMap: TagMap = {};

  data
    .flatMap(x => x.tagset?.tags || [])
    .forEach(x => {
      const usages = tagMap[x];
      tagMap[x] = (usages || 0) + 1;
    });

  return Object.keys(tagMap)
    .map(x => ({
      tag: x,
      usages: tagMap[x],
    }))
    .sort((a, b) => {
      const index = b.usages - a.usages;

      return index === 0 ? a.tag.localeCompare(b.tag) : index;
    })
    .map(x => x.tag);
}
