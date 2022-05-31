import { UserCardFragment } from '../../../models/graphql-schema';
import { SearchableUserCardProps } from '../../../views/community/CommunityPageView';
import { getUserCardRoleNameKey } from '../../../hooks';
import { buildUserProfileUrl } from '../../../utils/urlBuilders';
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

    const users = getUserCardRoleNameKey(data, resourceId);

    return users.map(({ roleNameKey, ...user }) => ({
      id: user.id,
      roleName: t(roleNameKey) as string,
      tags: user?.profile?.tagsets?.flatMap(x => x.tags),
      displayName: user.displayName,
      avatarSrc: user?.profile?.avatar?.uri,
      city: user.profile?.location?.city,
      country: user.profile?.location?.country,
      url: buildUserProfileUrl(user.nameID),
    }));
  }, [data, resourceId]);
};

export default useUserCardProps;
