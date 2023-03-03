import { UserCardFragment } from '../../../../core/apollo/generated/graphql-schema';
import { SearchableUserCardProps } from '../CommunityUpdates/CommunityUpdatesDashboardSection';
import { addUserCardRoleNameKey } from '../../contributor/user/hooks/useUserCardRoleName';
import { buildUserProfileUrl } from '../../../../common/utils/urlBuilders';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

const useUserCardProps = (
  data: UserCardFragment[] | undefined,
  resourceId: string | undefined
): SearchableUserCardProps[] | undefined => {
  const { t } = useTranslation();

  return useMemo(() => {
    if (!data || !resourceId) {
      return;
    }

    const users = addUserCardRoleNameKey(data, resourceId);

    return users.map(({ roleNameKey, ...user }) => ({
      id: user.id,
      roleName: t(roleNameKey) as string,
      tags: user?.profile?.tagsets?.flatMap(x => x.tags),
      displayName: user.profile.displayName,
      avatarSrc: user?.profile.visual?.uri,
      city: user.profile?.location?.city,
      country: user.profile?.location?.country,
      url: buildUserProfileUrl(user.nameID),
      isContactable: user.isContactable,
    }));
  }, [data, resourceId, t]);
};

export default useUserCardProps;
