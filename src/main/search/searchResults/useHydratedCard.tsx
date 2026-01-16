import {
  SearchResultOrganizationFragment,
  SearchResultPostFragment,
  SearchResultSpaceFragment,
  SearchResultType,
  SearchResultUserFragment,
  SearchResultMemoFragment,
  SearchResultWhiteboardFragment,
  UserRolesSearchCardsQuery,
  VisualType,
} from '@/core/apollo/generated/graphql-schema';
import { RoleType } from '@/domain/community/user/constants/RoleType';
import { getVisualByType } from '@/domain/common/visual/utils/visuals.utils';
import { useUserRolesSearchCardsQuery } from '@/core/apollo/generated/apollo-hooks';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { TypedSearchResult } from '../SearchView';
import { SearchContributionCardCard } from '@/domain/shared/components/search-cards/SearchContributionPostCard';
import { SearchContributionMemoCard } from '@/domain/shared/components/search-cards/SearchContributionMemoCard';
import { SearchContributionWhiteboardCard } from '@/domain/shared/components/search-cards/SearchContributionWhiteboardCard';
import { SpaceL0Icon } from '@/domain/space/icons/SpaceL0Icon';
import ContributingUserCard from '@/domain/community/user/ContributingUserCard/ContributingUserCard';
import CardContent from '@/core/ui/card/CardContent';
import ContributingOrganizationCard from '@/domain/community/organization/ContributingOrganizationCard/ContributingOrganizationCard';
import CardParentSpaceSegment from '@/domain/space/components/cards/components/CardParentSpaceSegment';
import SpaceCard from '@/domain/space/components/cards/SpaceCard';
import { spaceLevelIcon } from '@/domain/space/icons/SpaceIconByLevel';
import { ComponentType } from 'react';
import { SvgIconProps } from '@mui/material';
import { WhiteboardIcon } from '@/domain/collaboration/whiteboard/icon/WhiteboardIcon';

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
  const tags = space.about.profile.tagset?.tags;

  // Create parentInfo for SpaceCard
  const parentInfo = data.parentSpace
    ? {
        displayName: data.parentSpace.about.profile.displayName,
        url: data.parentSpace.about.profile.url ?? '',
        avatar: data.parentSpace.about.profile.avatar?.uri
          ? {
              id: data.parentSpace.about.profile.avatar.id ?? '',
              uri: data.parentSpace.about.profile.avatar.uri,
              alternativeText: data.parentSpace.about.profile.avatar.alternativeText ?? undefined,
            }
          : undefined,
      }
    : undefined;

  return (
    <SpaceCard
      displayName={name}
      tagline={tagline}
      spaceVisibility={space.visibility}
      level={space.level}
      isPrivate={!space.about.isContentPublic}
      showLeads={false}
      banner={getVisualByType(VisualType.Card, spaceProfile.visuals)}
      spaceUri={spaceProfile.url}
      tags={tags}
      parentInfo={parentInfo}
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
    locked: !data.space?.about.isContentPublic,
    url: data.space.about.profile.url,
    icon: spaceLevelIcon[data.space.level] ?? SpaceL0Icon,
  };
};

const getMemoParentInformation = (
  data: TypedSearchResult<SearchResultType.Memo, SearchResultMemoFragment>
): ContributionParentInformation => {
  return {
    displayName: data.space.about.profile.displayName,
    locked: !data.space?.about.isContentPublic,
    url: data.space.about.profile.url,
    icon: spaceLevelIcon[data.space.level] ?? SpaceL0Icon,
  };
};

const getWhiteboardParentInformation = (
  data: TypedSearchResult<SearchResultType.Whiteboard, SearchResultWhiteboardFragment>
): ContributionParentInformation => {
  return {
    displayName: data.space.about.profile.displayName,
    locked: !data.space?.about.isContentPublic,
    url: data.space.about.profile.url,
    icon: spaceLevelIcon[data.space.level] ?? SpaceL0Icon,
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
          <CardParentSpaceSegment iconComponent={WhiteboardIcon} parentSpaceUri={data.callout.framing.profile.url}>
            {data.callout.framing.profile.displayName}
          </CardParentSpaceSegment>
          <CardParentSpaceSegment iconComponent={parent.icon} parentSpaceUri={parent.url} locked={parent.locked}>
            {parent.displayName}
          </CardParentSpaceSegment>
        </CardContent>
      }
    />
  );
};

