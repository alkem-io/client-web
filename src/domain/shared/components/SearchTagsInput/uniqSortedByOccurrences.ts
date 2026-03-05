import { countBy, sortBy } from 'lodash-es';

const uniqSortedByOccurrences = (tags: string[]): string[] => {
  if (!tags.length) {
    return [];
  }

  const usageCounter = countBy(tags);

  return sortBy(Object.keys(usageCounter).sort(), key => -usageCounter[key]);
};

export default uniqSortedByOccurrences;
