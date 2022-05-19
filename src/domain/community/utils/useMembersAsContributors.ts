import { WithId } from '../../../types/WithId';
import { ContributorCardProps } from '../../../components/composite/common/cards/ContributorCard/ContributorCard';
import { useMemo } from 'react';
import { buildOrganizationUrl, buildUserProfileUrl } from '../../../utils/urlBuilders';
import { COUNTRIES_BY_CODE } from '../../../models/constants';
import { getVisualAvatar } from '../../../utils/visuals.utils';
import { EntityDashboardContributorsSectionProps } from '../EntityDashboardContributorsSection/EntityDashboardContributorsSection';

interface Community {
  memberUsers?:
    | Array<{
        id: string;
        displayName: string;
        nameID: string;
        profile?:
          | {
              id: string;
              location?: { __typename?: 'Location'; city: string; country: string } | undefined;
              avatar?: { __typename?: 'Visual'; id: string; uri: string } | undefined;
              tagsets?: Array<{ __typename?: 'Tagset'; id: string; tags: Array<string> }> | undefined;
            }
          | undefined;
      }>
    | undefined;
  memberOrganizations?:
    | Array<{
        id: string;
        displayName: string;
        nameID: string;
        profile: {
          id: string;
          avatar?: { __typename?: 'Visual'; id: string; uri: string; name: string } | undefined;
        };
      }>
    | undefined;
}

const DEFAULT_MEMBERS_LIMIT = 12;

interface Options {
  membersLimit?: number;
  memberUsersLimit?: number;
  memberOrganizationsLimit?: number;
}

const useMembersAsContributors = (
  community: Community | undefined,
  options: Options = {}
): EntityDashboardContributorsSectionProps => {
  const {
    membersLimit = DEFAULT_MEMBERS_LIMIT,
    memberUsersLimit = membersLimit,
    memberOrganizationsLimit = membersLimit,
  } = options;

  const memberUsers: WithId<ContributorCardProps>[] | undefined = useMemo(
    () =>
      community?.memberUsers?.slice(0, memberUsersLimit).map(user => ({
        id: user.id,
        avatar: user.profile?.avatar?.uri || '',
        displayName: user.displayName,
        url: buildUserProfileUrl(user.nameID),
        tooltip: {
          tags: user.profile?.tagsets?.flatMap(x => x.tags.map(t => t)) || [],
          city: user.profile?.location?.city,
          country: COUNTRIES_BY_CODE[user.profile?.location?.country || ''],
        },
      })),
    [community?.memberUsers, memberUsersLimit]
  );

  const memberUsersCount = community?.memberUsers?.length;

  const memberOrganizations: WithId<ContributorCardProps>[] | undefined = useMemo(
    () =>
      community?.memberOrganizations?.slice(0, memberOrganizationsLimit).map(org => ({
        id: org.id,
        avatar: getVisualAvatar(org.profile?.avatar) || '',
        displayName: org.displayName,
        url: buildOrganizationUrl(org.nameID),
      })),
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

export default useMembersAsContributors;
