import { FilterConfig, FilterDefinition } from './Filter';
import React, { FC, useMemo, useState } from 'react';
import DashboardGenericSection from '../../domain/shared/components/DashboardSections/DashboardGenericSection';
import { EntityFilter } from './EntityFilter';
import { ResultType } from './SearchPage';
import { SearchHubCard, SearchUserCard } from '../../domain/shared/components/search-cards';
import { Box } from '@mui/material';
import { SearchChallengeCard } from '../../domain/shared/components/search-cards/SearchChallengeCard';
import { SearchOpportunityCard } from '../../domain/shared/components/search-cards/SearchOpportunityCard';
import { SearchOrganizationCard } from '../../domain/shared/components/search-cards/SearchOrganizationCard';

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
        <SearchHubCard
          name={'Display name'}
          isMember={true}
          tagline={
            '[tagline] Openstaan voor innovatie uit alle perspectieven. Samen maak je een dorp en dus ook ons online bestaan. '
          }
          image={'http://localhost:3000/ipfs/QmRP176WvvbMGFeU3KwG1zEjYbitYCq3jMm4nDYzcHty9y'}
          matchedTerms={['term1', 'long-term-2', 'term3', 'term4']}
          url={''}
        />
        <SearchChallengeCard
          name={'Display name'}
          parentName={'Parent display name'}
          isMember={true}
          tagline={'123'}
          image={'http://localhost:3000/ipfs/QmRP176WvvbMGFeU3KwG1zEjYbitYCq3jMm4nDYzcHty9y'}
          matchedTerms={['term1', 'long-term-2', 'term3', 'term4']}
          url={''}
        />
        <SearchOpportunityCard
          name={'Display name'}
          parentName={'Parent display name'}
          isMember={true}
          tagline={'123'}
          image={'http://localhost:3000/ipfs/QmRP176WvvbMGFeU3KwG1zEjYbitYCq3jMm4nDYzcHty9y'}
          matchedTerms={['term1', 'long-term-2', 'term3', 'term4']}
          url={''}
        />
        <SearchUserCard
          name={'Long Long Long Long Long Long Long Long Display name'}
          image={'http://localhost:3000/ipfs/QmRP176WvvbMGFeU3KwG1zEjYbitYCq3jMm4nDYzcHty9y'}
          country="BG"
          city="Sofia"
          matchedTerms={['term1', 'long-term-2']}
          url={''}
        />
        <SearchOrganizationCard
          name={'Long Long Long Long Long Long Long Long Display name'}
          image={'http://localhost:3000/ipfs/QmRP176WvvbMGFeU3KwG1zEjYbitYCq3jMm4nDYzcHty9y'}
          country="BG"
          city="Sofia"
          matchedTerms={['term1', 'long-term-2']}
          url={''}
        />
      </Box>
    </DashboardGenericSection>
  );
};
export default SearchResultSection;
