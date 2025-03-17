import { useSpaceAboutDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { SpaceAboutFullModel } from '@/domain/space/about/model/spaceAboutFull.model';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import React, { FC, PropsWithChildren, useMemo } from 'react';

interface SubspacePermissions {
  canUpdate: boolean;
  canCreate: boolean;
  canCreateSubspace: boolean;
  canRead: boolean;
}

interface SubspaceContextProps {
  subspace: {
    id: string;
    level: SpaceLevel;
    about: SpaceAboutFullModel;
    authorization?: {
      myPrivileges: AuthorizationPrivilege[];
    };
  };
  loading: boolean;
  permissions: SubspacePermissions;
}

const defaultValue: SubspaceContextProps = {
  loading: true,
  subspace: {
    id: '',
    level: SpaceLevel.L1,
    about: {
      id: '',
      profile: {
        id: '',
        displayName: '',
        avatar: undefined,
        banner: undefined,
        cardBanner: undefined,
        tagline: '',
        url: '',
      },
      who: '',
      why: '',
      membership: {
        myMembershipStatus: undefined,
        roleSetID: '',
      },
      isContentPublic: true,
    },
  },
  permissions: {
    canUpdate: false,
    canCreate: false,
    canCreateSubspace: false,
    canRead: false,
  },
};

export const SubspaceContext = React.createContext<SubspaceContextProps>(defaultValue);

interface SubspaceProviderProps extends PropsWithChildren {}

const SubspaceProvider: FC<SubspaceProviderProps> = ({ children }) => {
  const { spaceId, loading: urlResolverLoading } = useUrlResolver();

  const { data, loading } = useSpaceAboutDetailsQuery({
    variables: { spaceId: spaceId! },
    errorPolicy: 'all',
    skip: !spaceId,
  });

  const subspaceData = data?.lookup.space;

  const myPrivileges = useMemo(
    () => subspaceData?.authorization?.myPrivileges ?? [],
    [subspaceData?.authorization?.myPrivileges]
  );

  const permissions = useMemo<SubspacePermissions>(
    () => ({
      canUpdate: myPrivileges.includes(AuthorizationPrivilege.Update),
      canCreate: myPrivileges.includes(AuthorizationPrivilege.Create),
      canCreateSubspace: myPrivileges.includes(AuthorizationPrivilege.CreateSubspace),
      canRead: myPrivileges.includes(AuthorizationPrivilege.Read),
      contextPrivileges: subspaceData?.about.authorization?.myPrivileges ?? [],
    }),
    [myPrivileges, subspaceData]
  );

  const subspace = useMemo(() => {
    const about: SpaceAboutFullModel = {
      id: subspaceData?.about.id ?? '',
      profile: {
        id: subspaceData?.about.profile.id ?? '',
        displayName: subspaceData?.about.profile.displayName || '',
        description: subspaceData?.about.profile.description,
        tagset: subspaceData?.about.profile.tagset,
        avatar: subspaceData?.about.profile.avatar,
        banner: subspaceData?.about.profile.banner,
        cardBanner: subspaceData?.about.profile.cardBanner,
        tagline: subspaceData?.about.profile.tagline || '',
        references: subspaceData?.about.profile.references ?? [],
        location: subspaceData?.about.profile.location,
        url: subspaceData?.about.profile.url ?? '',
      },
      who: subspaceData?.about.who ?? '',
      why: subspaceData?.about.why ?? '',
      isContentPublic: subspaceData?.about.isContentPublic ?? true,
      membership: {
        myMembershipStatus: subspaceData?.about.membership.myMembershipStatus,
      },
    };

    return {
      id: subspaceData?.id ?? '',
      level: subspaceData?.level ?? SpaceLevel.L1,
      about,
    };
  }, [subspaceData]);

  let state = {
    subspace,
    permissions,
    loading: loading || urlResolverLoading,
  };

  // don't provide space L0 as subspace
  if (subspaceData?.level === SpaceLevel.L0) {
    state = defaultValue;
  }

  return <SubspaceContext.Provider value={state}>{children}</SubspaceContext.Provider>;
};

export default SubspaceProvider;
