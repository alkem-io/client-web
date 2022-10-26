import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { SearchResultType } from './SearchPage';
import { useHydrateCard } from './hooks/useHydratedCard';

const SearchResultCardChooser = ({ result }: { result: SearchResultType | undefined }): React.ReactElement | null => {
  const { hydrateHubCard, hydrateChallengeCard, hydrateOpportunityCard, hydrateUserCard, hydrateOrganizationCard } =
    useHydrateCard(result);

  if (!result || !result.__typename) {
    return (
      <Skeleton sx={theme => ({ width: theme.cards.search.width, height: theme.cards.search.contributor.height })} />
    );
  }

  const cardDict: Record<NonNullable<SearchResultType['__typename']>, React.ReactElement | null> = {
    Hub: hydrateHubCard(),
    Challenge: hydrateChallengeCard(),
    Opportunity: hydrateOpportunityCard(),
    User: hydrateUserCard(),
    Organization: hydrateOrganizationCard(),
  };

  const card = cardDict[result.__typename];

  if (card === undefined) {
    throw new Error(`Unrecognized result typename: ${result.__typename}`);
  }

  return card;
};
export default SearchResultCardChooser;
