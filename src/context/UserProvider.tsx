import React, { FC } from 'react';
import { useMeQuery } from '../generated/graphql';
import { CredentialResolver, useCredentialsResolver } from '../hooks/useCredentialsResolver';
import { Role } from '../models/Role';
import { AuthorizationCredential, User } from '../types/graphql-schema';

export interface UserContextContract {
  user: UserMetadata | undefined;
  loading: boolean;
}

export interface UserMetadata {
  user: User;
  hasCredentials: (credential: AuthorizationCredential, resourceId?: number) => boolean;
  ofChallenge: (id: string) => boolean;
  isAdmin: boolean;
  roles: Role[];
}

export const toUserMetadata = (user: User | undefined, resolver: CredentialResolver): UserMetadata | undefined => {
  if (!user) {
    return;
  }

  const metadata = {
    user,
    hasCredentials: (credential: AuthorizationCredential, resourceId = -1) =>
      Boolean(user?.agent?.credentials?.findIndex(c => c.type === credential && c.resourceID === resourceId) !== -1),
    ofChallenge: (id: string) => Boolean(user?.agent?.credentials?.findIndex(c => c.resourceID === Number(id)) !== -1),
    isAdmin: false,
    roles:
      user?.agent?.credentials
        ?.map(
          c =>
            ({
              code: c.type,
              type: resolver.toAuthenticationCredentials(c.type),
              name: resolver.toRoleName(resolver.toAuthenticationCredentials(c.type)),
              order: resolver.toRoleOrder(resolver.toAuthenticationCredentials(c.type)),
              resourceId: c.resourceID,
              resource: 'Resource can not be resolved', // TODO [ATS] Resolve the recource name (User group name, challenge, opportunity ...)
            } as Role)
        )
        .sort((a, b) => a.order - b.order) || [],
  };

  metadata.isAdmin = metadata.roles.findIndex(c => c.type === AuthorizationCredential.GlobalAdmin) !== -1;

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
  const resolver = useCredentialsResolver();

  return (
    <UserContext.Provider
      value={{
        user: toUserMetadata(me as User, resolver),
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, UserContext };
