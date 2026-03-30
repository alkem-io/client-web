import { ActorType } from '@/core/apollo/generated/graphql-schema';
import type { WithId } from '@/core/utils/WithId';
import { COUNTRIES_BY_CODE } from '@/domain/common/location/countries.constants';
import type { ContributorCardSquareProps } from '@/domain/community/contributor/ContributorCardSquare/ContributorCardSquare';
import type { UserCardProps } from '@/domain/community/user/userCard/UserCard';
import type { ContributorViewModel } from './ContributorViewModel';

interface RoleSetMembers {
  memberUsers?: ContributorViewModel[];
  memberOrganizations?: ContributorViewModel[];
}

const DEFAULT_MEMBERS_LIMIT = 12;

type Options = {
  membersLimit?: number;
  memberUsersLimit?: number;
  memberOrganizationsLimit?: number;
  memberUsersCount?: number;
  memberOrganizationsCount?: number;
};

const mapUserToContributorCardProps = (user: ContributorViewModel): ContributorCardSquareProps => ({
  id: user.id,
  avatar: user.profile?.avatar?.uri,
  displayName: user.profile?.displayName ?? '',
  url: user.profile?.url ?? '',
  tooltip: {
    tags: user.profile?.tagsets?.flatMap(x => x.tags.map(t => t)) ?? [],
    city: user.profile?.location?.city,
    country: user.profile?.location?.country ? COUNTRIES_BY_CODE[user.profile.location.country] : undefined,
  },
  isContactable: user.isContactable,
  contributorType: ActorType.User,
});

export const mapUserCardPropsToContributorCardProps = (user: UserCardProps): ContributorCardSquareProps => ({
  id: user.id ?? '',
  avatar: user.avatarSrc,
  displayName: user.displayName ?? '',
  url: user.url ?? '',
  tooltip: {
    tags: user.tags ?? [],
    city: user.city,
    country: user.country,
  },
  isContactable: user.isContactable ?? true,
  contributorType: ActorType.User,
});

const mapOrganizationToContributorCardProps = (org: ContributorViewModel): ContributorCardSquareProps => ({
  id: org.id,
  avatar: org.profile?.avatar?.uri,
  displayName: org.profile?.displayName ?? '',
  url: org.profile?.url ?? '',
  tooltip: {
    tags: org.profile?.tagsets?.flatMap(x => x.tags.map(t => t)) ?? [],
  },
  isContactable: true,
  contributorType: ActorType.Organization,
});

const applyLimit = <Item>(items: Item[] | undefined, limit?: number): Item[] | undefined =>
  limit && items ? items.slice(0, limit) : items;

export interface EntityDashboardContributors {
  memberUsers: WithId<ContributorCardSquareProps>[] | undefined;
  memberUsersCount: number | undefined;
  memberOrganizations: WithId<ContributorCardSquareProps>[] | undefined;
  memberOrganizationsCount: number | undefined;
}

const useCommunityMembersAsCardProps = (
  community: RoleSetMembers | undefined,
  options: Options = {}
): EntityDashboardContributors => {
  const {
    membersLimit = DEFAULT_MEMBERS_LIMIT,
    memberUsersLimit = membersLimit,
    memberOrganizationsLimit = membersLimit,
  } = options;

  const memberUsers: ContributorCardSquareProps[] | undefined = applyLimit(
    community?.memberUsers,
    memberUsersLimit
  )?.map(mapUserToContributorCardProps);

  const memberUsersCount = options.memberUsersCount ?? community?.memberUsers?.length;

  const memberOrganizations: ContributorCardSquareProps[] | undefined = applyLimit(
    community?.memberOrganizations,
    memberOrganizationsLimit
  )?.map(mapOrganizationToContributorCardProps);

  const memberOrganizationsCount = options.memberOrganizationsCount ?? community?.memberOrganizations?.length;

  return {
    memberUsers,
    memberUsersCount,
    memberOrganizations,
    memberOrganizationsCount,
  };
};

export default useCommunityMembersAsCardProps;
