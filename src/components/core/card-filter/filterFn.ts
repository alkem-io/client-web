import { RequiredFields } from './CardFilter';

export type ValueType = {
  id: string;
  values: string[];
};

type FlatValueType = {
  id: string;
  value: string;
};

export default function filterFn<T extends RequiredFields>(
  data: T[],
  terms: string[],
  valueGetter: (data: T) => ValueType
): T[] {
  if (!data.length) {
    return [];
  }

  if (!terms.length) {
    return data;
  }

  // \b is word boundary - match whole words only
  const toRegex = (pattern: string) => new RegExp(`\\b${pattern}\\b`, 'gi');
  const termsRegex = terms.map(toRegex);

  const valueTypes = data.map(valueGetter);
  const flatValueType = valueTypes.map(toFlatValueType);

  const result = flatValueType.filter(({ value }) => termsRegex.some(term => value.search(term) !== -1));

  return data.filter(({ id: dataId }) => result.some(({ id: resultId }) => resultId === dataId));
}

const toFlatValueType = ({ id, values }: ValueType): FlatValueType => ({
  id,
  value: values.filter(x => x).join(' '),
});
