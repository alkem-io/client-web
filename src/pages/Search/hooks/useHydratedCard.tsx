import {
  SearchResultChallengeFragment,
  SearchResultHubFragment,
  SearchResultOpportunityFragment,
  SearchResultOrganizationFragment,
  SearchResultUserFragment,
  UserRolesSearchCardsQuery,
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
import { useUserRolesSearchCardsQuery } from '../../../hooks/generated/graphql';
import { useUserContext } from '../../../domain/community/contributor/user/hooks/useUserContext';
import { SearchResultMetaType, SearchResultT } from '../SearchPage';

const _hydrateUserCard = (data: SearchResultT<SearchResultUserFragment>) => {
  if (!data?.user) {
    return null;
  }
  const user = data.user;
  // todo extract in func
  const profile = user.profile;
  const image = profile?.avatar?.uri;
  const { country, city } = profile?.location ?? {};
  const url = buildUserProfileUrl(user.nameID);

  return (
    <SearchUserCard
      image={image}
      name={user.displayName}
      country={country}
      city={city}
      matchedTerms={data.terms}
      url={url}
    />
  );
};

const _hydrateOrganizationCard = (
  data: SearchResultT<SearchResultOrganizationFragment>,
  userRoles: UserRolesSearchCardsQuery['rolesUser'] | undefined
) => {
  if (!data?.organization) {
    return null;
  }
  const organization = data.organization;
  // todo extract in func
  const profile = data.organization.profile;
  const image = profile?.avatar?.uri;
  const { country, city } = profile?.location ?? {};
  const url = buildOrganizationUrl(organization.nameID);

  const organizationRoles = userRoles?.organizations.find(x => x.id === organization.id);
  const label = organizationRoles?.roles.find(x => x === RoleType.Associate);

  return (
    <SearchOrganizationCard
      image={image}
      label={label}
      name={organization.displayName}
      country={country}
      city={city}
      matchedTerms={data.terms}
      url={url}
    />
  );
};

const _hydrateHubCard = (
  data: SearchResultT<SearchResultHubFragment>,
  userRoles: UserRolesSearchCardsQuery['rolesUser'] | undefined
) => {
  if (!data?.hub) {
    return null;
  }
  const hub = data.hub;
  const context = hub.context;
  const tagline = context?.tagline;
  const image = getVisualBanner(context?.visuals);
  const name = hub.displayName;
  const matchedTerms = data.terms;
  const url = buildHubUrl(hub.nameID);

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
  data: SearchResultT<SearchResultChallengeFragment> | undefined,
  userRoles: UserRolesSearchCardsQuery['rolesUser'] | undefined,
  skip: boolean
) => {
  if (skip || !data?.challenge || !data?.hub) {
    return null;
  }
  const challenge = data.challenge;
  const containingHub = data.hub;
  const context = challenge.context;
  const tagline = context?.tagline;
  const image = getVisualBanner(context?.visuals);
  const name = challenge.displayName;
  const matchedTerms = data?.terms ?? [];
  const hubId = containingHub.id;
  const hubNameId = containingHub.nameID;
  const hubDisplayName = containingHub.displayName;

  const nameID = challenge.nameID;

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
  data: SearchResultT<SearchResultOpportunityFragment> | undefined,
  userRoles: UserRolesSearchCardsQuery['rolesUser'] | undefined,
  skip: boolean
) => {
  if (skip || !data?.opportunity) {
    return null;
  }
  const opportunity = data.opportunity;
  const containingChallenge = data.challenge;
  const containingHub = data.hub;
  const context = opportunity.context;
  const tagline = context?.tagline;
  const image = getVisualBanner(context?.visuals);
  const name = opportunity.displayName;
  const matchedTerms = data?.terms ?? [];
  const challengeNameId = containingChallenge.nameID;
  const challengeDisplayName = containingChallenge.displayName;
  const hubId = containingHub.id;
  const hubNameID = containingHub.nameID;
  const nameID = opportunity.nameID;

  const url = buildOpportunityUrl(hubNameID, challengeNameId, nameID);

  const opportunityRoles = userRoles?.hubs.find(x => x.id === hubId)?.opportunities.find(x => x.id === data?.id);

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

export const useHydrateCard = (result: SearchResultMetaType | undefined) => {
  const { user: userMetadata } = useUserContext();
  const userId = userMetadata?.user?.id;

  const { data: rolesData } = useUserRolesSearchCardsQuery({
    variables: {
      userId: userId!,
    },
    skip: !userId,
  });
  const userRoles = rolesData?.rolesUser;

  const hydrateUserCard = () => _hydrateUserCard(result as SearchResultT<SearchResultUserFragment>);

  const hydrateOrganizationCard = () =>
    _hydrateOrganizationCard(result as SearchResultT<SearchResultOrganizationFragment>, userRoles);

  const hydrateHubCard = () => _hydrateHubCard(result as SearchResultT<SearchResultHubFragment>, userRoles);

  const hydrateChallengeCardResult = useHydrateChallengeCard(
    result as SearchResultT<SearchResultChallengeFragment>,
    userRoles,
    !result || !result['hubID']
  );
  const hydrateChallengeCard = () => hydrateChallengeCardResult;

  const hydrateOpportunityCardResult = useHydrateOpportunityCard(
    result as SearchResultT<SearchResultOpportunityFragment>,
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