const hydrateMemo = (data: TypedSearchResult<SearchResultType.Memo, SearchResultMemoFragment>) => {
  if (!data?.memo) {
    return null;
  }

  const memo = data.memo;
  const parent = getMemoParentInformation(data);

  return (
    <SearchContributionMemoCard
      name={memo.profile.displayName}
      author={memo.createdBy?.profile.displayName}
      description={memo.markdown}
      tags={memo.profile.tagset?.tags}
      createdDate={memo.createdDate}
      matchedTerms={data.terms}
      url={memo.profile.url}
      parentSegment={
        <CardContent>
          <CardParentSpaceSegment iconComponent={WhiteboardIcon} parentSpaceUri={data.callout.framing.profile.url}>
            {data.callout.framing.profile.displayName}
          </CardParentSpaceSegment>
          <CardParentSpaceSegment iconComponent={parent.icon} parentSpaceUri={parent.url} locked={parent.locked}>
            {parent.displayName}
          </CardParentSpaceSegment>
        </CardContent>
      }
    />
  );
};

const hydrateWhiteboard = (data: TypedSearchResult<SearchResultType.Whiteboard, SearchResultWhiteboardFragment>) => {
  if (!data?.whiteboard) {
    return null;
  }

  const whiteboard = data.whiteboard;
  const parent = getWhiteboardParentInformation(data);

  return (
    <SearchContributionWhiteboardCard
      name={whiteboard.profile.displayName}
      author={whiteboard.createdBy?.profile.displayName}
      visual={whiteboard.profile.preview}
      tags={whiteboard.profile.tagset?.tags}
      createdDate={whiteboard.createdDate}
      matchedTerms={data.terms}
      url={whiteboard.profile.url}
      parentSegment={
        <CardContent>
          <CardParentSpaceSegment parentSpaceUri={data.callout.framing.profile.url}>
            {data.callout.framing.profile.displayName}
          </CardParentSpaceSegment>
          <CardParentSpaceSegment iconComponent={parent.icon} parentSpaceUri={parent.url} locked={parent.locked}>
            {parent.displayName}
          </CardParentSpaceSegment>
        </CardContent>
      }
    />
  );
};

interface HydratedCardGetter<Data> {
  (data: Data): null | React.ReactElement;
}

interface UseHydrateCardProvided {
  hydrateUserCard: HydratedCardGetter<TypedSearchResult<SearchResultType.User, SearchResultUserFragment>>;
  hydrateOrganizationCard: HydratedCardGetter<
    TypedSearchResult<SearchResultType.Organization, SearchResultOrganizationFragment>
  >;
  hydrateContributionCard: HydratedCardGetter<TypedSearchResult<SearchResultType.Post, SearchResultPostFragment>>;
  hydrateMemoCard: HydratedCardGetter<TypedSearchResult<SearchResultType.Memo, SearchResultMemoFragment>>;
  hydrateWhiteboardCard: HydratedCardGetter<
    TypedSearchResult<SearchResultType.Whiteboard, SearchResultWhiteboardFragment>
  >;
  hydrateSpaceCard: HydratedCardGetter<
    TypedSearchResult<SearchResultType.Space | SearchResultType.Subspace, SearchResultSpaceFragment>
  >;
}

export const useHydrateCard = (): UseHydrateCardProvided => {
  const { userModel } = useCurrentUserContext();
  const userId = userModel?.id;

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
    hydrateMemoCard: hydrateMemo,
    hydrateWhiteboardCard: hydrateWhiteboard,
    hydrateUserCard,
    hydrateOrganizationCard,
  };
};
