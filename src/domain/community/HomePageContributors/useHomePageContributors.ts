import { useMemo } from 'react';
import { shuffle } from 'lodash';
import { useUserContext } from '../../../hooks';
import { useContributingUsersQuery, useOrganizationsListQuery } from '../../../hooks/generated/graphql';
import useServerMetadata from '../../../hooks/useServerMetadata';
import { COUNTRIES_BY_CODE } from '../../../models/constants';
import getActivityCount from '../../activity/utils/getActivityCount';
import { buildOrganizationUrl, buildUserProfileUrl } from '../../../common/utils/urlBuilders';
import { getVisualAvatar } from '../../../common/utils/visuals.utils';
import { ContributorCardProps } from '../../../common/components/composite/common/cards/ContributorCard/ContributorCard';
import { WithId } from '../../../types/WithId';

const MAX_USERS_TO_SHOW = 12;
const MAX_ORGANIZATIONS_TO_SHOW = 12;

const useHomePageContributors = () => {
  const { user, isAuthenticated } = useUserContext();

  const { data: usersData, loading } = useContributingUsersQuery({
    fetchPolicy: 'cache-and-network',
    skip: !isAuthenticated,
  });

  const { data: organizationsData, loading: loadingOrganizations } = useOrganizationsListQuery({
    fetchPolicy: 'cache-and-network',
    variables: {
      limit: MAX_ORGANIZATIONS_TO_SHOW,
      shuffle: true,
    },
  });

  const users = useMemo(() => {
    const array = usersData?.usersPaginated.users ?? [];
    return shuffle(array).slice(0, MAX_USERS_TO_SHOW);
  }, [usersData]);
  const organizations = useMemo(() => organizationsData?.organizations || [], [organizationsData]);

  const contributors: WithId<ContributorCardProps>[] = useMemo(
    () =>
      users.map(user => ({
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
    [users]
  );

  const contributingOrganizations: WithId<ContributorCardProps>[] = useMemo(
    () =>
      organizations.map(org => ({
        id: org.id,
        avatar: getVisualAvatar(org?.profile?.avatar) || '',
        displayName: org.displayName,
        url: buildOrganizationUrl(org.nameID),
      })),
    [organizations]
  );

  const { activity } = useServerMetadata();
  const [usersCount, organizationsCount] = [
    getActivityCount(activity, 'users'),
    getActivityCount(activity, 'organizations'),
  ];

  return {
    entities: {
      usersCount,
      users: contributors,
      user,
      organizationsCount,
      organizations: contributingOrganizations,
    },
    loading: { users: loading, organizations: loadingOrganizations },
  };
};

export default useHomePageContributors;
