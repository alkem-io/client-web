import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { useHydrateCard } from './hooks/useHydratedCard';
import { SearchResultMetaType } from '../../../main/search/SearchView';
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
  } = useHydrateCard(result);

  if (!result || !result.type) {
    return (
      <Skeleton sx={theme => ({ width: theme.cards.search.width, height: theme.cards.search.contributor.height })} />
    );
  }

  switch (result.type) {
    case SearchResultType.Space:
      return hydrateSpaceCard();
    case SearchResultType.Challenge:
      return hydrateChallengeCard();
    case SearchResultType.Opportunity:
      return hydrateOpportunityCard();
    case SearchResultType.User:
      return hydrateUserCard();
    case SearchResultType.Organization:
      return hydrateOrganizationCard();
    case SearchResultType.Post:
      return hydrateContributionCard();
    /* TODO:
    case SearchResultType.Whiteboard:
      return hydrateWhiteboardCard();
    case SearchResultType.Callout:
      return hydrateCalloutCard();
    */
  }
  throw new Error(`Unrecognized result typename: ${result.__typename}`);
};

export default SearchResultPostChooser;
