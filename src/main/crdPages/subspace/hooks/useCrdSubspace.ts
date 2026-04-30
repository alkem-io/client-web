import {
  useInnovationFlowDetailsQuery,
  useSpaceAboutDetailsQuery,
  useSubspacePageQuery,
} from '@/core/apollo/generated/apollo-hooks';
import type { SubspaceFlowPhase } from '@/crd/components/space/SubspaceFlowTabs';
import type { SubspaceHeaderActionsData } from '@/crd/components/space/SubspaceHeader';
import type { SubspaceSidebarData } from '@/crd/components/space/SubspaceSidebar';
import useApplicationButton from '@/domain/access/ApplicationsAndInvitations/useApplicationButton';
import { useSpace } from '@/domain/space/context/useSpace';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import { useVideoCall } from '@/domain/space/hooks/useVideoCall';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import {
  mapMemberAvatars,
  mapSpaceVisibility,
  type SpaceVisibilityData,
} from '../../space/dataMappers/spacePageDataMapper';
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
  collaborationId: string | undefined;
  calloutsSetId: string | undefined;

  /** Render data */
  banner: SubspaceBannerProps;
  bannerActions: SubspaceHeaderActionsData;
  bannerAvatars: ReturnType<typeof mapMemberAvatars>;
  sidebar: SubspaceSidebarData;
  visibility: SpaceVisibilityData;

  /** Innovation flow */
  phases: SubspaceFlowPhase[];
  currentPhaseId: string | undefined;
  canEditFlow: boolean;
  canAddPost: boolean;

  /** Permissions surfaced on the page */
  canRead: boolean;
  canUpdate: boolean;

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

  // Video call enablement & URL for the banner action icon (FR: show video icon when enabled).
  const { isVideoCallEnabled, videoCallUrl } = useVideoCall(subspaceId, subspaceNameId);

  // Subspace-specific page query (collaboration + calloutsSet IDs, templatesManager).
  const { data: subspacePageData, loading: subspacePageLoading } = useSubspacePageQuery({
    variables: { spaceId: subspaceId },
    skip: !subspaceId,
  });
  const collaborationId = subspacePageData?.lookup.space?.collaboration.id;
  const calloutsSetId = subspacePageData?.lookup.space?.collaboration.calloutsSet.id;

  // Innovation flow phases + currentState (for default tab resolution).
  const { data: flowData, loading: flowLoading } = useInnovationFlowDetailsQuery({
    variables: { collaborationId: collaborationId ?? '' },
    skip: !collaborationId,
  });
  const flow = flowData?.lookup.collaboration?.innovationFlow;
  const phases = mapInnovationFlowPhases(flow?.states);
  const currentPhaseId = flow?.currentState?.id;
  const canEditFlow = permissions.canUpdate;
  const canAddPost = permissions.canCreate;

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
    level: subspace.level,
    subspaceProfile,
    parentSpaceId,
    parentProfile,
  });

  const bannerActions = mapSubspaceHeaderActions({
    shareUrl: subspaceUrl || undefined,
    canUpdate: permissions.canUpdate,
    videoCallEnabled: isVideoCallEnabled,
    videoCallUrl: videoCallUrl || undefined,
  });

  const bannerAvatars = mapMemberAvatars(subspace.about.membership?.leadUsers);

  const sidebar = mapSubspaceSidebar({
    description: subspaceProfile.description,
    leadUsers: subspace.about.membership?.leadUsers,
    // Virtual contributor data isn't part of SubspaceContext today.
    // Plan D13: hide section when none — keep undefined here, surface follow-up.
    virtualContributor: undefined,
  });

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
    collaborationId,
    calloutsSetId,

    banner,
    bannerActions,
    bannerAvatars,
    sidebar,
    visibility: visibilityData,

    phases,
    currentPhaseId,
    canEditFlow,
    canAddPost,

    canRead: permissions.canRead,
    canUpdate: permissions.canUpdate,

    applicationButtonProps,
    applicationLoading,
  };
}
