import React, { FC } from 'react';
import { useMeQuery } from '../generated/graphql';
import { UserMetadata, useUserMetadataWrapper } from '../hooks/useUserMetadataWrapper';
import { User } from '../types/graphql-schema';

export interface UserContextContract {
  user: UserMetadata | undefined;
  loading: boolean;
}
const UserContext = React.createContext<UserContextContract>({
  user: undefined,
  loading: true,
});

const UserProvider: FC<{}> = ({ children }) => {
  const { data, loading: profileLoading } = useMeQuery({ errorPolicy: 'all' });
  const { me } = data || {};
  const loading = profileLoading; //|| status === 'authenticating' || status === 'refreshing';
  const wrapper = useUserMetadataWrapper();

  return (
    <UserContext.Provider
      value={{
        user: wrapper(me as User),
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, UserContext };
