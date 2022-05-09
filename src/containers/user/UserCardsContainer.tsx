import React, { FC } from 'react';
import { UserCardProps } from '../../common/components/composite/common/cards';
import { useUserCardRoleName } from '../../hooks';
import { useUserCardsContainerQuery } from '../../hooks/generated/graphql';
import { COUNTRIES_BY_CODE } from '../../models/constants';
import { ContainerChildProps } from '../../models/container';
import { User } from '../../models/graphql-schema';
import { buildUserProfileUrl } from '../../common/utils/urlBuilders';

interface UserCardsContainerEntities {
  users: UserCardProps[];
}

interface UserCardsContainerState {
  loading: boolean;
}

interface UserCardsContainerProps extends ContainerChildProps<UserCardsContainerEntities, {}, UserCardsContainerState> {
  userIDs: string[];
  resourceId: string;
}

export const UserCardsContainer: FC<UserCardsContainerProps> = ({ children, userIDs, resourceId }) => {
  const { data, loading } = useUserCardsContainerQuery({ variables: { ids: userIDs } });
  const usersWithRoles = useUserCardRoleName((data?.usersById || []) as User[], resourceId);

  const users =
    data?.usersById.map(
      u =>
        ({
          tags: u.profile?.tagsets?.flatMap(x => x.tags),
          displayName: u.displayName,
          avatarSrc: u.profile?.avatar?.uri,
          url: buildUserProfileUrl(u.nameID),
          city: u.profile?.location?.city || '',
          country: COUNTRIES_BY_CODE[u.profile?.location?.country || ''],
          roleName: usersWithRoles.find(x => x.id === u.id)?.roleName,
        } as UserCardProps)
    ) || [];

  return (
    <>
      {children(
        {
          users,
        },
        { loading },
        {}
      )}
    </>
  );
};
export default UserCardsContainer;
