import { FilterConfig, FilterDefinition } from './Filter';
import React, { FC, useMemo, useState } from 'react';
import DashboardGenericSection from '../../../shared/components/DashboardSections/DashboardGenericSection';
import { EntityFilter } from './EntityFilter';
import CardsLayout from '../../../../core/ui/card/CardsLayout/CardsLayout';
import SearchResultCardChooser from './SearchResultCardChooser';
import { SearchResultMetaType } from './SearchPage';

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
    <DashboardGenericSection
      headerText={titleWithCount}
      primaryAction={<EntityFilter config={filterConfig} onChange={handleFilterChange} />}
    >
      <CardsLayout items={loading ? [undefined, undefined] : results} deps={[filter]}>
        {result => <SearchResultCardChooser result={result} />}
      </CardsLayout>
    </DashboardGenericSection>
  );
};

export default SearchResultSection;
