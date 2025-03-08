import { useSpaceAboutBaseQuery, useSpaceTemplatesManagerQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
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
      id: '',
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
  },
  permissions: {
    canRead: false,
    canUpdate: false,
    canCreateSubspaces: false,
    canCreateTemplates: false,
  },
  visibility: SpaceVisibility.Active,
  loading: false,
});

const NO_PRIVILEGES = [];

const SpaceContextProvider = ({ children }: PropsWithChildren) => {
  const { levelZeroSpaceId, loading: urlResolverLoading } = useUrlResolver();
  const spaceId = levelZeroSpaceId ?? '';

  const { data: spaceAboutData, loading: loadingSpaceQuery } = useSpaceAboutBaseQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId,
  });

  const spaceData = spaceAboutData?.lookup.space;
  const spaceNameId = spaceData?.nameID ?? '';
  const visibility = spaceData?.visibility || SpaceVisibility.Active;

  const spacePrivileges = spaceData?.authorization?.myPrivileges ?? NO_PRIVILEGES;

  const { data: templatesManagerData } = useSpaceTemplatesManagerQuery({
    variables: { spaceId },
    skip: !spaceId,
  });
  const canCreateTemplates =
    templatesManagerData?.lookup.space?.templatesManager?.templatesSet?.authorization?.myPrivileges?.includes(
      AuthorizationPrivilege.Create
    ) ?? false;

  const permissions = useMemo<SpacePermissions>(() => {
    return {
      canRead: spacePrivileges.includes(AuthorizationPrivilege.Read),
      canUpdate: spacePrivileges.includes(AuthorizationPrivilege.Update),
      canCreateSubspaces: spacePrivileges.includes(AuthorizationPrivilege.CreateSubspace),
      canCreateTemplates,
    };
  }, [spacePrivileges, canCreateTemplates]);

  const space = useMemo(() => {
    const aboutModel: SpaceAboutLightModel = {
      id: spaceData?.about.id ?? '',
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
