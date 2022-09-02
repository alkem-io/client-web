import React, { useCallback, useMemo, useState } from 'react';
import filterFn, { ValueType } from './filterFn';
import SearchTagsInput, {
  CardFilterInputProps,
} from '../../../../domain/shared/components/SearchTagsInput/SearchTagsInput';
import { Identifiable } from '../../../../domain/shared/types/Identifiable';

export interface CardFilterProps<T extends Identifiable> extends Omit<CardFilterInputProps, 'value'> {
  data: T[];
  tagsValueGetter: (data: T) => string[];
  valueGetter: (data: T) => ValueType;
  inputFieldEnabled?: boolean;
  children: (filteredData: T[]) => React.ReactNode;
}

const CardFilter = <T extends Identifiable>({
  data,
  inputFieldEnabled = true,
  tagsValueGetter,
  valueGetter,
  children,
}: CardFilterProps<T>) => {
  const [terms, setTerms] = useState<string[]>([]);

  const filteredData = useMemo(() => filterFn(data, terms, valueGetter), [data, terms]);

  const handleChange = useCallback((_e: unknown, value: string[]) => {
    setTerms(value);
  }, []);

  if (!data.length) {
    return <>{children(data)}</>;
  }

  if (!inputFieldEnabled) {
    return <>{children(filteredData)}</>;
  }

  return (
    <>
      <SearchTagsInput value={data.flatMap(tagsValueGetter)} onChange={handleChange} placeholder="Filter by..." />
      {children(filteredData)}
    </>
  );
};
export default CardFilter;
