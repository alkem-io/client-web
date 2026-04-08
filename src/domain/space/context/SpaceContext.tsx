import React, { type PropsWithChildren } from 'react';
import { useSpaceAboutBaseQuery, useSpaceEntitlementsQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  type LicenseEntitlementType,
  SpaceLevel,
  SpaceVisibility,
} from '@/core/apollo/generated/graphql-schema';
import type { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

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
    level: SpaceLevel;
  };
  permissions: SpacePermissions;
  entitlements: LicenseEntitlementType[];
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
        roleSetID: '',
      },
      guidelines: {
        id: '',
      },
    },
    level: SpaceLevel.L0,
  },
  entitlements: [],
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
  const { levelZeroSpaceId, loading: urlResolverLoading } = useUrlResolver();
  const spaceId = levelZeroSpaceId ?? '';

  const { data: spaceAboutData, loading: loadingSpaceQuery } = useSpaceAboutBaseQuery({
    // biome-ignore lint/style/noNonNullAssertion: ensured by skip
    variables: { spaceId: spaceId! },
    skip: !spaceId,
  });

  const spaceData = spaceAboutData?.lookup.space;
  const spaceNameId = spaceData?.nameID ?? '';
  const visibility = spaceData?.visibility || SpaceVisibility.Active;

  const spacePrivileges = spaceData?.authorization?.myPrivileges ?? [];
  const canRead = spacePrivileges.includes(AuthorizationPrivilege.Read);

  const { data: spaceEntitlementsData, loading: loadingSpaceEntitlementsQuery } = useSpaceEntitlementsQuery({
    variables: {
      // biome-ignore lint/style/noNonNullAssertion: ensured by skip
      spaceId: spaceId!,
    },
    skip: !spaceId || !canRead,
  });

  const entitlements = spaceEntitlementsData?.lookup.space?.license?.availableEntitlements ?? [];

  const permissions = (() => {
    return {
      canRead: canRead,
      canUpdate: spacePrivileges.includes(AuthorizationPrivilege.Update),
      canCreateSubspaces: spacePrivileges.includes(AuthorizationPrivilege.CreateSubspace),
      // TODO: This is a shortcut. Instead of accessing the TemplatesManager of a space,
      // 100% of the time, if the user is able to create a subspace they should be able to create a template
      canCreateTemplates: spacePrivileges.includes(AuthorizationPrivilege.CreateSubspace),
    };
  })();

  const space = (() => {
    const aboutModel: SpaceAboutLightModel = {
      authorization: spaceData?.authorization,
      isContentPublic: spaceData?.about.isContentPublic ?? true,
      membership: {
        myMembershipStatus: spaceData?.about.membership.myMembershipStatus,
        roleSetID: spaceData?.about.membership.roleSetID,
        communityID: spaceData?.about.membership.communityID,
      },
      profile: {
        displayName: spaceData?.about.profile.displayName ?? '',
        url: spaceData?.about.profile.url ?? '',
        tagline: spaceData?.about.profile.tagline,
        description: spaceData?.about.profile.description,
        tagset: spaceData?.about.profile.tagset,
        avatar: spaceData?.about.profile.avatar,
        cardBanner: spaceData?.about.profile.cardBanner,
      },
      guidelines: {
        id: spaceData?.about.guidelines?.id ?? '',
      },
    };

    return {
      id: spaceId,
      levelZeroSpaceId: levelZeroSpaceId ?? '',
      nameID: spaceNameId,
      about: aboutModel,
      level: SpaceLevel.L0,
    };
  })();

  const loading = urlResolverLoading || loadingSpaceQuery || loadingSpaceEntitlementsQuery || !spaceId;
  return (
    <SpaceContext
      value={{
        space,
        permissions,
        loading,
        visibility,
        entitlements,
      }}
    >
      {children}
    </SpaceContext>
  );
};

export { SpaceContext, SpaceContextProvider };
