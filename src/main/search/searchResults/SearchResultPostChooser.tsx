import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { useHydrateCard } from './useHydratedCard';
import { SearchResultMetaType } from '../SearchView';
import { SearchResultType } from '@/core/apollo/generated/graphql-schema';

const SearchResultPostChooser = ({ result }: { result: SearchResultMetaType | undefined }) => {
  const {
    hydrateSpaceCard,
    hydrateUserCard,
    hydrateOrganizationCard,
    hydrateContributionCard,
    hydrateMemoCard,
    hydrateWhiteboardCard,
  } = useHydrateCard();

  if (!result || !result.type) {
    return (
      <Skeleton sx={theme => ({ width: theme.cards.search.width, height: theme.cards.search.contributor.height })} />
    );
  }

  switch (result.type) {
    case SearchResultType.Space:
    case SearchResultType.Subspace:
      return hydrateSpaceCard(result);
    case SearchResultType.User:
      return hydrateUserCard(result);
    case SearchResultType.Organization:
      return hydrateOrganizationCard(result);
    case SearchResultType.Post:
      return hydrateContributionCard(result);
    case SearchResultType.Memo:
      return hydrateMemoCard(result);
    case SearchResultType.Whiteboard:
      return hydrateWhiteboardCard(result);
    default:
      return null;
  }
};

export default SearchResultPostChooser;
