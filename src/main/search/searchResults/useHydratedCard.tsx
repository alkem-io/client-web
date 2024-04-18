import { SvgIconComponent } from '@mui/icons-material';
import {
  CommunityMembershipStatus,
  SearchResultOrganizationFragment,
  SearchResultPostFragment,
  SearchResultSpaceFragment,
  SearchResultType,
  SearchResultUserFragment,
  SpaceType,
  UserRolesSearchCardsQuery,
} from '../../../core/apollo/generated/graphql-schema';
import React from 'react';
import { buildOrganizationUrl, buildUserProfileUrl } from '../../routing/urlBuilders';
import { SearchSpaceCard } from '../../../domain/shared/components/search-cards';
import { RoleType } from '../../../domain/community/user/constants/RoleType';
import { getVisualByType } from '../../../domain/common/visual/utils/visuals.utils';
import { useUserRolesSearchCardsQuery } from '../../../core/apollo/generated/apollo-hooks';
import { useUserContext } from '../../../domain/community/user/hooks/useUserContext';
import { TypedSearchResult } from '../SearchView';
import { SearchContributionCardCard } from '../../../domain/shared/components/search-cards/SearchContributionPostCard';
import { OpportunityIcon } from '../../../domain/journey/opportunity/icon/OpportunityIcon';
import { ChallengeIcon } from '../../../domain/journey/subspace/icon/ChallengeIcon';
import { SpaceIcon } from '../../../domain/journey/space/icon/SpaceIcon';
import ContributingUserCard from '../../../domain/community/user/ContributingUserCard/ContributingUserCard';
import CardContent from '../../../core/ui/card/CardContent';
import ContributingOrganizationCard from '../../../domain/community/contributor/organization/ContributingOrganizationCard/ContributingOrganizationCard';
import CardParentJourneySegment from '../../../domain/journey/common/SpaceChildJourneyCard/CardParentJourneySegment';
import { CalloutIcon } from '../../../domain/collaboration/callout/icon/CalloutIcon';
import { VisualName } from '../../../domain/common/visual/constants/visuals.constants';

const hydrateUserCard = (data: TypedSearchResult<SearchResultType.User, SearchResultUserFragment>) => {
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
  data: TypedSearchResult<SearchResultType.Organization, SearchResultOrganizationFragment>,
  userRoles: UserRolesSearchCardsQuery['rolesUser'] | undefined
) => {
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

const hydrateSpaceCard = (data: TypedSearchResult<SearchResultType.Space, SearchResultSpaceFragment>) => {
  const space = data.space;
  const tagline = space.profile?.tagline ?? '';
  const name = space.profile.displayName;
  const tags = data.terms; // TODO: add terms field to journey card
  const vision = space.context?.vision ?? '';

  const isMember = space.community?.myMembershipStatus === CommunityMembershipStatus.Member;

  return (
    <SearchSpaceCard
      banner={getVisualByType(VisualName.CARD, space.profile.visuals)}
      member={isMember}
      displayName={name}
      tagline={tagline}
      journeyUri={space.profile.url}
      tags={tags}
      matchedTerms
      vision={vision}
      locked={!space.authorization?.anonymousReadAccess}
      spaceVisibility={space.account.license.visibility}
    />
  );
};

const getContributionParentInformation = (data: TypedSearchResult<SearchResultType.Post, SearchResultPostFragment>) => {
  const info = {
    displayName: data.space.profile.displayName,
    locked: !data.space?.authorization?.anonymousReadAccess,
    url: data.space.profile.url,
    icon: SpaceIcon,
  };

  if (data.space.type === SpaceType.Opportunity) {
    info.icon = OpportunityIcon;
  } else if (data.space.type === SpaceType.Challenge) {
    info.icon = ChallengeIcon as SvgIconComponent;
  } else if (data.space.type === SpaceType.Space) {
    info.icon = SpaceIcon;
  }

  return info;
};

const hydrateContributionPost = (data: TypedSearchResult<SearchResultType.Post, SearchResultPostFragment>) => {
  if (!data?.post) {
    return null;
  }

  const card = data.post;

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
      url={data.post.profile.url}
      parentSegment={
        <CardContent>
          <CardParentJourneySegment iconComponent={CalloutIcon} parentJourneyUri={data.callout.framing.profile.url}>
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

interface HydratedCardGetter<Data> {
  (data: Data): null | JSX.Element;
}

interface UseHydrateCardProvided {
  hydrateUserCard: HydratedCardGetter<TypedSearchResult<SearchResultType.User, SearchResultUserFragment>>;
  hydrateOrganizationCard: HydratedCardGetter<
    TypedSearchResult<SearchResultType.Organization, SearchResultOrganizationFragment>
  >;
  hydrateContributionCard: HydratedCardGetter<TypedSearchResult<SearchResultType.Post, SearchResultPostFragment>>;
  hydrateSpaceCard: HydratedCardGetter<TypedSearchResult<SearchResultType.Space, SearchResultSpaceFragment>>;
}

export const useHydrateCard = (): UseHydrateCardProvided => {
  const { user: userMetadata } = useUserContext();
  const userId = userMetadata?.user?.id;

  const { data: rolesData } = useUserRolesSearchCardsQuery({
    variables: {
      userId: userId!,
    },
    skip: !userId,
  });

  const userRoles = rolesData?.rolesUser;

  const hydrateOrganizationCard = (
    result: TypedSearchResult<SearchResultType.Organization, SearchResultOrganizationFragment>
  ) => _hydrateOrganizationCard(result, userRoles);

  return {
    hydrateSpaceCard,
    hydrateContributionCard: hydrateContributionPost,
    hydrateUserCard,
    hydrateOrganizationCard,
  };
};
