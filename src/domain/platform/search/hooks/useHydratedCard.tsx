import {
  SearchResultCardFragment,
  SearchResultChallengeFragment,
  SearchResultHubFragment,
  SearchResultOpportunityFragment,
  SearchResultOrganizationFragment,
  SearchResultUserFragment,
  UserRolesSearchCardsQuery,
} from '../../../../core/apollo/generated/graphql-schema';
import React from 'react';
import {
  buildAspectUrl,
  buildCalloutUrl,
  buildChallengeUrl,
  buildHubUrl,
  buildOpportunityUrl,
  buildOrganizationUrl,
  buildUserProfileUrl,
} from '../../../../common/utils/urlBuilders';
import { SearchChallengeCard, SearchHubCard, SearchOpportunityCard } from '../../../shared/components/search-cards';
import { RoleType } from '../../../community/contributor/user/constants/RoleType';
import { getVisualBanner } from '../../../common/visual/utils/visuals.utils';
import { useUserRolesSearchCardsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useUserContext } from '../../../community/contributor/user/hooks/useUserContext';
import { SearchResultMetaType, SearchResultT } from '../SearchView';
import { SearchContributionCardCard } from '../../../shared/components/search-cards/SearchContributionCardCard';
import { OpportunityIcon } from '../../../challenge/opportunity/icon/OpportunityIcon';
import { ChallengeIcon } from '../../../challenge/challenge/icon/ChallengeIcon';
import { HubIcon } from '../../../challenge/hub/icon/HubIcon';
import ContributingUserCard from '../../../community/contributor/user/ContributingUserCard/ContributingUserCard';
import CardContent from '../../../../core/ui/card/CardContent';
import ContributingOrganizationCard from '../../../community/contributor/organization/ContributingOrganizationCard/ContributingOrganizationCard';
import CardParentJourneySegment from '../../../challenge/common/HubChildJourneyCard/CardParentJourneySegment';
import { CalloutIcon } from '../../../collaboration/callout/icon/CalloutIcon';

