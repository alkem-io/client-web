import React, { FC } from 'react';
import Loading from '@core/ui/loading/Loading';
import { useUserAvatarsQuery } from '@core/apollo/generated/apollo-hooks';
import { User } from '@core/apollo/generated/graphql-schema';

interface UserAvatarsProviderProps {
  users?: Pick<User, 'id'>[];
  count?: number;
  children: (users: User[]) => React.ReactNode;
}

// todo refactor to provide necessary data and pass the loading down
/***
 * @deprecated Must be refactored
 */
export const UserAvatarsProvider: FC<UserAvatarsProviderProps> = ({ users = [], count = 20, children }) => {
  const targetCount = Math.min(users.length, count);
  const targetIds = users.slice(0, targetCount).map(x => x.id);
  const { data, loading } = useUserAvatarsQuery({ variables: { ids: targetIds }, skip: !targetIds.length });

  if (loading) {
    return <Loading text={'Loading avatars ...'} />;
  }

  if (!data) {
    return <>{children([])}</>;
  }

  return <>{children(data?.users as User[])}</>;
};
