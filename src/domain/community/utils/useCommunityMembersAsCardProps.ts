import { WithId } from '../../../types/WithId';
import { ContributorCardProps } from '../../../common/components/composite/common/cards/ContributorCard/ContributorCard';
import { UserCardProps } from '../../../common/components/composite/common/cards';
import { useMemo } from 'react';
import { buildOrganizationUrl, buildUserProfileUrl } from '../../../common/utils/urlBuilders';
import { COUNTRIES_BY_CODE } from '../../../models/constants';
import { getVisualAvatar } from '../../../common/utils/visuals.utils';
import {
  DashboardContributingOrganizationFragment,
  DashboardContributingUserFragment,
} from '../../../models/graphql-schema';
import { EntityDashboardContributors } from '../EntityDashboardContributorsSection/Types';

interface CommunityMembers {
  memberUsers?: DashboardContributingUserFragment[];
  memberOrganizations?: DashboardContributingOrganizationFragment[];
}

const DEFAULT_MEMBERS_LIMIT = 12;

interface Options {
  membersLimit?: number;
  memberUsersLimit?: number;
  memberOrganizationsLimit?: number;
}

const mapUserToContributorCardProps = (user: DashboardContributingUserFragment): WithId<ContributorCardProps> => ({
  id: user.id,
  avatar: user.profile?.avatar?.uri || '',
  displayName: user.displayName,
  url: buildUserProfileUrl(user.nameID),
  tooltip: {
    tags: user.profile?.tagsets?.flatMap(x => x.tags.map(t => t)) || [],
    city: user.profile?.location?.city,
    country: COUNTRIES_BY_CODE[user.profile?.location?.country || ''],
  },
});

export const mapUserCardPropsToContributorCardProps = (user: UserCardProps): WithId<ContributorCardProps> => ({
  id: user.id || '',
  avatar: user.avatarSrc || '',
  displayName: user.displayName || '',
  url: user.url || '',
  tooltip: {
    tags: user.tags || [],
    city: user.city,
    country: user.country,
  },
});

const mapOrganizationToContributorCardProps = (
  org: DashboardContributingOrganizationFragment
): WithId<ContributorCardProps> => ({
  id: org.id,
  avatar: getVisualAvatar(org.profile?.avatar) || '',
  displayName: org.displayName,
  url: buildOrganizationUrl(org.nameID),
});

const useCommunityMembersAsCardProps = (
  community: CommunityMembers | undefined,
  options: Options = {}
): EntityDashboardContributors => {
  const {
    membersLimit = DEFAULT_MEMBERS_LIMIT,
    memberUsersLimit = membersLimit,
    memberOrganizationsLimit = membersLimit,
  } = options;

  const memberUsers: WithId<ContributorCardProps>[] | undefined = useMemo(
    () => community?.memberUsers?.slice(0, memberUsersLimit).map(mapUserToContributorCardProps),
    [community?.memberUsers, memberUsersLimit]
  );

  const memberUsersCount = community?.memberUsers?.length;

  const memberOrganizations: WithId<ContributorCardProps>[] | undefined = useMemo(
    () => community?.memberOrganizations?.slice(0, memberOrganizationsLimit).map(mapOrganizationToContributorCardProps),
    [community?.memberOrganizations, memberOrganizationsLimit]
  );

  const memberOrganizationsCount = community?.memberOrganizations?.length;

  return {
    memberUsers,
    memberUsersCount,
    memberOrganizations,
    memberOrganizationsCount,
  };
};

export default useCommunityMembersAsCardProps;
