import {
  CommunityMembershipStatus,
  SearchResultChallengeFragment,
  SearchResultOpportunityFragment,
  SearchResultOrganizationFragment,
  SearchResultPostFragment,
  SearchResultSpaceFragment,
  SearchResultUserFragment,
  UserRolesSearchCardsQuery,
} from '../../../../core/apollo/generated/graphql-schema';
import React from 'react';
import {
  buildCalloutUrl,
  buildChallengeUrl,
  buildOpportunityUrl,
  buildOrganizationUrl,
  buildPostUrl,
  buildSpaceUrl,
  buildUserProfileUrl,
} from '../../../../main/routing/urlBuilders';
import { SearchChallengeCard, SearchOpportunityCard, SearchSpaceCard } from '../../../shared/components/search-cards';
import { RoleType } from '../../../community/user/constants/RoleType';
import { getVisualByType } from '../../../common/visual/utils/visuals.utils';
import { useUserRolesSearchCardsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { useUserContext } from '../../../community/user/hooks/useUserContext';
import { SearchResultMetaType, SearchResultT } from '../../../../main/search/SearchView';
import { SearchContributionCardCard } from '../../../shared/components/search-cards/SearchContributionPostCard';
import { OpportunityIcon } from '../../../journey/opportunity/icon/OpportunityIcon';
import { ChallengeIcon } from '../../../journey/challenge/icon/ChallengeIcon';
import { SpaceIcon } from '../../../journey/space/icon/SpaceIcon';
import ContributingUserCard from '../../../community/user/ContributingUserCard/ContributingUserCard';
import CardContent from '../../../../core/ui/card/CardContent';
import ContributingOrganizationCard from '../../../community/contributor/organization/ContributingOrganizationCard/ContributingOrganizationCard';
import CardParentJourneySegment from '../../../journey/common/SpaceChildJourneyCard/CardParentJourneySegment';
import { CalloutIcon } from '../../../collaboration/callout/icon/CalloutIcon';
import { VisualName } from '../../../common/visual/constants/visuals.constants';

const _hydrateUserCard = (data: SearchResultT<SearchResultUserFragment>) => {
  if (!data?.user) {
    return null;
  }
  const user = data.user;
  const profile = user.profile;
  const avatarUri = profile.visual?.uri;
  const { country, city } = profile.location ?? {};
  const url = buildUserProfileUrl(user.nameID);
  const tags = profile.tagsets?.[0]?.tags ?? [];

  return (
    <ContributingUserCard
      id={user.id}
      displayName={user.profile.displayName}
      description={profile.description}
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
  const avatarUri = profile.visual?.uri;
  const { country, city } = profile.location ?? {};
  const url = buildOrganizationUrl(organization.nameID);
  const tags = profile.tagsets?.[0]?.tags ?? [];

  const organizationRoles = userRoles?.organizations.find(x => x.id === organization.id);
  const isMember = organizationRoles?.roles.some(x => x === RoleType.Associate);

  return (
    <ContributingOrganizationCard
      displayName={organization.profile.displayName}
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

const _hydrateSpaceCard = (data: SearchResultT<SearchResultSpaceFragment>) => {
  if (!data?.space) {
    return null;
  }
  const space = data.space;
  const tagline = space.profile?.tagline || '';
  const name = space.profile.displayName;
  const url = buildSpaceUrl(space.nameID);
  const tags = data.terms; // TODO: add terms field to journey card
  const vision = space.context?.vision || '';

  const isMember = space.community?.myMembershipStatus === CommunityMembershipStatus.Member;

  return (
    <SearchSpaceCard
      banner={getVisualByType(VisualName.CARD, space.profile.visuals)}
      member={isMember}
      displayName={name}
      tagline={tagline}
      journeyUri={url}
      tags={tags}
      matchedTerms
      vision={vision}
      locked={!space.authorization?.anonymousReadAccess}
      spaceVisibility={space.license.visibility}
    />
  );
};

const useHydrateChallengeCard = (data: SearchResultT<SearchResultChallengeFragment> | undefined) => {
  if (!data?.challenge || !data?.space) {
    return null;
  }
  const challenge = data.challenge;
  const containingSpace = data.space;
  const tagline = challenge.profile.tagline || '';
  const name = challenge.profile.displayName;
  const matchedTerms = data?.terms ?? [];
  const spaceNameId = containingSpace.nameID;
  const spaceDisplayName = containingSpace.profile.displayName;
  const vision = challenge.context?.vision || '';

  const nameID = challenge.nameID;

  const url = buildChallengeUrl(spaceNameId, nameID);

  const isMember = challenge.community?.myMembershipStatus === CommunityMembershipStatus.Member;

  return (
    <SearchChallengeCard
      banner={getVisualByType(VisualName.CARD, challenge.profile.visuals)}
      member={isMember}
      displayName={name}
      tagline={tagline}
      tags={matchedTerms}
      matchedTerms
      journeyUri={url}
      vision={vision}
      locked={!challenge.authorization?.anonymousReadAccess}
      parentSegment={
        <CardParentJourneySegment
          iconComponent={SpaceIcon}
          parentJourneyUri={buildSpaceUrl(spaceNameId)}
          locked={!containingSpace.authorization?.anonymousReadAccess}
        >
          {spaceDisplayName}
        </CardParentJourneySegment>
      }
      spaceVisibility={containingSpace.license.visibility}
    />
  );
};

const useHydrateOpportunityCard = (data: SearchResultT<SearchResultOpportunityFragment> | undefined) => {
  if (!data?.opportunity) {
    return null;
  }
  const opportunity = data.opportunity;
  const containingChallenge = data.challenge;
  const containingSpace = data.space;
  const tagline = opportunity.profile.tagline || '';
  const name = opportunity.profile.displayName;
  const matchedTerms = data?.terms ?? [];
  const challengeNameId = containingChallenge.nameID;
  const challengeDisplayName = containingChallenge.profile.displayName;
  const spaceNameID = containingSpace.nameID;
  const nameID = opportunity.nameID;
  const vision = opportunity.context?.vision ?? '';

  const url = buildOpportunityUrl(spaceNameID, challengeNameId, nameID);

  const isMember = opportunity.community?.myMembershipStatus === CommunityMembershipStatus.Member;

  return (
    <SearchOpportunityCard
      banner={getVisualByType(VisualName.CARD, opportunity.profile.visuals)}
      member={isMember}
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
          parentJourneyUri={buildChallengeUrl(spaceNameID, challengeNameId)}
          locked={!containingChallenge.authorization?.anonymousReadAccess}
        >
          {challengeDisplayName}
        </CardParentJourneySegment>
      }
      spaceVisibility={containingSpace.license.visibility}
    />
  );
};

const getContributionParentInformation = (data: SearchResultT<SearchResultPostFragment>) => {
  if (data.opportunity?.nameID && data.challenge?.nameID) {
    return {
      icon: OpportunityIcon,
      displayName: data.opportunity?.profile.displayName,
      locked: !data.opportunity?.authorization?.anonymousReadAccess,
      url: buildOpportunityUrl(data.space.nameID, data.challenge?.nameID, data.opportunity?.nameID),
    };
  } else if (data.challenge?.nameID) {
    return {
      icon: ChallengeIcon,
      displayName: data.challenge?.profile.displayName,
      locked: !data.challenge?.authorization?.anonymousReadAccess,
      url: buildChallengeUrl(data.space.nameID, data.challenge?.nameID),
    };
  } else {
    return {
      icon: SpaceIcon,
      displayName: data.space.profile.displayName,
      locked: !data.space?.authorization?.anonymousReadAccess,
      url: buildSpaceUrl(data.space.nameID),
    };
  }
};

const _hydrateContributionPost = (data: SearchResultT<SearchResultPostFragment> | undefined) => {
  if (!data?.post) {
    return null;
  }

  const card = data.post;
  const url = buildPostUrl(data.callout.nameID, card.nameID, {
    spaceNameId: data.space.nameID,
    challengeNameId: data.challenge?.nameID,
    opportunityNameId: data.opportunity?.nameID,
  });
  const parent = getContributionParentInformation(data);

  return (
    <SearchContributionCardCard
      name={card.profile.displayName}
      author={card.createdBy?.profile.displayName}
      description={card.profile.description}
      tags={card.profile.tagset?.tags}
      createdDate={card.createdDate}
      commentsCount={card.comments?.messagesCount}
      matchedTerms={data.terms}
      url={url}
      parentSegment={
        <CardContent>
          <CardParentJourneySegment
            iconComponent={CalloutIcon}
            parentJourneyUri={buildCalloutUrl(data.callout.nameID, {
              spaceNameId: data.space.nameID,
              challengeNameId: data.challenge?.nameID,
              opportunityNameId: data.opportunity?.nameID,
            })}
          >
            {data.callout.framing.profile.displayName}
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
  hydrateSpaceCard: HydratedCardGetter;
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
  const hydrateContributionCard = () => _hydrateContributionPost(result as SearchResultT<SearchResultPostFragment>);

  // Journey cards:
  const hydrateSpaceCard = () => _hydrateSpaceCard(result as SearchResultT<SearchResultSpaceFragment>);

  const hydrateChallengeCardResult = useHydrateChallengeCard(result as SearchResultT<SearchResultChallengeFragment>);
  const hydrateChallengeCard = () => hydrateChallengeCardResult;

  const hydrateOpportunityCardResult = useHydrateOpportunityCard(
    result as SearchResultT<SearchResultOpportunityFragment>
  );
  const hydrateOpportunityCard = () => hydrateOpportunityCardResult;

  return {
    hydrateSpaceCard,
    hydrateChallengeCard,
    hydrateContributionCard,
    hydrateOpportunityCard,
    hydrateUserCard,
    hydrateOrganizationCard,
  };
};
