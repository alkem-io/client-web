import { RequiredFields } from './CardFilter';

type FilterMapType<T> = {
  [key: string]: T;
};

export default function filterFn<T extends RequiredFields>(data: T[], terms: string[]): T[] {
  if (!data.length) {
    return [];
  }

  if (!terms.length) {
    return data;
  }

  // \b is word boundary - match whole words only
  const toRegex = (pattern: string) => new RegExp(`\\b${pattern}\\b`, 'gi');
  const termsRegex = terms.map(toRegex);

  const result: T[] = [];

  result.push(...data.filter(item => termsRegex.some(term => item.displayName.search(term) !== -1)));
  result.push(
    ...data.filter(
      item => item?.tagset?.tags && termsRegex.some(term => item?.tagset?.tags.find(tag => tag.search(term) !== -1))
    )
  );
  result.push(
    ...data.filter(
      item => item?.context?.tagline && termsRegex.some(term => item?.context?.tagline?.search(term) !== -1)
    )
  );
  result.push(
    ...data.filter(
      item => item?.context?.background && termsRegex.some(term => item?.context?.background?.search(term) !== -1)
    )
  );
  result.push(
    ...data.filter(item => item?.context?.impact && termsRegex.some(term => item?.context?.impact?.search(term) !== -1))
  );
  result.push(
    ...data.filter(item => item?.context?.vision && termsRegex.some(term => item?.context?.vision?.search(term) !== -1))
  );
  result.push(
    ...data.filter(item => item?.context?.who && termsRegex.some(term => item?.context?.who?.search(term) !== -1))
  );

  const resultsMap = result.reduce<FilterMapType<T>>((map, x) => ({ ...map, [x.id]: x }), {});

  return Object.values<T>(resultsMap);
}
