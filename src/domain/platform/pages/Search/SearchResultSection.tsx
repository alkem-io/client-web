import { FilterConfig, FilterDefinition } from './Filter';
import React, { FC, ReactNode, useMemo } from 'react';
import { EntityFilter } from './EntityFilter';
import CardsLayout from '../../../../core/ui/card/CardsLayout/CardsLayout';
import SearchResultCardChooser from './SearchResultCardChooser';
import { SearchResultMetaType } from '../../search/SearchView';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';

interface ResultSectionProps {
  title: ReactNode;
  results: SearchResultMetaType[] | undefined;
  filterTitle?: string;
  filterConfig: FilterConfig;
  currentFilter: FilterDefinition;
  onFilterChange: (value: FilterDefinition) => void;
  loading?: boolean;
}

const SearchResultSection: FC<ResultSectionProps> = ({
  title,
  results = [],
  filterTitle,
  filterConfig,
  currentFilter,
  onFilterChange,
  loading,
}) => {
  const titleWithCount = useMemo(() => `${title} (${results.length})`, [title, results.length]);

  return (
    <PageContentBlock>
      <PageContentBlockHeader
        title={titleWithCount}
        actions={
          <EntityFilter
            title={filterTitle}
            currentFilter={currentFilter}
            config={filterConfig}
            onChange={onFilterChange}
          />
        }
      />
      <CardsLayout
        items={loading ? [undefined, undefined] : results}
        deps={[currentFilter]}
        cards={false}
        disablePadding
      >
        {result => <SearchResultCardChooser result={result} />}
      </CardsLayout>
    </PageContentBlock>
  );
};

export default SearchResultSection;
