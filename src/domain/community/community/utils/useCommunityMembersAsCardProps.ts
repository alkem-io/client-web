import { WithId } from '../../../../types/WithId';
import { ContributorCardProps } from '../../contributor/ContributorCardSquare/ContributorCardSquare';
import { UserCardProps } from '../../../../common/components/composite/common/cards';
import { useMemo } from 'react';
import { buildOrganizationUrl, buildUserProfileUrl } from '../../../../common/utils/urlBuilders';
import { COUNTRIES_BY_CODE } from '../../../common/location/countries.constants';
import { getVisualAvatar } from '../../../common/visual/utils/visuals.utils';
import {
  DashboardContributingOrganizationFragment,
  DashboardContributingUserFragment,
} from '../../../../core/apollo/generated/graphql-schema';
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
  memberUsersCount?: number;
  memberOrganizationsCount?: number;
}

const mapUserToContributorCardProps = (user: DashboardContributingUserFragment): WithId<ContributorCardProps> => ({
  id: user.id,
  avatar: user.profile.visual?.uri || '',
  displayName: user.profile.displayName,
  url: buildUserProfileUrl(user.nameID),
  tooltip: {
    tags: user.profile.tagsets?.flatMap(x => x.tags.map(t => t)) || [],
    city: user.profile.location?.city,
    country: COUNTRIES_BY_CODE[user.profile.location?.country || ''],
  },
  isContactable: user.isContactable,
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
  isContactable: user.isContactable ?? true,
});

const mapOrganizationToContributorCardProps = (
  org: DashboardContributingOrganizationFragment
): WithId<ContributorCardProps> => ({
  id: org.id,
  avatar: getVisualAvatar(org.profile.visual) || '',
  displayName: org.profile.displayName,
  url: buildOrganizationUrl(org.nameID),
  isContactable: true,
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

  const memberUsersCount = options.memberUsersCount ?? community?.memberUsers?.length;

  const memberOrganizations: WithId<ContributorCardProps>[] | undefined = useMemo(
    () => community?.memberOrganizations?.slice(0, memberOrganizationsLimit).map(mapOrganizationToContributorCardProps),
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
