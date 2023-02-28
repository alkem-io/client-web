import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { useHydrateCard } from './hooks/useHydratedCard';
import { SearchResultMetaType } from '../../search/SearchView';
import { SearchResultType } from '../../../../core/apollo/generated/graphql-schema';

const SearchResultCardChooser = ({
  result,
}: {
  result: SearchResultMetaType | undefined;
}): React.ReactElement | null => {
  const {
    hydrateHubCard,
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
    case SearchResultType.Card:
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

export default SearchResultCardChooser;
