import React, { FC } from 'react';
import { useMembershipQuery, useMeQuery } from '../generated/graphql';
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
  const wrapper = useUserMetadataWrapper();

  const { data: membershipData, loading: loadingMembership } = useMembershipQuery({
    variables: { input: { userID: me?.id || '' } },
    errorPolicy: 'ignore',
  });

  const loading = profileLoading || loadingMembership;
  return (
    <UserContext.Provider
      value={{
        user: wrapper(me as User, membershipData?.membership),
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, UserContext };
