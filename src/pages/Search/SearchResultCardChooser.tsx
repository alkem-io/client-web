import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { ResultMetadataType, ResultType } from './SearchPage';
import { SearchHubCard, SearchHubCardProps, SearchUserCard } from '../../domain/shared/components/search-cards';
import {
  SearchOpportunityCard,
  SearchOpportunityCardProps,
} from '../../domain/shared/components/search-cards/SearchOpportunityCard';
import { SearchOrganizationCard } from '../../domain/shared/components/search-cards/SearchOrganizationCard';
import {
  SearchChallengeCard,
  SearchChallengeCardProps,
} from '../../domain/shared/components/search-cards/SearchChallengeCard';
import { Challenge, Hub, Opportunity } from '../../models/graphql-schema';
import { VisualName } from '../../models/constants/visuals.constants';
import { getVisualByType } from '../../common/utils/visuals.utils';
import { SearchJourneyCardProps } from '../../domain/shared/components/search-cards/SearchJourneyCardProps';
import { SearchJourneyWithParentCardProps } from '../../domain/shared/components/search-cards/SearchJourneyWithParentCardProps';

const SearchResultCardChooser = ({ result }: { result: ResultType | undefined }) => {
  if (!result || !result.__typename) {
    return <Skeleton sx={theme => ({ width: theme.cards.search.width, height: theme.cards.search.contributor.height })} />;
  }

  const cardDict: Record<NonNullable<ResultType['__typename']>, React.ReactElement> = {
    Hub: <SearchHubCard  />,
    Challenge: SearchChallengeCard,
    Opportunity: SearchOpportunityCard,
    User: SearchUserCard,
    Organization: SearchOrganizationCard,
  };

  const card = cardDict[result.__typename];

  if (!card) {
    throw new Error(`Unrecognized result typename: ${result.__typename}`);
  }

  return card;
};
export default SearchResultCardChooser;

type JourneyCardProps = SearchJourneyCardProps | SearchJourneyWithParentCardProps;
type JourneyResultType = (Hub | Challenge | Opportunity) & ResultMetadataType;

const hydrateJourneyCard = (Card: React.ComponentType<JourneyCardProps>, data: JourneyResultType, url: string) => {
  const tagline = data?.context?.tagline ?? '';
  const image = getVisualByType(VisualName.BANNER, data?.context?.visuals ?? [])?.uri ?? '';

  return  (
    <Card
      name={data.displayName}
      isMember={true}
      tagline={tagline}
      image={image}
      matchedTerms={data.terms}
      url={url}
    />
  );
};
