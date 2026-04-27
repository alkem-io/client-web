import {
  useInnovationFlowDetailsQuery,
  useSpaceAboutDetailsQuery,
  useSubspacePageQuery,
} from '@/core/apollo/generated/apollo-hooks';
import type { SubspaceFlowPhase } from '@/crd/components/space/SubspaceFlowTabs';
import type { SubspaceHeaderActionsData } from '@/crd/components/space/SubspaceHeader';
import type { SubspaceSidebarData } from '@/crd/components/space/SubspaceSidebar';
import useApplicationButton from '@/domain/access/ApplicationsAndInvitations/useApplicationButton';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
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

  const subspaceId = subspace.id;
  const roleSetId = subspace.about.membership?.roleSetID || undefined;

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
  });

  const bannerAvatars = mapMemberAvatars(subspace.about.membership?.leadUsers);

  const sidebar = mapSubspaceSidebar({
    whyMarkdown: subspace.about.why,
    tagline: subspaceProfile.tagline,
    leadUsers: subspace.about.membership?.leadUsers,
    // Virtual contributor data isn't part of SubspaceContext today.
    // Plan D13: hide section when none — keep undefined here, surface follow-up.
    virtualContributor: undefined,
  });

  const visibility = mapSpaceVisibility(undefined);

  return {
    loading: subspaceContextLoading || subspacePageLoading || flowLoading || parentAboutLoading,
    notFound: !subspaceContextLoading && !subspaceId,

    subspaceId,
    subspaceName: banner.title,
    subspaceUrl,
    parentSpaceId,
    parentSpaceUrl: parentProfile?.url ?? undefined,
    parentSpaceName: parentProfile?.displayName ?? undefined,
    roleSetId,
    collaborationId,
    calloutsSetId,

    banner,
    bannerActions,
    bannerAvatars,
    sidebar,
    visibility,

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
