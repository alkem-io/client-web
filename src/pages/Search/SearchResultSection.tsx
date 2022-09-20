import { FilterConfig, FilterDefinition } from './Filter';
import React, { FC, useMemo, useState } from 'react';
import DashboardGenericSection from '../../domain/shared/components/DashboardSections/DashboardGenericSection';
import { EntityFilter } from './EntityFilter';
import { ResultType } from './SearchPage';
import { SearchHubCard, SearchUserCard } from '../../domain/shared/components/search-cards';
import { Box } from '@mui/material';

interface ResultSectionProps {
  title: string;
  results: ResultType[] | undefined;
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

  const titleWithCount = useMemo(() => `${title} (${results.length})`, [results.length]);

  return (
    <DashboardGenericSection
      headerText={titleWithCount}
      primaryAction={<EntityFilter config={filterConfig} onChange={handleFilterChange} />}
    >
      {/*<CardsLayout items={loading ? [undefined, undefined] : results} deps={[filter]}>*/}
      {/*  {result => <SearchResultCardChooser result={result} />}*/}
      {/*</CardsLayout>*/}
      <Box sx={{ display: 'flex', gap: '16px' }}>
        <SearchHubCard />
        <SearchUserCard />
      </Box>
    </DashboardGenericSection>
  );
};
export default SearchResultSection;
