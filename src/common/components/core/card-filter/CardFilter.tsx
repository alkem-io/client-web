import React, { useCallback, useMemo, useState } from 'react';
import filterFn, { MatchInformation, ValueType } from './filterFn';
import SearchTagsInput, {
  SearchTagsInputProps,
} from '../../../../domain/shared/components/SearchTagsInput/SearchTagsInput';
import { Identifiable } from '../../../../domain/shared/types/Identifiable';
import { useTranslation } from 'react-i18next';

export interface CardFilterProps<T extends Identifiable> extends Omit<SearchTagsInputProps, 'value' | 'availableTags'> {
  data: T[];
  tagsValueGetter?: (data: T) => string[];
  valueGetter: (data: T) => ValueType;
  inputFieldEnabled?: boolean;
  keepOpen?: boolean;
  children: (filteredData: (T & MatchInformation)[]) => React.ReactNode;
}

const CardFilter = <T extends Identifiable>({
  data,
  inputFieldEnabled = true,
  tagsValueGetter,
  valueGetter,
  keepOpen = true,
  children,
}: CardFilterProps<T>) => {
  const { t } = useTranslation();

  const [terms, setTerms] = useState<string[]>([]);

  const filteredData = useMemo(() => filterFn(data, terms, valueGetter), [data, terms, valueGetter]);

  const handleChange = useCallback((_e: unknown, value: string[]) => {
    setTerms(value);
  }, []);

  if (!data.length) {
    return <>{children([])}</>;
  }

  if (!inputFieldEnabled) {
    return <>{children(filteredData)}</>;
  }

  const availableTags = tagsValueGetter ? data.flatMap(tagsValueGetter) : [];

  return (
    <>
      <SearchTagsInput
        value={terms}
        availableTags={availableTags}
        onChange={handleChange}
        label={t('common.filter')}
        placeholder={t('common.filterby')}
        disableCloseOnSelect={keepOpen}
      />
      {children(filteredData)}
    </>
  );
};
export default CardFilter;
