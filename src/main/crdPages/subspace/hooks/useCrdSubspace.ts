import {
  useInnovationFlowDetailsQuery,
  useSpaceAboutDetailsQuery,
  useSpaceDefaultTemplatesQuery,
  useSubspacePageQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, SpaceLevel, TemplateDefaultType } from '@/core/apollo/generated/graphql-schema';
import type { ParentSpaceStackItem } from '@/crd/components/space/ParentSpaceStack';
import type { SubspaceFlowPhase } from '@/crd/components/space/SubspaceFlowTabs';
import type { SubspaceHeaderActionsData } from '@/crd/components/space/SubspaceHeader';
import type { SubspaceSidebarData } from '@/crd/components/space/SubspaceSidebar';
import { getInitials } from '@/crd/lib/getInitials';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import useApplicationButton from '@/domain/access/ApplicationsAndInvitations/useApplicationButton';
import { filterVisibleStates } from '@/domain/collaboration/InnovationFlow/utils/filterVisibleStates';
import useSpaceDashboardNavigation from '@/domain/space/components/spaceDashboardNavigation/useSpaceDashboardNavigation';
import { useSpace } from '@/domain/space/context/useSpace';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import { useVideoCall } from '@/domain/space/hooks/useVideoCall';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { mapSpaceVisibility, type SpaceVisibilityData } from '../../space/dataMappers/spacePageDataMapper';
import {
  mapInnovationFlowPhases,
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
  parentSpaceUrl: string | undefined;
  parentSpaceName: string | undefined;
  /** Parent's identity image: its avatar at L1, or its cardBanner when the parent is the L0 (which has no avatar). */
  parentSpaceAvatarUrl: string | undefined;
  /** L0 in the chain — only distinct from parent when viewing an L2 (else identical to parent). */
  levelZeroSpaceId: string | undefined;
  levelZeroSpaceUrl: string | undefined;
  levelZeroSpaceName: string | undefined;
  /** L0 identity image — the cardBanner (L0 has no avatar visual). */
  levelZeroSpaceAvatarUrl: string | undefined;
  roleSetId: string | undefined;
  communityId: string | undefined;
  collaborationId: string | undefined;
  calloutsSetId: string | undefined;
  /** Templates set + default subspace template — feed the Create-Subspace picker (FR-031, D21). */
  templatesSetId: string | undefined;
  defaultSubspaceTemplateId: string | undefined;

  /** Render data */
  banner: SubspaceBannerProps;
  bannerActions: SubspaceHeaderActionsData;
  sidebar: SubspaceSidebarData;
  /** Ancestor spaces (outermost first) for the sidebar's stacked parent cards. */
  parentSpaceStack: ParentSpaceStackItem[];
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

  /** Innovation flow */
  innovationFlowId: string | undefined;
  phases: SubspaceFlowPhase[];
  currentPhaseId: string | undefined;
  canEditFlow: boolean;

  /** Permissions surfaced on the page */
  canRead: boolean;
  canUpdate: boolean;
  canCreateSubspace: boolean;
  /** CreateCallout on the calloutsSet — the Add Post gate (same as the L0 tabs). */
  canCreateCallout: boolean;

  /** Apply / Join CTA — pass-through from useApplicationButton */
  applicationButtonProps: ReturnType<typeof useApplicationButton>['applicationButtonProps'];
  applicationLoading: boolean;
};

