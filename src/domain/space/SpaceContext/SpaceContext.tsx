import { useSpaceAboutBaseQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, SpaceLevel, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import React, { PropsWithChildren, useMemo } from 'react';

export interface SpacePermissions {
  canRead: boolean;
  canUpdate: boolean;
  canCreateSubspaces: boolean;
  canCreateTemplates: boolean;
}

interface SpaceContextProps {
  space: {
    id: string;
    levelZeroSpaceId: string;
    nameID: string;
    about: SpaceAboutLightModel;
    collaborationId?: string;
    level: SpaceLevel;
  };
  permissions: SpacePermissions;
  visibility: SpaceVisibility;
  loading: boolean;
}

const SpaceContext = React.createContext<SpaceContextProps>({
  space: {
    id: '',
    nameID: '',
    levelZeroSpaceId: '',
    about: {
      profile: {
        displayName: '',
        url: '',
      },
      isContentPublic: true,
      membership: {
        myMembershipStatus: undefined,
        communityID: '',
      },
    },
    collaborationId: '',
    level: SpaceLevel.L0,
  },
  permissions: {
    canRead: false,
    canUpdate: false,
    canCreateSubspaces: false,
    canCreateTemplates: false,
  },
  visibility: SpaceVisibility.Active,
  loading: true,
});

const SpaceContextProvider = ({ children }: PropsWithChildren) => {
  const { levelZeroSpaceId, loading: urlResolverLoading, collaborationId } = useUrlResolver();
  const spaceId = levelZeroSpaceId ?? '';

  const { data: spaceAboutData, loading: loadingSpaceQuery } = useSpaceAboutBaseQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId,
  });

  const spaceData = spaceAboutData?.lookup.space;
  const spaceNameId = spaceData?.nameID ?? '';
  const visibility = spaceData?.visibility || SpaceVisibility.Active;

  const spacePrivileges = spaceData?.authorization?.myPrivileges ?? [];

  const permissions = useMemo<SpacePermissions>(() => {
    return {
      canRead: spacePrivileges.includes(AuthorizationPrivilege.Read),
      canUpdate: spacePrivileges.includes(AuthorizationPrivilege.Update),
      canCreateSubspaces: spacePrivileges.includes(AuthorizationPrivilege.CreateSubspace),
      // TODO: This is a shortcut. Instead of accessing the TemplatesManager of a space,
      // 100% of the time, if the user is able to create a subspace they should be able to create a template
      canCreateTemplates: spacePrivileges.includes(AuthorizationPrivilege.CreateSubspace),
    };
  }, [spacePrivileges]);

  const space = useMemo(() => {
    const aboutModel: SpaceAboutLightModel = {
      authorization: spaceData?.authorization,
      isContentPublic: spaceData?.about.isContentPublic ?? true,
      membership: {
        myMembershipStatus: spaceData?.about.membership.myMembershipStatus,
      },
      profile: {
        displayName: spaceData?.about.profile.displayName ?? '',
        url: spaceData?.about.profile.url ?? '',
      },
    };

    return {
      id: spaceId,
      levelZeroSpaceId: levelZeroSpaceId ?? '',
      nameID: spaceNameId,
      about: aboutModel,
      collaborationId,
      level: SpaceLevel.L0,
    };
  }, [spaceData]);

  const loading = urlResolverLoading || loadingSpaceQuery;
  return (
    <SpaceContext.Provider
      value={{
        space,
        permissions,
        loading,
        visibility,
      }}
    >
      {children}
    </SpaceContext.Provider>
  );
};

export { SpaceContext, SpaceContextProvider };
