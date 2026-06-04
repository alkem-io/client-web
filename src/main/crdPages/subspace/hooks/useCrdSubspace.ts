import {
  useInnovationFlowDetailsQuery,
  useSpaceAboutDetailsQuery,
  useSpaceDefaultTemplatesQuery,
  useSubspacePageQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { SpaceLevel, TemplateDefaultType } from '@/core/apollo/generated/graphql-schema';
import type { SubspaceFlowPhase } from '@/crd/components/space/SubspaceFlowTabs';
import type { SubspaceHeaderActionsData } from '@/crd/components/space/SubspaceHeader';
import type { SubspaceSidebarData } from '@/crd/components/space/SubspaceSidebar';
import { getInitials } from '@/crd/lib/getInitials';
import useApplicationButton from '@/domain/access/ApplicationsAndInvitations/useApplicationButton';
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
  parentSpaceId: string | undefined;
  parentSpaceUrl: string | undefined;
  parentSpaceName: string | undefined;
  /** L0 in the chain — only distinct from parent when viewing an L2 (else identical to parent). */
  levelZeroSpaceId: string | undefined;
  levelZeroSpaceUrl: string | undefined;
  levelZeroSpaceName: string | undefined;
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
  const phases = mapInnovationFlowPhases(flow?.states);
  const currentPhaseId = flow?.currentState?.id;
  const canEditFlow = permissions.canUpdate;

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
    subspaceId,
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
    parentSpaceId,
    parentSpaceUrl: parentProfile?.url ?? undefined,
    parentSpaceName: parentProfile?.displayName ?? undefined,
    levelZeroSpaceId,
    levelZeroSpaceUrl: levelZeroProfile?.url ?? undefined,
    levelZeroSpaceName: levelZeroProfile?.displayName ?? undefined,
    roleSetId,
    communityId,
    collaborationId,
    calloutsSetId,
    templatesSetId,
    defaultSubspaceTemplateId,

    banner,
    bannerActions,
    sidebar,
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

    applicationButtonProps,
    applicationLoading,
  };
}