export function useCrdSubspace(): CrdSubspacePageData {
  const { subspace, parentSpaceId, permissions, loading: subspaceContextLoading } = useSubSpace();
  // L0 visibility flows down to subspaces — they share the level-zero space's status.
  const { visibility } = useSpace();

  const subspaceId = subspace.id;
  const subspaceNameId = subspace.nameId;
  const roleSetId = subspace.about.membership?.roleSetID || undefined;
  const communityId = subspace.about.membership?.communityID || undefined;

  // Video call enablement & URL for the banner action icon (FR: show video icon when enabled).
  const { isVideoCallEnabled, videoCallUrl } = useVideoCall(subspaceId, subspaceNameId);

  // Subspace-specific page query (collaboration + calloutsSet IDs, templatesManager).
  const { data: subspacePageData, loading: subspacePageLoading } = useSubspacePageQuery({
    variables: { spaceId: subspaceId },
    skip: !subspaceId,
  });
  const collaborationId = subspacePageData?.lookup.space?.collaboration.id;
  const calloutsSetId = subspacePageData?.lookup.space?.collaboration.calloutsSet.id;
  // Same gate every L0 space tab uses for Add Post: CreateCallout on the calloutsSet.
  const canCreateCallout =
    subspacePageData?.lookup.space?.collaboration.calloutsSet.authorization?.myPrivileges?.includes(
      AuthorizationPrivilege.CreateCallout
    ) ?? false;
  // The SubspacePage query already fetches templatesManager.templatesSet.id — surface it
  // so the Create-Subspace picker shows this space's own Space templates (D21).
  const templatesSetId = subspacePageData?.lookup.space?.templatesManager?.templatesSet?.id;

  // Configured default subspace template for FR-031 pre-selection — light query, non-blocking.
  const { data: defaultTemplatesData } = useSpaceDefaultTemplatesQuery({
    variables: { spaceId: subspaceId },
    skip: !subspaceId,
  });
  const defaultSubspaceTemplateId = defaultTemplatesData?.lookup.space?.templatesManager?.templateDefaults?.find(
    td => td.type === TemplateDefaultType.SpaceSubspace
  )?.template?.id;

  // Innovation flow phases + currentState (for default tab resolution).
  const { data: flowData, loading: flowLoading } = useInnovationFlowDetailsQuery({
    variables: { collaborationId: collaborationId ?? '' },
    skip: !collaborationId,
  });
  const flow = flowData?.lookup.collaboration?.innovationFlow;
  const innovationFlowId = flow?.id;
  const canEditFlow = permissions.canUpdate;
  // Hidden phases are removed from the live tab strip for everyone, including admins; admins
  // still manage/unhide them in Settings → Layout. UI-only: hidden phases stay reachable by URL.
  // No-op until the server exposes per-phase `visible` (graceful degradation).
  const phases = mapInnovationFlowPhases(filterVisibleStates(flow?.states ?? []));
  const currentPhaseId = flow?.currentState?.id;

  // Parent's banner image — fetched via the same about-details query the parent
  // space already uses, so Apollo dedupes / serves from cache when navigating
  // between sibling subspaces (per research R3).
  const { data: parentAboutData, loading: parentAboutLoading } = useSpaceAboutDetailsQuery({
    variables: { spaceId: parentSpaceId ?? '' },
    skip: !parentSpaceId,
  });
  const parentSpace = parentAboutData?.lookup.space;
  const parentProfile = parentSpace?.about.profile;

  // L0 (top-level) ancestor — only fetched when viewing an L2 (where L0 differs from
  // the immediate parent). Needed to render the full L0 → L1 → L2 breadcrumb chain.
  const { levelZeroSpaceId } = useUrlResolver();
  const needL0Lookup = !!levelZeroSpaceId && levelZeroSpaceId !== parentSpaceId;
  const { data: levelZeroAboutData, loading: levelZeroAboutLoading } = useSpaceAboutDetailsQuery({
    variables: { spaceId: levelZeroSpaceId ?? '' },
    skip: !needL0Lookup,
  });
  const levelZeroProfile = needL0Lookup ? levelZeroAboutData?.lookup.space?.about.profile : parentProfile;

  // Ancestor chain for the sidebar's stacked parent cards, outermost first:
  // L1 page → [L0]; L2 page → [L0, L1]. Card banners with the deterministic
  // gradient as fallback; taglines are plain text (never markdown descriptions).
  const parentStackItem = (id: string | undefined, profile: typeof parentProfile): ParentSpaceStackItem | undefined =>
    profile?.url
      ? {
          name: profile.displayName,
          initials: getInitials(profile.displayName),
          href: profile.url,
          bannerUrl: profile.cardBanner?.uri || undefined,
          color: pickColorFromId(id ?? profile.displayName),
          tagline: profile.tagline ?? undefined,
        }
      : undefined;
  const parentSpaceStack = [
    ...(needL0Lookup ? [parentStackItem(levelZeroSpaceId, levelZeroProfile)] : []),
    parentStackItem(parentSpaceId, parentProfile),
  ].filter((item): item is ParentSpaceStackItem => Boolean(item));

  // Apply / Join CTA — useApplicationButton handles parent-membership requirement
  // when parentSpaceId is supplied (per research R8).
  const { applicationButtonProps, loading: applicationLoading } = useApplicationButton({
    spaceId: subspaceId,
    parentSpaceId,
    loading: subspaceContextLoading,
  });

  const subspaceProfile = subspace.about.profile;
  const subspaceUrl = subspaceProfile.url ?? '';

  const banner = mapSubspaceBanner({
    subspaceProfile,
    levelZeroSpaceId,
    levelZeroProfile,
  });

  const bannerActions = mapSubspaceHeaderActions({
    shareUrl: subspaceUrl || undefined,
    canUpdate: permissions.canUpdate,
    videoCallEnabled: isVideoCallEnabled,
    videoCallUrl: videoCallUrl || undefined,
  });

  const sidebar = mapSubspaceSidebar({
    description: subspaceProfile.description,
    leadUsers: subspace.about.membership?.leadUsers,
    leadOrganizations: subspace.about.membership?.leadOrganizations,
    // Virtual contributor data isn't part of SubspaceContext today.
    // Plan D13: hide section when none — keep undefined here, surface follow-up.
    virtualContributor: undefined,
  });

  // Nested subspaces (L2s) shown by the sidebar widget. Reuses the same hook the
  // L0 dashboard uses for its children list — it works for any space level.
  const { dashboardNavigation } = useSpaceDashboardNavigation({ spaceId: subspaceId });
  const subspaces =
    dashboardNavigation?.children?.map(child => ({
      name: child.displayName,
      initials: getInitials(child.displayName),
      href: child.url,
      avatarUrl: child.avatar?.uri,
      isPrivate: child.private,
      isPinned: child.pinned,
    })) ?? [];

  const visibilityData = mapSpaceVisibility(visibility);

  return {
    loading:
      subspaceContextLoading || subspacePageLoading || flowLoading || parentAboutLoading || levelZeroAboutLoading,
    notFound: !subspaceContextLoading && !subspaceId,

    subspaceId,
    subspaceName: banner.title,
    subspaceUrl,
    subspaceAvatarUrl: subspaceProfile.avatar?.uri || undefined,
    parentSpaceId,
    parentSpaceUrl: parentProfile?.url ?? undefined,
    parentSpaceName: parentProfile?.displayName ?? undefined,
    // When the immediate parent IS the L0 (viewing an L1), it has no avatar —
    // its cardBanner is the identity image. An L1 parent (viewing an L2) uses
    // its own avatar.
    parentSpaceAvatarUrl: (needL0Lookup ? parentProfile?.avatar?.uri : parentProfile?.cardBanner?.uri) || undefined,
    levelZeroSpaceId,
    levelZeroSpaceUrl: levelZeroProfile?.url ?? undefined,
    levelZeroSpaceName: levelZeroProfile?.displayName ?? undefined,
    levelZeroSpaceAvatarUrl: levelZeroProfile?.cardBanner?.uri || undefined,
    roleSetId,
    communityId,
    collaborationId,
    calloutsSetId,
    templatesSetId,
    defaultSubspaceTemplateId,

    banner,
    bannerActions,
    sidebar,
    parentSpaceStack,
    subspaces,
    visibility: visibilityData,

    innovationFlowId,
    phases,
    currentPhaseId,
    canEditFlow,

    canRead: permissions.canRead,
    canUpdate: permissions.canUpdate,
    // Spaces are capped at 3 levels (L0 → L1 → L2). An L2 cannot have children,
    // so creation is offered only on L1 even if the backend grants the privilege.
    canCreateSubspace: permissions.canCreateSubspace && subspace.level !== SpaceLevel.L2,
    canCreateCallout,

    applicationButtonProps,
    applicationLoading,
  };
}
