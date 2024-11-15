import React, { useMemo, useState } from 'react';
import { SearchTagsInputProps } from '../../../shared/components/SearchTagsInput/SearchTagsInput';
import { Identifiable } from '@/core/utils/Identifiable';
import MultipleSelect from '@/core/ui/search/MultipleSelect';
import filterFn, { MatchInformation, ValueType, getAllValues } from '@/core/utils/filtering/filterFn';
import { Box } from '@mui/material';
import { BlockTitle } from '@/core/ui/typography';
import TagsComponent from '../../../shared/components/TagsComponent/TagsComponent';
import { gutters } from '@/core/ui/grid/utils';
import { uniq } from 'lodash';
import { MAX_TERMS_SEARCH } from '../../../../main/search/SearchView';

export interface CardFilterProps<T extends Identifiable> extends Omit<SearchTagsInputProps, 'value' | 'availableTags'> {
  data: T[];
  valueGetter: (data: T) => ValueType;
  tagsGetter?: (data: T) => string[];
  inputFieldEnabled?: boolean;
  children: (filteredData: (T & MatchInformation)[]) => React.ReactNode;
  title?: string;
}

const JourneyFilter = <T extends Identifiable>({
  data,
  title,
  inputFieldEnabled = true,
  valueGetter,
  tagsGetter,
  children,
}: CardFilterProps<T>) => {
  const [terms, setTerms] = useState<string[]>([]);

  const allValues = useMemo(
    () =>
      tagsGetter
        ? getAllValues(data, tagsGetter)
            .sort((a, b) => a.term.toLocaleLowerCase().localeCompare(b.term.toLocaleLowerCase()))
            .sort((a, b) => b.count - a.count)
            .map(element => element.term)
        : undefined,
    [data, tagsGetter]
  );

  const filteredData = useMemo(
    () => filterFn(data, terms.slice(0, MAX_TERMS_SEARCH), valueGetter),
    [data, terms, valueGetter]
  );

  const handleChange = (value: string[]) => {
    setTerms(value);
  };

  if (!data.length) {
    return <>{children([])}</>;
  }

  if (!inputFieldEnabled) {
    return <>{children(filteredData)}</>;
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={gutters(0.5)}>
        <BlockTitle>{title}</BlockTitle>
        <MultipleSelect
          onChange={handleChange}
          value={terms}
          minLength={2}
          size="xsmall"
          containerProps={{ marginLeft: 'auto', maxWidth: '100%', overflow: 'hidden' }}
        />
      </Box>
      {allValues && (
        <TagsComponent
          tags={allValues}
          variant="filled"
          color="primary"
          gap={gutters(0.5)}
          justifyContent="end"
          height={gutters(2.5)}
          onClickTag={term => {
            setTerms(currentTerms => uniq([...currentTerms, term]));
          }}
          canShowAll
        />
      )}
      {children(filteredData)}
    </>
  );
};

export default JourneyFilter;
