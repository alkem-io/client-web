import React, { FC } from 'react';
import { useMeQuery } from '../generated/graphql';
import { AuthorizationCredential, User } from '../types/graphql-schema';
import { credentialsResolver } from '../utils/credentials-resolver';

export interface UserContextContract {
  user: UserMetadata | undefined;
  loading: boolean;
}

export interface UserMetadata {
  user: User;
  hasCredentials: (credential: AuthorizationCredential, resourceId?: number) => boolean;
  ofChallenge: (id: string) => boolean;
  isAdmin: boolean;
  roles: string[];
}

const wrapUser = (user: User | undefined): UserMetadata | undefined => {
  if (!user) {
    return;
  }

  const metadata = {
    user,
    hasCredentials: (credential: AuthorizationCredential, resourceId = -1) =>
      Boolean(user?.agent?.credentials?.findIndex(c => c.type === credential && c.resourceID === resourceId) !== -1),
    ofChallenge: (id: string) => Boolean(user?.agent?.credentials?.findIndex(c => c.resourceID === Number(id)) !== -1),
    isAdmin: false,
    roles: user?.agent?.credentials?.map(c => credentialsResolver(c.type)) || [],
  };

  metadata.isAdmin = metadata.roles.findIndex(c => c === AuthorizationCredential.GlobalAdmin) !== -1;

  return metadata;
};

const UserContext = React.createContext<UserContextContract>({
  user: undefined,
  loading: true,
});

const UserProvider: FC<{}> = ({ children }) => {
  const { data, loading: profileLoading } = useMeQuery({ errorPolicy: 'all' });
  const { me } = data || {};
  const loading = profileLoading; //|| status === 'authenticating' || status === 'refreshing';

  return (
    <UserContext.Provider
      value={{
        user: wrapUser(me as User),
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, UserContext };
