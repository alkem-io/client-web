import { WithId } from '../../../types/WithId';
import { ContributorCardProps } from '../../../components/composite/common/cards/ContributorCard/ContributorCard';
import { useMemo } from 'react';
import { buildOrganizationUrl, buildUserProfileUrl } from '../../../utils/urlBuilders';
import { COUNTRIES_BY_CODE } from '../../../models/constants';
import { getVisualAvatar } from '../../../utils/visuals.utils';
import {
  DashboardContributingOrganizationFragment,
  DashboardContributingUserFragment,
} from '../../../models/graphql-schema';
import { EntityDashboardContributors } from '../EntityDashboardContributorsSection/Types';

interface CommunityContributors {
  memberUsers?: DashboardContributingUserFragment[];
  memberOrganizations?: DashboardContributingOrganizationFragment[];
  leadUsers?: DashboardContributingUserFragment[];
  leadOrganizations?: DashboardContributingOrganizationFragment[];
}

const DEFAULT_MEMBERS_LIMIT = 12;

interface Options {
  membersLimit?: number;
  memberUsersLimit?: number;
  memberOrganizationsLimit?: number;
  leadUsersLimit?: number;
  leadOrganizationsLimit?: number;
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

const mapOrganizationToContributorCardProps = (
  org: DashboardContributingOrganizationFragment
): WithId<ContributorCardProps> => ({
  id: org.id,
  avatar: getVisualAvatar(org.profile?.avatar) || '',
  displayName: org.displayName,
  url: buildOrganizationUrl(org.nameID),
});

const useCommunityContributorsAsCardProps = (
  community: CommunityContributors | undefined,
  options: Options = {}
): EntityDashboardContributors => {
  const {
    membersLimit = DEFAULT_MEMBERS_LIMIT,
    memberUsersLimit = membersLimit,
    memberOrganizationsLimit = membersLimit,
    leadUsersLimit = membersLimit,
    leadOrganizationsLimit = membersLimit,
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

  const memberOrganizationsCount = community?.leadOrganizations?.length;

  const leadUsers: WithId<ContributorCardProps>[] | undefined = useMemo(
    () => community?.leadUsers?.slice(0, leadUsersLimit).map(mapUserToContributorCardProps),
    [community?.leadUsers, leadUsersLimit]
  );

  const leadUsersCount = community?.leadUsers?.length;

  const leadOrganizations: WithId<ContributorCardProps>[] | undefined = useMemo(
    () => community?.leadOrganizations?.slice(0, leadOrganizationsLimit).map(mapOrganizationToContributorCardProps),
    [community?.leadOrganizations, leadOrganizationsLimit]
  );

  const leadOrganizationsCount = community?.leadOrganizations?.length;

  return {
    memberUsers,
    memberUsersCount,
    memberOrganizations,
    memberOrganizationsCount,
    leadUsers,
    leadUsersCount,
    leadOrganizations,
    leadOrganizationsCount,
  };
};

export default useCommunityContributorsAsCardProps;
