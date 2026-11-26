import React, { type PropsWithChildren } from 'react';
import { SpaceLevel, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import type { LicenseEntitlementType } from '@/core/apollo/generated-v2/legacy-vocabulary';
import type { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';
import { useSpacePageData } from '@/domain/space/hooks/useSpacePage';
import { useNativeRouteSpace } from '@/main/routing/urlResolver/native/useNativeRouteSpace';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { pageSpace, rootFaceAbout, shellSpaceAbout } from './spacePageShellMapper';

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
    accountId: string;
  };
  permissions: SpacePermissions;
  entitlements: LicenseEntitlementType[];
  visibility: SpaceVisibility;
  /** The space's video-call room, or undefined when members may not video call (or the viewer cannot read it). */
  videoCallUrl: string | undefined;
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
    accountId: '',
  },
  entitlements: [],
  permissions: {
    canRead: false,
    canUpdate: false,
    canCreateSubspaces: false,
    canCreateTemplates: false,
  },
  visibility: SpaceVisibility.Active,
  videoCallUrl: undefined,
  loading: true,
});

const SpaceContextProvider = ({ children }: PropsWithChildren) => {
  const { spaceId: currentSpaceId, levelZeroSpaceId, loading: urlResolverLoading } = useUrlResolver();
  const spaceId = levelZeroSpaceId ?? '';
  // 021 FR-003: the level-zero Space document is the page's own D2 on a top-level space; on a subspace page the
  // level-zero space is the depth-0 ancestor face D1 returned, with no request of its own.
  const isLevelZero = Boolean(spaceId) && currentSpaceId === spaceId;
  const { root } = useNativeRouteSpace();
  const data = useSpacePageData(isLevelZero ? spaceId : undefined, 'space');
  const spaceData = pageSpace(data?.node, spaceId);
  // SpaceStatus and the legacy SpaceVisibility share their values (ACTIVE, ARCHIVED, DEMO, INACTIVE).
  const visibility = (spaceData?.status as SpaceVisibility | undefined) ?? SpaceVisibility.Active;
  const can = spaceData?.can;

  const permissions: SpacePermissions = {
    canRead: can?.read ?? false,
    canUpdate: can?.update ?? false,
    canCreateSubspaces: can?.createSubspace ?? false,
    canCreateTemplates: can?.manageTemplates ?? false,
  };

  // Feature flags are present by name (client-repoint.md "Licensing": read Space.entitlements[].name).
  const entitlements = (spaceData?.entitlements ?? []).map(entitlement => entitlement.name as LicenseEntitlementType);

  // L062: the room exists for every readable space; members may use it when the space allows it.
  const settings = spaceData?.settings as { permissions?: { members_video_call?: boolean } } | null | undefined;
  const videoCallUrl =
    settings?.permissions?.members_video_call === true ? (spaceData?.videoCallUrl ?? undefined) : undefined;

  const space = {
    id: spaceId,
    levelZeroSpaceId: levelZeroSpaceId ?? '',
    nameID: spaceData?.handle ?? '',
    about: isLevelZero ? shellSpaceAbout(spaceData) : rootFaceAbout(root),
    level: SpaceLevel.L0,
    accountId: spaceData?.host?.account?.id ?? '',
  };

  const loading = urlResolverLoading || !spaceId || (isLevelZero && !spaceData);
  return (
    <SpaceContext
      value={{
        space,
        permissions,
        loading,
        visibility,
        entitlements,
        videoCallUrl,
      }}
    >
      {children}
    </SpaceContext>
  );
};

export { SpaceContext, SpaceContextProvider };
