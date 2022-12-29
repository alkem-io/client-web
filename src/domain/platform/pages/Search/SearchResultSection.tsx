import { FilterConfig, FilterDefinition } from './Filter';
import React, { FC, useMemo, useState } from 'react';
import { EntityFilter } from './EntityFilter';
import CardsLayout from '../../../../core/ui/card/CardsLayout/CardsLayout';
import SearchResultCardChooser from './SearchResultCardChooser';
import { SearchResultMetaType } from './SearchPage';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';

interface ResultSectionProps {
  title: string;
  results: SearchResultMetaType[] | undefined;
  filterConfig: FilterConfig;
  onFilterChange: (value: FilterDefinition['value']) => void;
  loading?: boolean;
}

const SearchResultSection: FC<ResultSectionProps> = ({
  title,
  results = [],
  filterConfig,
  onFilterChange,
  loading,
}) => {
  const [filter, setFilter] = useState<string>();

  const handleFilterChange = value => {
    onFilterChange(value);
    setFilter(value);
  };

  const titleWithCount = useMemo(() => `${title} (${results.length})`, [title, results.length]);

  return (
    <PageContentBlock>
      <PageContentBlockHeader
        title={titleWithCount}
        actions={<EntityFilter config={filterConfig} onChange={handleFilterChange} />}
      />
      <CardsLayout items={loading ? [undefined, undefined] : results} deps={[filter]} cards={false} disablePadding>
        {result => <SearchResultCardChooser result={result} />}
      </CardsLayout>
    </PageContentBlock>
  );
};

export default SearchResultSection;
