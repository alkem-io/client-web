import {
  SearchResultChallengeFragment,
  SearchResultHubFragment,
  SearchResultOpportunityFragment,
  SearchResultOrganizationFragment,
  SearchResultUserFragment,
  UserRolesSearchCardsQuery,
} from '../../../../../core/apollo/generated/graphql-schema';
import React from 'react';
import {
  buildChallengeUrl,
  buildHubUrl,
  buildOpportunityUrl,
  buildOrganizationUrl,
  buildUserProfileUrl,
} from '../../../../../common/utils/urlBuilders';
import {
  SearchChallengeCard,
  SearchHubCard,
  SearchOpportunityCard,
  SearchOrganizationCard,
  SearchUserCard,
} from '../../../../shared/components/search-cards';
import { RoleType } from '../../../../community/contributor/user/constants/RoleType';
import { getVisualBanner } from '../../../../common/visual/utils/visuals.utils';
import { useUserRolesSearchCardsQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import { useUserContext } from '../../../../community/contributor/user/hooks/useUserContext';
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
  const tagline = context?.tagline || '';
  const image = getVisualBanner(context?.visuals);
  const name = hub.displayName;
  // const matchedTerms = data.terms;
  const url = buildHubUrl(hub.nameID);
  const tags = data.terms; // TODO: add terms field to journey card
  const vision = hub.context?.vision || '';

  const hubRoles = userRoles?.hubs.find(x => x.id === data.id);
  const label =
    hubRoles?.roles.find(x => x === RoleType.Lead) ||
    hubRoles?.roles.find(x => x === RoleType.Host) ||
    hubRoles?.roles.find(x => x === RoleType.Member);

  return (
    <SearchHubCard
      bannerUri={image}
      member={!!label}
      displayName={name}
      tagline={tagline}
      // matchedTerms={matchedTerms}
      journeyUri={url}
      tags={tags}
      vision={vision}
    />
  );
};

const useHydrateChallengeCard = (
  data: SearchResultT<SearchResultChallengeFragment> | undefined,
  userRoles: UserRolesSearchCardsQuery['rolesUser'] | undefined
) => {
  if (!data?.challenge || !data?.hub) {
    return null;
  }
  const challenge = data.challenge;
  const containingHub = data.hub;
  const context = challenge.context;
  const tagline = context?.tagline || '';
  const image = getVisualBanner(context?.visuals);
  const name = challenge.displayName;
  const matchedTerms = data?.terms ?? [];
  const hubId = containingHub.id;
  const hubNameId = containingHub.nameID;
  const hubDisplayName = containingHub.displayName;
  const vision = challenge.context?.vision || '';

  const nameID = challenge.nameID;

  const url = buildChallengeUrl(hubNameId, nameID);

  const challengeRoles = userRoles?.hubs.find(x => x.id === hubId)?.challenges.find(x => x.id === data?.id);

  const label =
    challengeRoles?.roles.find(x => x === RoleType.Lead) || challengeRoles?.roles.find(x => x === RoleType.Member);

  return (
    <SearchChallengeCard
      bannerUri={image}
      member={!!label}
      displayName={name}
      tagline={tagline}
      parentDisplayName={hubDisplayName}
      // matchedTerms={matchedTerms}
      tags={matchedTerms}
      journeyUri={url}
      vision={vision}
    />
  );
};

const useHydrateOpportunityCard = (
  data: SearchResultT<SearchResultOpportunityFragment> | undefined,
  userRoles: UserRolesSearchCardsQuery['rolesUser'] | undefined
) => {
  if (!data?.opportunity) {
    return null;
  }
  const opportunity = data.opportunity;
  const containingChallenge = data.challenge;
  const containingHub = data.hub;
  const context = opportunity.context;
  const tagline = context?.tagline || '';
  const image = getVisualBanner(context?.visuals);
  const name = opportunity.displayName;
  const matchedTerms = data?.terms ?? [];
  const challengeNameId = containingChallenge.nameID;
  const challengeDisplayName = containingChallenge.displayName;
  const hubId = containingHub.id;
  const hubNameID = containingHub.nameID;
  const nameID = opportunity.nameID;
  const vision = opportunity.context?.vision || '';

  const url = buildOpportunityUrl(hubNameID, challengeNameId, nameID);

  const opportunityRoles = userRoles?.hubs.find(x => x.id === hubId)?.opportunities.find(x => x.id === data?.id);

  const label =
    opportunityRoles?.roles.find(x => x === RoleType.Lead) || opportunityRoles?.roles.find(x => x === RoleType.Member);

  return (
    <SearchOpportunityCard
      bannerUri={image}
      member={!!label}
      displayName={name}
      tagline={tagline}
      parentDisplayName={challengeDisplayName}
      // matchedTerms={matchedTerms}
      tags={matchedTerms}
      journeyUri={url}
      vision={vision}
    />
  );
};

interface HydratedCardGetter {
  (): null | JSX.Element;
}

interface UseHydrateCardProvided {
  hydrateUserCard: HydratedCardGetter;
  hydrateOrganizationCard: HydratedCardGetter;
  hydrateHubCard: HydratedCardGetter;
  hydrateChallengeCard: HydratedCardGetter;
  hydrateOpportunityCard: HydratedCardGetter;
}

export const useHydrateCard = (result: SearchResultMetaType | undefined): UseHydrateCardProvided => {
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
    userRoles
  );
  const hydrateChallengeCard = () => hydrateChallengeCardResult;

  const hydrateOpportunityCardResult = useHydrateOpportunityCard(
    result as SearchResultT<SearchResultOpportunityFragment>,
    userRoles
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
