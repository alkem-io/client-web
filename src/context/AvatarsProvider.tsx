import React, { FC } from 'react';
import Loading from '../components/core/Loading';
import { User, useUserAvatarsQuery } from '../generated/graphql';

interface AvatarsProviderProps {
  users?: User[];
  count?: number;
  children: (users: User[]) => React.ReactNode;
}

export const AvatarsProvider: FC<AvatarsProviderProps> = ({ users = [], count = 20, children }) => {
  const targetCount = Math.min(users.length, count);
  const targetIds = users.slice(0, targetCount).map(x => x.id);
  const { data, loading } = useUserAvatarsQuery({ variables: { ids: targetIds } });

  if (loading) {
    return <Loading text={'Loading avatars ...'} />;
  }

  if (!data) {
    return <></>;
  }

  return <>{children(data?.usersById as User[])}</>;
};
