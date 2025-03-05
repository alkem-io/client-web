import {
  CommunityMembershipStatus,
  SearchResultOrganizationFragment,
  SearchResultPostFragment,
  SearchResultSpaceFragment,
  SearchResultType,
  SearchResultUserFragment,
  SpaceLevel,
  SpacePrivacyMode,
  UserRolesSearchCardsQuery,
} from '@/core/apollo/generated/graphql-schema';
import { RoleType } from '@/domain/community/user/constants/RoleType';
import { getVisualByType } from '@/domain/common/visual/utils/visuals.utils';
import { useUserRolesSearchCardsQuery } from '@/core/apollo/generated/apollo-hooks';
import { useUserContext } from '@/domain/community/user/hooks/useUserContext';
import { TypedSearchResult } from '../SearchView';
import { SearchContributionCardCard } from '@/domain/shared/components/search-cards/SearchContributionPostCard';
import { SubspaceIcon } from '@/domain/journey/subspace/icon/SubspaceIcon';
import { SpaceIcon } from '@/domain/journey/space/icon/SpaceIcon';
import ContributingUserCard from '@/domain/community/user/ContributingUserCard/ContributingUserCard';
import CardContent from '@/core/ui/card/CardContent';
import ContributingOrganizationCard from '@/domain/community/contributor/organization/ContributingOrganizationCard/ContributingOrganizationCard';
import CardParentJourneySegment from '@/domain/journey/common/SpaceChildJourneyCard/CardParentJourneySegment';
import { CalloutIcon } from '@/domain/collaboration/callout/icon/CalloutIcon';
import { VisualName } from '@/domain/common/visual/constants/visuals.constants';
import SearchBaseJourneyCard from '@/domain/shared/components/search-cards/base/SearchBaseJourneyCard';
import { spaceLevelIcon } from '@/domain/shared/components/SpaceIcon/SpaceIcon';
import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';

const hydrateUserCard = (data: TypedSearchResult<SearchResultType.User, SearchResultUserFragment>) => {
  const user = data.user;
  const profile = user.profile;
  const avatarUri = profile.visual?.uri;
  const { country, city } = profile.location ?? {};
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
      userUri={user.profile.url}
      matchedTerms={data.terms}
      isContactable={user.isContactable}
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
  const url = organization.profile.url;
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

const hydrateSpaceCard = (
  data: TypedSearchResult<SearchResultType.Space | SearchResultType.Subspace, SearchResultSpaceFragment>
) => {
  const space = data.space;
  const spaceProfile = space.about.profile;
  const tagline = spaceProfile?.tagline ?? '';
  const name = spaceProfile.displayName;
  const tags = data.terms; // TODO: add terms field to journey card
  const vision = space.about.why ?? '';

  const isMember = space.community?.roleSet?.myMembershipStatus === CommunityMembershipStatus.Member;

  const parentSegment = (
    data: TypedSearchResult<SearchResultType.Space | SearchResultType.Subspace, SearchResultSpaceFragment>
  ) => {
    if (!data.parentSpace) {
      return null;
    }

    const parentIcon = data.parentSpace.level === SpaceLevel.L0 ? SpaceIcon : SubspaceIcon;

    return (
      <CardParentJourneySegment
        iconComponent={parentIcon}
        parentJourneyUri={data.parentSpace?.about.profile.url ?? ''}
        locked={data.parentSpace?.settings.privacy?.mode === SpacePrivacyMode.Private}
      >
        {data.parentSpace?.about.profile.displayName}
      </CardParentJourneySegment>
    );
  };

  return (
    <SearchBaseJourneyCard
      spaceLevel={space.level}
      banner={getVisualByType(VisualName.CARD, spaceProfile.visuals)}
      member={isMember}
      displayName={name}
      tagline={tagline}
      journeyUri={spaceProfile.url}
      tags={tags}
      matchedTerms
      vision={vision}
      locked={space.settings.privacy?.mode === SpacePrivacyMode.Private}
      spaceVisibility={space.visibility}
      parentSegment={parentSegment(data)}
    />
  );
};

interface ContributionParentInformation {
  displayName: string;
  locked: boolean;
  url: string;
  icon: ComponentType<SvgIconProps>;
}

const getContributionParentInformation = (
  data: TypedSearchResult<SearchResultType.Post, SearchResultPostFragment>
): ContributionParentInformation => {
  return {
    displayName: data.space.about.profile.displayName,
    locked: data.space?.settings.privacy?.mode === SpacePrivacyMode.Private,
    url: data.space.about.profile.url,
    icon: spaceLevelIcon[data.space.level] ?? SpaceIcon,
  };
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
  hydrateSpaceCard: HydratedCardGetter<
    TypedSearchResult<SearchResultType.Space | SearchResultType.Subspace, SearchResultSpaceFragment>
  >;
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
