import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import { ResultType, SearchResult } from './SearchPage';
import { SearchHubCard, SearchUserCard } from '../../domain/shared/components/search-cards';
import { SearchOrganizationCard } from '../../domain/shared/components/search-cards/SearchOrganizationCard';
import { SearchChallengeCard } from '../../domain/shared/components/search-cards/SearchChallengeCard';
import {
  ChallengeSearchResultFragment,
  HubSearchResultFragment,
  OpportunitySearchResultFragment,
  OrganizationSearchResultFragment,
  UserSearchResultFragment,
} from '../../models/graphql-schema';
import { getVisualBanner } from '../../common/utils/visuals.utils';
import {
  buildChallengeUrl,
  buildHubUrl,
  buildOpportunityUrl,
  buildOrganizationUrl,
  buildUserProfileUrl,
} from '../../common/utils/urlBuilders';
import { useHubNameQuery } from '../../hooks/generated/graphql';

const SearchResultCardChooser = ({ result }: { result: ResultType | undefined }): React.ReactElement | null => {
  const {
    hydrateHubCard,
    useHydrateChallengeCardHook,
    useHydrateOpportunityCardHook,
    hydrateUserCard,
    hydrateOrganizationCard,
  } = useHydrateCard(result);

  const hydrateChallengeCardResult = useHydrateChallengeCardHook();
  const hydrateOpportunityCardResult = useHydrateOpportunityCardHook();

  if (!result || !result.__typename) {
    return (
      <Skeleton sx={theme => ({ width: theme.cards.search.width, height: theme.cards.search.contributor.height })} />
    );
  }

  const cardDict: Record<NonNullable<ResultType['__typename']>, React.ReactElement | null> = {
    Hub: hydrateHubCard(),
    Challenge: hydrateChallengeCardResult,
    Opportunity: hydrateOpportunityCardResult,
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

const useHydrateCard = (result: ResultType | undefined) => {
  const hydrateUserCard = () => _hydrateUserCard(result as SearchResult<UserSearchResultFragment>);

  const hydrateOrganizationCard = () =>
    _hydrateOrganizationCard(result as SearchResult<OrganizationSearchResultFragment>);

  const hydrateHubCard = () => _hydrateHubCard(result as SearchResult<HubSearchResultFragment>);

  const useHydrateChallengeCardHook = () =>
    useHydrateChallengeCard(result as SearchResult<ChallengeSearchResultFragment>, !result || !result['hubID']);

  const useHydrateOpportunityCardHook = () =>
    useHydrateOpportunityCard(result as SearchResult<OpportunitySearchResultFragment>, !result || !result['challenge']);

  return {
    hydrateUserCard,
    hydrateOrganizationCard,
    hydrateHubCard,
    useHydrateChallengeCardHook,
    useHydrateOpportunityCardHook,
  };
};

const _hydrateUserCard = (data: SearchResult<UserSearchResultFragment>): React.ReactElement => {
  // todo extract in func
  const profile = data?.profile;
  const image = profile?.avatar?.uri;
  const { country, city } = profile?.location ?? {};
  const url = buildUserProfileUrl(data.nameID);

  return (
    <SearchUserCard
      image={image}
      label={'placeholder'}
      name={data.displayName}
      country={country}
      city={city}
      matchedTerms={data.terms}
      url={url}
    />
  );
};

const _hydrateOrganizationCard = (data: SearchResult<OrganizationSearchResultFragment>) => {
  // todo extract in func
  const profile = data.profile_;
  const image = profile?.avatar?.uri;
  const { country, city } = profile?.location ?? {};
  const url = buildOrganizationUrl(data.nameID);

  return (
    <SearchOrganizationCard
      image={image}
      label={'placeholder'}
      name={data.displayName}
      country={country}
      city={city}
      matchedTerms={data.terms}
      url={url}
    />
  );
};

const _hydrateHubCard = (data: SearchResult<HubSearchResultFragment>) => {
  const context = data.context;
  const tagline = context?.tagline;
  const image = getVisualBanner(context?.visuals);
  const name = data.displayName;
  const matchedTerms = data.terms;
  const url = buildHubUrl(data.nameID);

  return <SearchHubCard image={image} name={name} tagline={tagline} matchedTerms={matchedTerms} url={url} />;
};

const useHydrateChallengeCard = (data: SearchResult<ChallengeSearchResultFragment> | undefined, skip: boolean) => {
  const context = data?.context;
  const tagline = context?.tagline;
  const image = getVisualBanner(context?.visuals);
  const name = data?.displayName;
  const matchedTerms = data?.terms ?? [];
  const hubId = data?.hubID;
  const nameID = data?.nameID;

  const { data: hubData } = useHubNameQuery({
    variables: {
      hubId: hubId!,
    },
    skip: !hubId || skip,
  });

  if (skip) {
    return null;
  }

  if (!hubData || !name || !nameID) {
    return null;
  }

  const hubNameId = hubData.hub.nameID;
  const hubDisplayName = hubData.hub.displayName;
  const url = buildChallengeUrl(hubNameId, nameID);

  return (
    <SearchChallengeCard
      image={image}
      name={name}
      tagline={tagline}
      parentName={hubDisplayName}
      matchedTerms={matchedTerms}
      url={url}
    />
  );
};

const useHydrateOpportunityCard = (data: SearchResult<OpportunitySearchResultFragment> | undefined, skip: boolean) => {
  const context = data?.context;
  const tagline = context?.tagline;
  const image = getVisualBanner(context?.visuals);
  const name = data?.displayName;
  const matchedTerms = data?.terms ?? [];
  const challengeNameId = data?.challenge?.nameID;
  const challengeDisplayName = data?.challenge?.displayName;
  const hubId = data?.challenge?.hubID;
  const nameID = data?.nameID;

  const { data: hubData } = useHubNameQuery({
    variables: {
      hubId: hubId!,
    },
    skip: !hubId || skip,
  });

  if (skip) {
    return null;
  }

  if (!hubData || !challengeNameId || !name || !nameID) {
    return null;
  }

  const hubNameId = hubData.hub.nameID;

  const url = buildOpportunityUrl(hubNameId, challengeNameId, nameID);

  if (!challengeDisplayName) {
    return null;
  }

  return (
    <SearchChallengeCard
      image={image}
      name={name}
      tagline={tagline}
      parentName={challengeDisplayName}
      matchedTerms={matchedTerms}
      url={url}
    />
  );
};
