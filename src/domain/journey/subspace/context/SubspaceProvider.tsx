import React, { FC, useMemo } from 'react';
import {
  AuthorizationPrivilege,
  CommunityMembershipStatus,
  SubspaceInfoFragment,
} from '../../../../core/apollo/generated/graphql-schema';
import { useRouteResolver } from '../../../../main/routing/resolvers/RouteResolver';
import { useSubspaceInfoQuery } from '../../../../core/apollo/generated/apollo-hooks';

interface SubspacePermissions {
  canUpdate: boolean;
  canCreate: boolean;
  canCreateSubspace: boolean;
  canReadCommunity: boolean;
  contextPrivileges: AuthorizationPrivilege[];
}

interface SubspaceContextProps {
  subspace?: SubspaceInfoFragment;
  subspaceId: string;
  communityId: string;
  loading: boolean;
  permissions: SubspacePermissions;
  profile: SubspaceInfoFragment['profile'];
  myMembershipStatus: CommunityMembershipStatus | undefined;
}

const SubspaceContext = React.createContext<SubspaceContextProps>({
  loading: true,
  subspaceId: '',
  communityId: '',
  permissions: {
    canUpdate: false,
    canCreate: false,
    canCreateSubspace: false,
    canReadCommunity: false,
    contextPrivileges: [],
  },
  profile: {
    id: '',
    displayName: '',
    visuals: [],
    tagline: '',
    url: '',
  },
  myMembershipStatus: undefined,
});

interface SubspaceProviderProps {}

const SubspaceProvider: FC<SubspaceProviderProps> = ({ children }) => {
  const { subSpaceId: challengeId } = useRouteResolver();

  const { data, loading } = useSubspaceInfoQuery({
    variables: { subspaceId: challengeId! },
    errorPolicy: 'all',
    skip: !challengeId,
  });

  const subspace = data?.space;
  const communityId = subspace?.community?.id ?? '';

  const myPrivileges = useMemo(
    () => subspace?.authorization?.myPrivileges ?? [],
    [subspace?.authorization?.myPrivileges]
  );
  const canReadCommunity = (subspace?.community?.authorization?.myPrivileges ?? []).includes(
    AuthorizationPrivilege.Read
  );

  const permissions = useMemo<SubspacePermissions>(
    () => ({
      canUpdate: myPrivileges.includes(AuthorizationPrivilege.Update),
      canCreate: myPrivileges.includes(AuthorizationPrivilege.Create),
      canCreateSubspace: myPrivileges.includes(AuthorizationPrivilege.CreateSubspace),
      canReadCommunity,
      contextPrivileges: subspace?.context?.authorization?.myPrivileges ?? [],
    }),
    [myPrivileges, subspace, canReadCommunity]
  );

  const profile = useMemo(() => {
    return {
      id: subspace?.profile.id ?? '',
      displayName: subspace?.profile.displayName || '',
      description: subspace?.profile.description,
      tagset: subspace?.profile.tagset,
      visuals: subspace?.profile.visuals ?? [],
      tagline: subspace?.profile.tagline || '',
      references: subspace?.profile.references ?? [],
      location: subspace?.profile.location,
      url: subspace?.profile.url ?? '',
    };
  }, [subspace?.profile]);

  return (
    <SubspaceContext.Provider
      value={{
        subspace: subspace,
        subspaceId: challengeId ?? '',
        communityId,
        permissions,
        profile,
        loading,
        myMembershipStatus: subspace?.community?.myMembershipStatus,
      }}
    >
      {children}
    </SubspaceContext.Provider>
  );
};

export { SubspaceProvider as ChallengeProvider, SubspaceContext };
