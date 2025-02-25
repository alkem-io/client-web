import { useSubspacePendingMembershipInfoQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  CommunityMembershipStatus,
  SpaceLevel,
  SubspacePendingMembershipInfoFragment,
} from '@/core/apollo/generated/graphql-schema';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import React, { FC, PropsWithChildren, useMemo } from 'react';

interface SubspacePermissions {
  canUpdate: boolean;
  canCreate: boolean;
  canCreateSubspace: boolean;
  canReadCommunity: boolean;
  contextPrivileges: AuthorizationPrivilege[];
}

interface SubspaceContextProps {
  subspace?: SubspacePendingMembershipInfoFragment;
  subspaceId: string;
  level: SpaceLevel;
  communityId: string;
  roleSetId: string;
  loading: boolean;
  permissions: SubspacePermissions;
  profile: SubspacePendingMembershipInfoFragment['profile'];
  myMembershipStatus: CommunityMembershipStatus | undefined;
}

export const SubspaceContext = React.createContext<SubspaceContextProps>({
  loading: true,
  level: SpaceLevel.L1,
  subspaceId: '',
  communityId: '',
  roleSetId: '',
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

interface SubspaceProviderProps extends PropsWithChildren {}

const SubspaceProvider: FC<SubspaceProviderProps> = ({ children }) => {
  const { spaceId, loading: urlResolverLoading } = useUrlResolver();

  const { data, loading } = useSubspacePendingMembershipInfoQuery({
    variables: { subspaceId: spaceId! },
    errorPolicy: 'all',
    skip: !spaceId,
  });

  const subspace = data?.lookup.space;
  const communityId = subspace?.community?.id ?? '';
  const roleSetId = subspace?.community?.roleSet?.id ?? '';

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
        subspace,
        level: subspace?.level || SpaceLevel.L1,
        subspaceId: spaceId ?? '',
        communityId,
        roleSetId,
        permissions,
        profile,
        loading: loading || urlResolverLoading,
        myMembershipStatus: subspace?.community?.roleSet?.myMembershipStatus,
      }}
    >
      {children}
    </SubspaceContext.Provider>
  );
};

export default SubspaceProvider;
