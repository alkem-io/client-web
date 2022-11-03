import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { useHydrateCard } from './hooks/useHydratedCard';
import { SearchResultMetaType } from './SearchPage';
import { SearchResultType } from '../../models/graphql-schema';

const SearchResultCardChooser = ({
  result,
}: {
  result: SearchResultMetaType | undefined;
}): React.ReactElement | null => {
  const { hydrateHubCard, hydrateChallengeCard, hydrateOpportunityCard, hydrateUserCard, hydrateOrganizationCard } =
    useHydrateCard(result);

  if (!result || !result.type) {
    return (
      <Skeleton sx={theme => ({ width: theme.cards.search.width, height: theme.cards.search.contributor.height })} />
    );
  }

  switch (result.type) {
    case SearchResultType.Hub:
      return hydrateHubCard();
    case SearchResultType.Challenge:
      return hydrateChallengeCard();
    case SearchResultType.Opportunity:
      return hydrateOpportunityCard();
    case SearchResultType.User:
      return hydrateUserCard();
    case SearchResultType.Organization:
      return hydrateOrganizationCard();
  }
  throw new Error(`Unrecognized result typename: ${result.__typename}`);
};
export default SearchResultCardChooser;
