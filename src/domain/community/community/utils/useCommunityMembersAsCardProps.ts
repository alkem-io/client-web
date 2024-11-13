import { ContributorCardSquareProps } from '../../contributor/ContributorCardSquare/ContributorCardSquare';
import { UserCardProps } from '../../user/userCard/UserCard';
import { useMemo } from 'react';
import { COUNTRIES_BY_CODE } from '../../../common/location/countries.constants';
import { CommunityContributorType } from '@core/apollo/generated/graphql-schema';
import { ContributorViewProps, EntityDashboardContributors } from '../EntityDashboardContributorsSection/Types';

export interface RoleSetMembers {
  memberUsers?: ContributorViewProps[];
  memberOrganizations?: ContributorViewProps[];
}

const DEFAULT_MEMBERS_LIMIT = 12;

interface Options {
  membersLimit?: number;
  memberUsersLimit?: number;
  memberOrganizationsLimit?: number;
  memberUsersCount?: number;
  memberOrganizationsCount?: number;
}

const mapUserToContributorCardProps = (user: ContributorViewProps): ContributorCardSquareProps => ({
  id: user.id,
  avatar: user.profile.avatar?.uri,
  displayName: user.profile.displayName,
  url: user.profile.url,
  tooltip: {
    tags: user.profile.tagsets?.flatMap(x => x.tags.map(t => t)) ?? [],
    city: user.profile.location?.city,
    country: user.profile.location?.country ? COUNTRIES_BY_CODE[user.profile.location.country] : undefined,
  },
  isContactable: user.isContactable,
  contributorType: CommunityContributorType.User,
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
  contributorType: CommunityContributorType.User,
});

const mapOrganizationToContributorCardProps = (org: ContributorViewProps): ContributorCardSquareProps => ({
  id: org.id,
  avatar: org.profile.avatar?.uri,
  displayName: org.profile.displayName,
  url: org.profile.url,
  tooltip: {
    tags: org.profile.tagsets?.flatMap(x => x.tags.map(t => t)) ?? [],
  },
  isContactable: true,
  contributorType: CommunityContributorType.Organization,
});

const applyLimit = <Item>(items: Item[] | undefined, limit?: number): Item[] | undefined =>
  limit && items ? items.slice(0, limit) : items;

const useCommunityMembersAsCardProps = (
  community: RoleSetMembers | undefined,
  options: Options = {}
): EntityDashboardContributors => {
  const {
    membersLimit = DEFAULT_MEMBERS_LIMIT,
    memberUsersLimit = membersLimit,
    memberOrganizationsLimit = membersLimit,
  } = options;

  const memberUsers: ContributorCardSquareProps[] | undefined = useMemo(
    () => applyLimit(community?.memberUsers, memberUsersLimit)?.map(mapUserToContributorCardProps),
    [community?.memberUsers, memberUsersLimit]
  );

  const memberUsersCount = options.memberUsersCount ?? community?.memberUsers?.length;

  const memberOrganizations: ContributorCardSquareProps[] | undefined = useMemo(
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
