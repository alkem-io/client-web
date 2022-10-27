import { SearchResultType, SearchResult } from '../SearchPage';
import {
  ChallengeSearchResultFragment,
  HubSearchResultFragment,
  OpportunitySearchResultFragment,
  OrganizationSearchResultFragment,
  UserRolesSearchCardsQuery,
  UserSearchResultFragment,
} from '../../../models/graphql-schema';
import React from 'react';
import {
  buildChallengeUrl,
  buildHubUrl,
  buildOpportunityUrl,
  buildOrganizationUrl,
  buildUserProfileUrl,
} from '../../../common/utils/urlBuilders';
import {
  SearchChallengeCard,
  SearchHubCard,
  SearchOpportunityCard,
  SearchOrganizationCard,
  SearchUserCard,
} from '../../../domain/shared/components/search-cards';
import { RoleType } from '../../../domain/community/contributor/user/constants/RoleType';
import { getVisualBanner } from '../../../common/utils/visuals.utils';
import { useHubNameQuery, useUserRolesSearchCardsQuery } from '../../../hooks/generated/graphql';
import { useUserContext } from '../../../domain/community/contributor/user/hooks/useUserContext';

const _hydrateUserCard = (data: SearchResult<UserSearchResultFragment>): React.ReactElement => {
  // todo extract in func
  const profile = data?.profile;
  const image = profile?.avatar?.uri;
  const { country, city } = profile?.location ?? {};
  const url = buildUserProfileUrl(data.nameID);

  return (
    <SearchUserCard
      image={image}
      name={data.displayName}
      country={country}
      city={city}
      matchedTerms={data.terms}
      url={url}
    />
  );
};

const _hydrateOrganizationCard = (
  data: SearchResult<OrganizationSearchResultFragment>,
  userRoles: UserRolesSearchCardsQuery['rolesUser'] | undefined
) => {
  // todo extract in func
  const profile = data.profile_;
  const image = profile?.avatar?.uri;
  const { country, city } = profile?.location ?? {};
  const url = buildOrganizationUrl(data.nameID);

  const organizationRoles = userRoles?.organizations.find(x => x.id === data.id);
  const label = organizationRoles?.roles.find(x => x === RoleType.Associate);

  return (
    <SearchOrganizationCard
      image={image}
      label={label}
      name={data.displayName}
      country={country}
      city={city}
      matchedTerms={data.terms}
      url={url}
    />
  );
};

const _hydrateHubCard = (
  data: SearchResult<HubSearchResultFragment>,
  userRoles: UserRolesSearchCardsQuery['rolesUser'] | undefined
) => {
  const context = data.context;
  const tagline = context?.tagline;
  const image = getVisualBanner(context?.visuals);
  const name = data.displayName;
  const matchedTerms = data.terms;
  const url = buildHubUrl(data.nameID);

  const hubRoles = userRoles?.hubs.find(x => x.id === data.id);
  const label =
    hubRoles?.roles.find(x => x === RoleType.Lead) ||
    hubRoles?.roles.find(x => x === RoleType.Host) ||
    hubRoles?.roles.find(x => x === RoleType.Member);

  return (
    <SearchHubCard image={image} label={label} name={name} tagline={tagline} matchedTerms={matchedTerms} url={url} />
  );
};

const useHydrateChallengeCard = (
  data: SearchResult<ChallengeSearchResultFragment> | undefined,
  userRoles: UserRolesSearchCardsQuery['rolesUser'] | undefined,
  skip: boolean
) => {
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

  const challengeRoles = userRoles?.hubs.find(x => x.id === hubId)?.challenges.find(x => x.id === data?.id);

  const label =
    challengeRoles?.roles.find(x => x === RoleType.Lead) || challengeRoles?.roles.find(x => x === RoleType.Member);

  return (
    <SearchChallengeCard
      image={image}
      label={label}
      name={name}
      tagline={tagline}
      parentName={hubDisplayName}
      matchedTerms={matchedTerms}
      url={url}
    />
  );
};

const useHydrateOpportunityCard = (
  data: SearchResult<OpportunitySearchResultFragment> | undefined,
  userRoles: UserRolesSearchCardsQuery['rolesUser'] | undefined,
  skip: boolean
) => {
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

  if (!hubData || !challengeNameId || !name || !nameID || !challengeDisplayName) {
    return null;
  }

  const hubNameId = hubData.hub.nameID;

  const url = buildOpportunityUrl(hubNameId, challengeNameId, nameID);

  const opportunityRoles = userRoles?.hubs
    .find(x => x.id === data?.challenge?.hubID)
    ?.opportunities.find(x => x.id === data?.id);

  const label =
    opportunityRoles?.roles.find(x => x === RoleType.Lead) || opportunityRoles?.roles.find(x => x === RoleType.Member);

  return (
    <SearchOpportunityCard
      image={image}
      label={label}
      name={name}
      tagline={tagline}
      parentName={challengeDisplayName}
      matchedTerms={matchedTerms}
      url={url}
    />
  );
};

export const useHydrateCard = (result: SearchResultType | undefined) => {
  const { user: userMetadata } = useUserContext();
  const userId = userMetadata?.user?.id;

  const { data: rolesData } = useUserRolesSearchCardsQuery({
    variables: {
      userId: userId!,
    },
    skip: !userId,
  });
  const userRoles = rolesData?.rolesUser;

  const hydrateUserCard = () => _hydrateUserCard(result as SearchResult<UserSearchResultFragment>);

  const hydrateOrganizationCard = () =>
    _hydrateOrganizationCard(result as SearchResult<OrganizationSearchResultFragment>, userRoles);

  const hydrateHubCard = () => _hydrateHubCard(result as SearchResult<HubSearchResultFragment>, userRoles);

  const hydrateChallengeCardResult = useHydrateChallengeCard(
    result as SearchResult<ChallengeSearchResultFragment>,
    userRoles,
    !result || !result['hubID']
  );
  const hydrateChallengeCard = () => hydrateChallengeCardResult;

  const hydrateOpportunityCardResult = useHydrateOpportunityCard(
    result as SearchResult<OpportunitySearchResultFragment>,
    userRoles,
    !result || !result['challenge']
  );
  const hydrateOpportunityCard = () => hydrateOpportunityCardResult;

  return {
    hydrateUserCard,
    hydrateOrganizationCard,
    hydrateHubCard,
    hydrateChallengeCard,
    hydrateOpportunityCard,
  };
};
