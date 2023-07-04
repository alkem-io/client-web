import { Identifiable } from '../../../../domain/shared/types/Identifiable';

export type ValueType = {
  id: string;
  values: string[];
};

export type ValueGetter<T extends Identifiable> = (data: T) => ValueType;

type FlatValueType = {
  id: string;
  value: string;
};

export type MatchInformation = {
  matchedTerms?: string[];
};

type MatchedValue = FlatValueType & MatchInformation;

/**
 * @param data array of objects
 * @param terms array of strings to search them on these objects
 * @param valueGetter function to retrieve information from each object. Will return an array of { id, values[] that apply to this object }
 * @returns an array with a copy of the same objects + an extra property added called matchedTerms with the terms found in each object
 */
export default function filterFn<T extends Identifiable>(
  data: T[],
  terms: string[],
  valueGetter: ValueGetter<T>
): (T & MatchInformation)[] {
  if (!data.length) {
    return [];
  }

  // If no terms to search just return all the objects with an empty matchedTerms array
  if (!terms.length) {
    return data.map(item => ({ ...item, matchedTerms: [] }));
  }

  // \b is word boundary - match whole words only
  const toRegex = (term: string) => ({ term, regex: new RegExp(`\\b${term}\\b`, 'gi') });
  const termsRegex = terms.map(toRegex);

  const values = data.map(valueGetter);
  const flatValues = values.map(toFlatValueType);

  const results: MatchedValue[] = flatValues
    .map(fv => ({
      ...fv,
      // Find if there are any terms that match the flatValue
      matchedTerms: termsRegex.filter(term => fv.value.match(term.regex)).map(termRegex => termRegex.term),
    }))
    // Filter to get only the objects that had at least one match
    .filter(result => result.matchedTerms.length);

  // We have an array of MatchedValues now. Find their corresponding object:
  return data
    .filter(({ id: dataId }) => results.some(({ id: resultId }) => resultId === dataId))
    .map(item => ({
      // Return the entire object + matchedTerms
      ...item,
      matchedTerms: results.find(r => r.id === item.id)?.matchedTerms,
    }));
}

const toFlatValueType = ({ id, values }: ValueType): FlatValueType => ({
  id,
  value: values.filter(x => x).join(' '),
});

interface HashTable<T> {
  [key: string]: T;
}

/**
 * Returns all the tags/terms found in each data item and the amount of times that they appear
 * @param data items to search for tags in.
 * @param tagsGetter a function that will be called for each item to retrieve the tags and group them
 */
export function getAllValues<T extends Identifiable>(
  data: T[],
  tagsGetter: (element: T) => string[]
): { term: string; count: number }[] {
  const result: HashTable<{ term: string; count: number }> = {};
  data.forEach(element => {
    const terms = tagsGetter(element);
    terms.forEach(term => {
      const item = result[term.toLocaleLowerCase()];
      if (item) {
        item.count++;
      } else {
        result[term.toLocaleLowerCase()] = {
          term,
          count: 1,
        };
      }
    });
  });
  return Object.values(result);
}
