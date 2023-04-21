import React, { useCallback, useMemo, useState } from 'react';
import { SearchTagsInputProps } from '../../../../domain/shared/components/SearchTagsInput/SearchTagsInput';
import { Identifiable } from '../../../../domain/shared/types/Identifiable';
import MultipleSelect from '../../../../domain/platform/search/MultipleSelect';
import filterFn, { MatchInformation, ValueType } from '../../../../common/components/core/card-filter/filterFn';
import { Box } from '@mui/material';
import { BlockTitle } from '../../../../core/ui/typography';

export interface CardFilterProps<T extends Identifiable> extends Omit<SearchTagsInputProps, 'value' | 'availableTags'> {
  data: T[];
  valueGetter: (data: T) => ValueType;
  inputFieldEnabled?: boolean;
  children: (filteredData: (T & MatchInformation)[]) => React.ReactNode;
  title?: string;
}

const JourneyFilter = <T extends Identifiable>({
  data,
  title,
  inputFieldEnabled = true,
  valueGetter,
  children,
}: CardFilterProps<T>) => {
  const [terms, setTerms] = useState<string[]>([]);

  const filteredData = useMemo(() => filterFn(data, terms, valueGetter), [data, terms, valueGetter]);

  const handleChange = useCallback((value: string[]) => {
    setTerms(value);
  }, []);

  if (!data.length) {
    return <>{children([])}</>;
  }

  if (!inputFieldEnabled) {
    return <>{children(filteredData)}</>;
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <BlockTitle>{title}</BlockTitle>
        <MultipleSelect onChange={handleChange} value={terms} minLength={2} size="xsmall" />
      </Box>
      {children(filteredData)}
    </>
  );
};

export default JourneyFilter;
