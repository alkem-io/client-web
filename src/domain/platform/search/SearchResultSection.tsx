import { FilterConfig, FilterDefinition } from './Filter';
import React, { FC, ReactNode, useMemo } from 'react';
import { EntityFilter } from './EntityFilter';
import CardsLayout from '../../../core/ui/card/CardsLayout/CardsLayout';
import SearchResultPostChooser from './SearchResultPostChooser';
import { SearchResultMetaType } from './SearchView';
import PageContentBlock from '../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../core/ui/content/PageContentBlockHeader';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const resultDisclaimer = results.length >= 8 ? t('pages.search.results-disclaimer') : undefined;
  return (
    <PageContentBlock>
      <PageContentBlockHeader
        title={titleWithCount}
        disclaimer={resultDisclaimer}
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
        {result => <SearchResultPostChooser result={result} />}
      </CardsLayout>
    </PageContentBlock>
  );
};

export default SearchResultSection;
