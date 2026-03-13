import { Box } from '@mui/material';
import { uniq } from 'lodash-es';
import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { gutters } from '@/core/ui/grid/utils';
import { BlockTitle } from '@/core/ui/typography';
import filterFn, { getAllValues, type MatchInformation, type ValueType } from '@/core/utils/filtering/filterFn';
import type { Identifiable } from '@/core/utils/Identifiable';
import type { SearchTagsInputProps } from '@/domain/shared/components/SearchTagsInput/SearchTagsInput';
import TagsComponent from '@/domain/shared/components/TagsComponent/TagsComponent';
import { MAX_TERMS_SEARCH } from '@/main/search/SearchView';

export interface CardFilterProps<T extends Identifiable> extends Omit<SearchTagsInputProps, 'value' | 'availableTags'> {
  data: T[];
  valueGetter: (data: T) => ValueType;
  tagsGetter?: (data: T) => string[];
  inputFieldEnabled?: boolean;
  children: (filteredData: (T & MatchInformation)[]) => React.ReactNode;
  title?: string;
}

const SpaceFilter = <T extends Identifiable>({
  data,
  title,
  inputFieldEnabled = true,
  valueGetter,
  tagsGetter,
  children,
}: CardFilterProps<T>) => {
  const [terms, setTerms] = useState<string[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

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

  const deselectTerm = (term: string, index: number) => {
    setTerms(currentTerms => currentTerms.filter(t => t !== term));
    setSelectedIndexes(prevIndexes => prevIndexes.filter(idx => idx !== index));
  };

  const selectTerm = (term: string, index: number) => {
    // do not allow selection of terms that are not considered in the search
    if (selectedIndexes.length >= MAX_TERMS_SEARCH) {
      return;
    }
    setSelectedIndexes(prevIndexes => [...prevIndexes, index]);
    setTerms(currentTerms => uniq([...currentTerms, term]));
  };

  const onTermClick = useCallback(
    (term: string, index: number) => {
      if (selectedIndexes.includes(index)) {
        deselectTerm(term, index);
      } else {
        selectTerm(term, index);
      }
    },
    [selectedIndexes, deselectTerm, selectTerm]
  );

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
      </Box>
      {allValues && (
        <TagsComponent
          tags={allValues}
          color="primary"
          gap={gutters(0.5)}
          justifyContent="end"
          height={gutters(2.5)}
          selectedIndexes={selectedIndexes}
          onClickTag={onTermClick}
          canShowAll={true}
        />
      )}
      {children(filteredData)}
    </>
  );
};

export default SpaceFilter;
