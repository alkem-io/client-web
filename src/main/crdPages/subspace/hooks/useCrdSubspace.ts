import { SpaceLevel, type SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import type { BreadcrumbTrailItem } from '@/crd/components/common/BreadcrumbsTrail';
import type { ParentSpaceStackItem } from '@/crd/components/space/ParentSpaceStack';
import type { SubspaceFlowPhase } from '@/crd/components/space/SubspaceFlowTabs';
import type { SubspaceHeaderActionsData } from '@/crd/components/space/SubspaceHeader';
import type { SubspaceSidebarData } from '@/crd/components/space/SubspaceSidebar';
import {
  SIDEBAR_WIDGET_IDS_BY_LEVEL,
  type SidebarWidgetId,
} from '@/crd/components/space/settings/SpaceSettingsLayoutView.types';
import { getInitials } from '@/crd/lib/getInitials';
import { pageSpace, rootFaceAbout } from '@/domain/space/context/spacePageShellMapper';
import { orderedStages, treeSubspaces, useSpacePageData, useSpaceTree } from '@/domain/space/hooks/useSpacePage';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import { useNativeRouteSpace } from '@/main/routing/urlResolver/native/useNativeRouteSpace';
import { mapSpaceVisibility, type SpaceVisibilityData } from '../../space/dataMappers/spacePageDataMapper';
import {
  deriveWidgetSkips,
  resolveSidebarPlan,
  type SidebarWidgetSkipFlags,
  toWireSidebar,
} from '../../space/layout/sidebarWidgetPlan';
import {
  mapAncestorCrumbs,
  mapInnovationFlowPhases,
  mapParentSpaceStack,
  mapSubspaceBanner,
  mapSubspaceHeaderActions,
  mapSubspaceSidebar,
  type SubspaceBannerProps,
} from '../dataMappers/subspacePageDataMapper';

export type CrdSubspacePageData = {
  loading: boolean;
  notFound: boolean;

  /** Identity */
  subspaceId: string;
  subspaceName: string;
  subspaceUrl: string;
  /** This subspace's AVATAR visual — breadcrumb identity image. */
  subspaceAvatarUrl: string | undefined;
  parentSpaceId: string | undefined;
  /** The returned depth-0 ancestor (021 D1), when the resolver returns it. */
  levelZeroSpaceId: string | undefined;
  /** Breadcrumb hops above this space: exactly the ancestors D1 returns, root-first. */
  ancestorCrumbs: BreadcrumbTrailItem[];
  /** A native space has no role set, community, collaboration or callouts set wrapper: each id is the space's own. */
  roleSetId: string | undefined;
  communityId: string | undefined;
  collaborationId: string | undefined;
  calloutsSetId: string | undefined;

  /** Render data */
  banner: SubspaceBannerProps;
  bannerActions: SubspaceHeaderActionsData;
  sidebar: SubspaceSidebarData;
  /** Ancestor spaces (outermost first) for the sidebar's stacked parent cards. */
  parentSpaceStack: ParentSpaceStackItem[];
  /** The space tree is not served yet: the subspaces widget says so in place. */
  subspacesUnavailable: boolean;
  /** Nested subspaces of the current subspace — fed into the sidebar widget. */
  subspaces: Array<{
    name: string;
    initials: string;
    href: string;
    avatarUrl?: string;
    isPrivate?: boolean;
    isPinned?: boolean;
  }>;
  visibility: SpaceVisibilityData;

  /** Phases are the space's stages; the current stage is not served yet (021 tasks.md S01). */
  phases: SubspaceFlowPhase[];
  currentPhaseId: string | undefined;
  canEditFlow: boolean;

  /** The subspace sidebar is `settings.subspace_sidebar`, resolved with the subspace vocabulary at every depth:
   *  where no child can exist the data hides the subspace widgets (021 FR-015). */
  level: 'L1' | 'L2';
  sidebarPlan: SidebarWidgetId[];
  sidebarSkips: SidebarWidgetSkipFlags;

  /** Permissions surfaced on the page */
  canRead: boolean;
  canUpdate: boolean;
  canCreateSubspace: boolean;
  /** The Add Post gate (SpaceCan.createPost, legacy CreateCallout on the calloutsSet). */
  canCreateCallout: boolean;
};

type SpaceSettings = {
  subspace_sidebar?: SidebarWidgetId[];
  sort_mode?: string;
  permissions?: { members_video_call?: boolean };
} | null;

export function useCrdSubspace(): CrdSubspacePageData {
  const { subspace, parentSpaceId, permissions, loading: subspaceContextLoading } = useSubSpace();
  const { space: routeSpace, ancestors, root } = useNativeRouteSpace();

  const subspaceId = subspace.id;
  const space = pageSpace(useSpacePageData(subspaceId, 'space')?.node, subspaceId);
  const settings = routeSpace?.settings as SpaceSettings;
  const sidebarPlan = resolveSidebarPlan(
    toWireSidebar(settings?.subspace_sidebar ?? []),
    SIDEBAR_WIDGET_IDS_BY_LEVEL.L1
  );
  const sidebarSkips = deriveWidgetSkips(sidebarPlan);

  // The collapsed rail and the 7 rows read the subspaces of the page's space tree.
  const spaceTree = useSpaceTree(subspaceId);
  const subspaces = treeSubspaces(spaceTree.tree).map(child => ({
    name: child.about.displayName,
    initials: getInitials(child.about.displayName),
    href: child.url ?? '',
    avatarUrl: child.about.avatar?.file.url,
    isPrivate: !child.isContentPublic,
    isPinned: settings?.sort_mode === 'alphabetical' && Boolean(child.pinned),
  }));

  const subspaceProfile = subspace.about.profile;
  const subspaceUrl = subspaceProfile.url ?? '';
  const hops = ancestors.filter(ancestor => ancestor.id !== subspaceId);
  const banner = mapSubspaceBanner({
    subspaceProfile,
    levelZeroSpaceId: root?.id,
    levelZeroProfile: root && rootFaceAbout(root).profile,
  });

  // L062: the room exists for every readable space; members may use it when the space allows it.
  const videoCallUrl =
    settings?.permissions?.members_video_call === true ? (space?.videoCallUrl ?? undefined) : undefined;
  const bannerActions = mapSubspaceHeaderActions({
    shareUrl: subspaceUrl || undefined,
    canUpdate: permissions.canUpdate,
    videoCallEnabled: Boolean(videoCallUrl),
    videoCallUrl,
  });

  const sidebar = mapSubspaceSidebar({
    description: subspaceProfile.description,
    leadUsers: subspace.about.membership?.leadUsers,
    leadOrganizations: subspace.about.membership?.leadOrganizations,
    // Subspaces never render the virtual-contributors widget (021 data-model.md "The page needs").
    virtualContributor: undefined,
  });

  return {
    loading: subspaceContextLoading,
    notFound: !subspaceContextLoading && !subspaceId,

    subspaceId,
    subspaceName: banner.title,
    subspaceUrl,
    subspaceAvatarUrl: subspaceProfile.avatar?.uri || undefined,
    parentSpaceId,
    levelZeroSpaceId: root?.id,
    ancestorCrumbs: mapAncestorCrumbs(hops),
    roleSetId: subspaceId || undefined,
    communityId: subspaceId || undefined,
    collaborationId: subspaceId || undefined,
    calloutsSetId: subspaceId || undefined,

    banner,
    bannerActions,
    sidebar,
    parentSpaceStack: mapParentSpaceStack(hops),
    subspaces,
    subspacesUnavailable: spaceTree.notServed,
    // The status notice is the space's own status (SpaceStatus shares the legacy SpaceVisibility values).
    visibility: mapSpaceVisibility(space?.status as SpaceVisibility | undefined),

    phases: mapInnovationFlowPhases(
      orderedStages(space?.stages).map(stage => ({
        id: stage.id,
        displayName: stage.name,
        description: stage.description,
      }))
    ),
    currentPhaseId: undefined,
    canEditFlow: permissions.canUpdate,

    level: subspace.level === SpaceLevel.L2 ? 'L2' : 'L1',
    sidebarPlan,
    sidebarSkips,

    canRead: permissions.canRead,
    canUpdate: permissions.canUpdate,
    canCreateSubspace: permissions.canCreateSubspace,
    canCreateCallout: space?.can.createPost ?? false,
  };
}
