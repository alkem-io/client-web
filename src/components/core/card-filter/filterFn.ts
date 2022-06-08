import { Identifiable } from '../../../domain/shared/types/Identifiable';

export type ValueType = {
  id: string;
  values: string[];
};

export type ValueGetter<T extends Identifiable> = (data: T) => ValueType;

type FlatValueType = {
  id: string;
  value: string;
};

export default function filterFn<T extends Identifiable>(data: T[], terms: string[], valueGetter: ValueGetter<T>): T[] {
  if (!data.length) {
    return data;
  }

  if (!terms.length) {
    return data;
  }

  // \b is word boundary - match whole words only
  const toRegex = (pattern: string) => new RegExp(`\\b${pattern}\\b`, 'gi');
  const termsRegex = terms.map(toRegex);

  const valueTypes = data.map(valueGetter);
  const flatValueType = valueTypes.map(toFlatValueType);

  const result = flatValueType.filter(({ value }) => termsRegex.some(term => value.match(term)));

  return data.filter(({ id: dataId }) => result.some(({ id: resultId }) => resultId === dataId));
}

const toFlatValueType = ({ id, values }: ValueType): FlatValueType => ({
  id,
  value: values.filter(x => x).join(' '),
});
