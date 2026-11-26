import { CommunityMembershipStatus, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import {
  MembershipStatus,
  type SpaceDocumentFragment,
  type SpacePageQuery,
  type SpacePageShellQuery,
} from '@/core/apollo/generated-v2/graphql-schema';
import type { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';
import type { RouteAncestor } from '@/main/routing/urlResolver/native/useNativeRouteSpace';

export type ShellSpace = Extract<NonNullable<SpacePageShellQuery['node']>, { __typename?: 'Space' }>;

/** The Space face of a SpacePageShell read, when the node is the requested space. */
export const shellSpace = (node: SpacePageShellQuery['node'], id: string | undefined): ShellSpace | undefined =>
  node && id && node.id === id && node.entityType === 'space' ? (node as ShellSpace) : undefined;

/** The Space document of a SpacePage read (021 D2), when the node is the requested space and carries it. */
export const pageSpace = (node: SpacePageQuery['node'], id: string | undefined): SpaceDocumentFragment | undefined =>
  node && id && node.id === id && 'handle' in node ? (node as SpaceDocumentFragment) : undefined;

/** `Space.depth` is the level (0 = top-level space). */
export const shellSpaceLevel = (depth: number): SpaceLevel =>
  depth === 1 ? SpaceLevel.L1 : depth === 2 ? SpaceLevel.L2 : SpaceLevel.L0;

const MEMBERSHIP_STATUS: Record<MembershipStatus, CommunityMembershipStatus> = {
  [MembershipStatus.None]: CommunityMembershipStatus.NotMember,
  [MembershipStatus.Member]: CommunityMembershipStatus.Member,
  [MembershipStatus.Invited]: CommunityMembershipStatus.InvitationPending,
  [MembershipStatus.Applied]: CommunityMembershipStatus.ApplicationPending,
};

type ShellFileRef = { file: { url: string }; alt?: string | null; aspectRatio?: number | null };

const visual = (ref: ShellFileRef | null | undefined) =>
  ref
    ? { uri: ref.file.url, alternativeText: ref.alt ?? undefined, aspectRatio: ref.aspectRatio ?? undefined }
    : undefined;

/**
 * The about model of a Space face. The role set, community and guidelines have no wrapper natively: each of their
 * ids is the space's own id, the resource every membership and guidelines intent targets
 * (community-roles-screens.tsv "wrapper-ids" → Space.id).
 */
export const shellSpaceAbout = (space: ShellSpace | SpaceDocumentFragment | undefined): SpaceAboutLightModel => ({
  isContentPublic: space?.isContentPublic ?? true,
  membership: {
    myMembershipStatus: space?.membership ? MEMBERSHIP_STATUS[space.membership.status] : undefined,
    roleSetID: space?.id,
    communityID: space?.id,
  },
  profile: {
    displayName: space?.about.displayName ?? '',
    url: space?.url ?? '',
    tagline: space?.about.tagline ?? undefined,
    description: space?.about.description ?? undefined,
    tagset: space ? { tags: space.tags } : undefined,
    avatar: visual(space?.about.avatar),
    cardBanner: visual(space?.about.card),
    banner: visual(space?.about.banner),
  },
  guidelines: {
    id: space?.id ?? '',
  },
});

/** The level-zero space as D1 returns it on a subspace page: its face only (021 data-model.md D1). */
export const rootFaceAbout = (root: RouteAncestor | undefined): SpaceAboutLightModel => ({
  profile: {
    displayName: root?.about.displayName ?? '',
    url: root?.url ?? '',
    tagline: root?.about.tagline ?? undefined,
    avatar: visual(root?.about.avatar),
    cardBanner: visual(root?.about.card),
    banner: visual(root?.about.banner),
  },
});
