import { WithId } from '../../../../core/utils/WithId';
import { ContributorCardSquareProps } from '../../contributor/ContributorCardSquare/ContributorCardSquare';
import { UserCardProps } from '../../user/userCard/UserCard';
import { useMemo } from 'react';
import { buildOrganizationUrl, buildUserProfileUrl } from '../../../../main/routing/urlBuilders';
import { COUNTRIES_BY_CODE } from '../../../common/location/countries.constants';
import { getVisualAvatar } from '../../../common/visual/utils/visuals.utils';
import {
  DashboardContributingOrganizationFragment,
  DashboardContributingUserFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { EntityDashboardContributors } from '../EntityDashboardContributorsSection/Types';
import { ContributorType } from '../../contributor/CommunityContributorsBlockWide/CommunityContributorsBlockWideContent';

interface CommunityMembers {
  memberUsers?: DashboardContributingUserFragment[];
  memberOrganizations?: DashboardContributingOrganizationFragment[];
}

const DEFAULT_MEMBERS_LIMIT = 12;

interface Options {
  membersLimit?: number;
  memberUsersLimit?: number;
  memberOrganizationsLimit?: number;
  memberUsersCount?: number;
  memberOrganizationsCount?: number;
}

const mapUserToContributorCardProps = (
  user: DashboardContributingUserFragment
): WithId<ContributorCardSquareProps> => ({
  id: user.id,
  avatar: user.profile.visual?.uri ?? '',
  displayName: user.profile.displayName,
  url: buildUserProfileUrl(user.nameID),
  tooltip: {
    tags: user.profile.tagsets?.flatMap(x => x.tags.map(t => t)) ?? [],
    city: user.profile.location?.city,
    country: user.profile.location?.country ? COUNTRIES_BY_CODE[user.profile.location.country] : undefined,
  },
  isContactable: user.isContactable,
  contributorType: ContributorType.People,
});

export const mapUserCardPropsToContributorCardProps = (user: UserCardProps): WithId<ContributorCardSquareProps> => ({
  id: user.id ?? '',
  avatar: user.avatarSrc ?? '',
  displayName: user.displayName ?? '',
  url: user.url ?? '',
  tooltip: {
    tags: user.tags ?? [],
    city: user.city,
    country: user.country,
  },
  isContactable: user.isContactable ?? true,
  contributorType: ContributorType.People,
});

const mapOrganizationToContributorCardProps = (
  org: DashboardContributingOrganizationFragment
): WithId<ContributorCardSquareProps> => ({
  id: org.id,
  avatar: getVisualAvatar(org.profile.visual) ?? '',
  displayName: org.profile.displayName,
  url: buildOrganizationUrl(org.nameID),
  tooltip: {
    tags: org.profile.tagsets?.flatMap(x => x.tags.map(t => t)) ?? [],
  },
  isContactable: true,
  contributorType: ContributorType.Organizations,
});

const applyLimit = <Item>(items: Item[] | undefined, limit?: number): Item[] | undefined =>
  limit && items ? items.slice(0, limit) : items;

const useCommunityMembersAsCardProps = (
  community: CommunityMembers | undefined,
  options: Options = {}
): EntityDashboardContributors => {
  const {
    membersLimit = DEFAULT_MEMBERS_LIMIT,
    memberUsersLimit = membersLimit,
    memberOrganizationsLimit = membersLimit,
  } = options;

  const memberUsers: WithId<ContributorCardSquareProps>[] | undefined = useMemo(
    () => applyLimit(community?.memberUsers, memberUsersLimit)?.map(mapUserToContributorCardProps),
    [community?.memberUsers, memberUsersLimit]
  );

  const memberUsersCount = options.memberUsersCount ?? community?.memberUsers?.length;

  const memberOrganizations: WithId<ContributorCardSquareProps>[] | undefined = useMemo(
    () =>
      applyLimit(community?.memberOrganizations, memberOrganizationsLimit)?.map(mapOrganizationToContributorCardProps),
    [community?.memberOrganizations, memberOrganizationsLimit]
  );

  const memberOrganizationsCount = options.memberOrganizationsCount ?? community?.memberOrganizations?.length;

  return {
    memberUsers,
    memberUsersCount,
    memberOrganizations,
    memberOrganizationsCount,
  };
};

export default useCommunityMembersAsCardProps;
