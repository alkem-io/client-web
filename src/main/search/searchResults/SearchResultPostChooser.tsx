import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { useHydrateCard } from './useHydratedCard';
import { SearchResultMetaType } from '../SearchView';
import { SearchResultType } from '../../../core/apollo/generated/graphql-schema';

const SearchResultPostChooser = ({
  result,
}: {
  result: SearchResultMetaType | undefined;
}): React.ReactElement | null => {
  const {
    hydrateSpaceCard,
    hydrateChallengeCard,
    hydrateOpportunityCard,
    hydrateUserCard,
    hydrateOrganizationCard,
    hydrateContributionCard,
    // TODO: Enable when server is ready
    //hydrateWhiteboardCard,
    //hydrateCalloutCard,
  } = useHydrateCard();

  if (!result || !result.type) {
    return (
      <Skeleton sx={theme => ({ width: theme.cards.search.width, height: theme.cards.search.contributor.height })} />
    );
  }

  switch (result.type) {
    case SearchResultType.Space:
      return hydrateSpaceCard(result);
    case SearchResultType.Challenge:
      return hydrateChallengeCard(result);
    case SearchResultType.Opportunity:
      return hydrateOpportunityCard(result);
    case SearchResultType.User:
      return hydrateUserCard(result);
    case SearchResultType.Organization:
      return hydrateOrganizationCard(result);
    case SearchResultType.Post:
      return hydrateContributionCard(result);
  }
};

export default SearchResultPostChooser;
