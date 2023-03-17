import { useMemo } from 'react';
import { shuffle } from 'lodash';
import { useUserContext } from '../../contributor/user';
import {
  useContributingUsersQuery,
  useContributingOrganizationsQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import { COUNTRIES_BY_CODE } from '../../../common/location/countries.constants';
import { buildOrganizationUrl, buildUserProfileUrl } from '../../../../common/utils/urlBuilders';
import { getVisualAvatar } from '../../../common/visual/utils/visuals.utils';
import { ContributorCardProps } from '../../../../common/components/composite/common/cards/ContributorCard/ContributorCard';
import { WithId } from '../../../../types/WithId';
import { AuthorizationCredential } from '../../../../core/apollo/generated/graphql-schema';

const MAX_ITEMS_TO_SHOW = 16;
const HALF_MAX_ITEMS_TO_SHOW = MAX_ITEMS_TO_SHOW / 2; // If logged in, show half users half organizations

const useHomePageContributors = () => {
  const { isAuthenticated, loading: loadingUserContext } = useUserContext();

  const organizationsCountLimit = isAuthenticated ? HALF_MAX_ITEMS_TO_SHOW : MAX_ITEMS_TO_SHOW;

  const { data: usersData, loading: loadingUsers } = useContributingUsersQuery({
    variables: {
      limit: HALF_MAX_ITEMS_TO_SHOW,
      shuffle: true,
      filterCredentials: [AuthorizationCredential.HubHost, AuthorizationCredential.ChallengeLead],
    },
    skip: loadingUserContext || !isAuthenticated,
  });

  const { data: organizationsData, loading: loadingOrganizations } = useContributingOrganizationsQuery({
    variables: {
      limit: organizationsCountLimit,
      shuffle: true,
      filterCredentials: [AuthorizationCredential.HubHost, AuthorizationCredential.ChallengeLead],
    },
    skip: loadingUserContext,
  });

  const contributors: WithId<ContributorCardProps>[] = useMemo(() => {
    const users = usersData?.users ?? [];
    const usersCards = users.map<ContributorCardProps>(user => ({
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
    }));

    const organizations = organizationsData?.organizations ?? [];
    const organizationsCards = organizations.map<ContributorCardProps>(org => ({
      id: org.id,
      avatar: getVisualAvatar(org?.profile.visual) || '',
      displayName: org.profile.displayName,
      url: buildOrganizationUrl(org.nameID),
    }));

    return shuffle([...usersCards, ...organizationsCards]);
  }, [usersData, organizationsData]);

  return {
    entities: {
      contributors,
    },
    loading: loadingUserContext || loadingOrganizations || loadingUsers,
  };
};

export default useHomePageContributors;