const _hydrateUserCard = (data: SearchResultT<SearchResultUserFragment>) => {
  if (!data?.user) {
    return null;
  }
  const user = data.user;
  const profile = user.profile;
  const avatarUri = profile?.avatar?.uri;
  const { country, city } = profile?.location ?? {};
  const url = buildUserProfileUrl(user.nameID);
  const tags = profile?.tagsets?.[0]?.tags ?? [];

  return (
    <ContributingUserCard
      id={user.id}
      displayName={user.displayName}
      description={profile?.description}
      avatarUri={avatarUri}
      city={city}
      country={country}
      tags={tags}
      userUri={url}
      matchedTerms={data.terms}
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
  const profile = data.organization.profile;
  const avatarUri = profile?.avatar?.uri;
  const { country, city } = profile?.location ?? {};
  const url = buildOrganizationUrl(organization.nameID);
  const tags = profile.tagsets?.[0]?.tags ?? [];

  const organizationRoles = userRoles?.organizations.find(x => x.id === organization.id);
  const isMember = organizationRoles?.roles.some(x => x === RoleType.Associate);

  return (
    <ContributingOrganizationCard
      displayName={organization.displayName}
      description={profile.description}
      avatarUri={avatarUri}
      city={city}
      country={country}
      tags={tags}
      userUri={url}
      member={isMember}
      matchedTerms={data.terms}
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
  const url = buildHubUrl(hub.nameID);
  const tags = data.terms; // TODO: add terms field to journey card
  const vision = hub.context?.vision || '';

  const hubRoles = userRoles?.hubs.find(x => x.id === data.id);
  const isMember =
    hubRoles?.roles.find(x => x === RoleType.Lead) ||
    hubRoles?.roles.find(x => x === RoleType.Host) ||
    hubRoles?.roles.find(x => x === RoleType.Member);

  return (
    <SearchHubCard
      bannerUri={image}
      member={!!isMember}
      displayName={name}
      tagline={tagline}
      journeyUri={url}
      tags={tags}
      matchedTerms
      vision={vision}
      locked={!hub.authorization?.anonymousReadAccess}
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

  const isMember =
    challengeRoles?.roles.find(x => x === RoleType.Lead) || challengeRoles?.roles.find(x => x === RoleType.Member);

  return (
    <SearchChallengeCard
      bannerUri={image}
      member={!!isMember}
      displayName={name}
      tagline={tagline}
      tags={matchedTerms}
      matchedTerms
      journeyUri={url}
      vision={vision}
      locked={!challenge.authorization?.anonymousReadAccess}
      parentSegment={
        <CardParentJourneySegment
          iconComponent={HubIcon}
          parentJourneyUri={buildHubUrl(hubNameId)}
          locked={!containingHub.authorization?.anonymousReadAccess}
        >
          {hubDisplayName}
        </CardParentJourneySegment>
      }
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
  const vision = opportunity.context?.vision ?? '';

  const url = buildOpportunityUrl(hubNameID, challengeNameId, nameID);

  const opportunityRoles = userRoles?.hubs.find(x => x.id === hubId)?.opportunities.find(x => x.id === data?.id);

  const isMember =
    opportunityRoles?.roles.find(x => x === RoleType.Lead) || opportunityRoles?.roles.find(x => x === RoleType.Member);

  return (
    <SearchOpportunityCard
      bannerUri={image}
      member={!!isMember}
      displayName={name}
      tagline={tagline}
      tags={matchedTerms}
      matchedTerms
      journeyUri={url}
      vision={vision}
      locked={!opportunity.authorization?.anonymousReadAccess}
      parentSegment={
        <CardParentJourneySegment
          iconComponent={ChallengeIcon}
          parentJourneyUri={buildChallengeUrl(hubNameID, challengeNameId)}
          locked={!containingChallenge.authorization?.anonymousReadAccess}
        >
          {challengeDisplayName}
        </CardParentJourneySegment>
      }
    />
  );
};

const getContributionParentInformation = (data: SearchResultT<SearchResultCardFragment>) => {
  if (data.opportunity?.nameID && data.challenge?.nameID) {
    return {
      icon: OpportunityIcon,
      displayName: data.opportunity?.displayName,
      locked: !data.opportunity?.authorization?.anonymousReadAccess,
      url: buildOpportunityUrl(data.hub.nameID, data.challenge?.nameID, data.opportunity?.nameID),
    };
  } else if (data.challenge?.nameID) {
    return {
      icon: ChallengeIcon,
      displayName: data.challenge?.displayName,
      locked: !data.challenge?.authorization?.anonymousReadAccess,
      url: buildChallengeUrl(data.hub.nameID, data.challenge?.nameID),
    };
  } else {
    return {
      icon: HubIcon,
      displayName: data.hub.displayName,
      locked: !data.hub?.authorization?.anonymousReadAccess,
      url: buildHubUrl(data.hub.nameID),
    };
  }
};

const _hydrateContributionCard = (data: SearchResultT<SearchResultCardFragment> | undefined) => {
  if (!data?.card) {
    return null;
  }

  const card = data.card;
  const url = buildAspectUrl(data.callout.nameID, card.nameID, {
    hubNameId: data.hub.nameID,
    challengeNameId: data.challenge?.nameID,
    opportunityNameId: data.opportunity?.nameID,
  });
  const parent = getContributionParentInformation(data);

  return (
    <SearchContributionCardCard
      name={card.displayName}
      author={card.createdBy?.displayName}
      description={card.profile?.description}
      tags={card.profile?.tagset?.tags}
      createdDate={card.createdDate}
      commentsCount={card.comments?.commentsCount}
      matchedTerms={data.terms}
      url={url}
      parentSegment={
        <CardContent>
          <CardParentJourneySegment
            iconComponent={CalloutIcon}
            parentJourneyUri={buildCalloutUrl(data.callout.nameID, {
              hubNameId: data.hub.nameID,
              challengeNameId: data.challenge?.nameID,
              opportunityNameId: data.opportunity?.nameID,
            })}
          >
            {data.callout.displayName}
          </CardParentJourneySegment>
          <CardParentJourneySegment iconComponent={parent.icon} parentJourneyUri={parent.url} locked={parent.locked}>
            {parent.displayName}
          </CardParentJourneySegment>
        </CardContent>
      }
    />
  );
};

interface HydratedCardGetter {
  (): null | JSX.Element;
}

interface UseHydrateCardProvided {
  hydrateUserCard: HydratedCardGetter;
  hydrateOrganizationCard: HydratedCardGetter;
  hydrateContributionCard: HydratedCardGetter;
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

  // Contributor cards:
  const hydrateUserCard = () => _hydrateUserCard(result as SearchResultT<SearchResultUserFragment>);

  const hydrateOrganizationCard = () =>
    _hydrateOrganizationCard(result as SearchResultT<SearchResultOrganizationFragment>, userRoles);

  // Contribution cards:
  const hydrateContributionCard = () => _hydrateContributionCard(result as SearchResultT<SearchResultCardFragment>);

  // Journey cards:
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
    hydrateHubCard,
    hydrateChallengeCard,
    hydrateContributionCard,
    hydrateOpportunityCard,
    hydrateUserCard,
    hydrateOrganizationCard,
  };
};
