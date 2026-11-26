import {
  useInviteToSpaceCommunityMutation,
  useSetSpaceCommunityRolesMutation,
} from '@/core/apollo/generated-v2/apollo-hooks';
import type {
  InviteInput,
  InviteToSpaceCommunityMutation,
  SetSpaceCommunityRolesMutation,
  SpaceCommunityCandidatesQuery,
} from '@/core/apollo/generated-v2/graphql-schema';

/** Space role names: the `authz_credential_role` values the space rows declare (server schema.sql:84-90, :8529-8554). */
export const SPACE_ROLE = {
  Member: 'member',
  Lead: 'lead',
  Admin: 'admin',
} as const;

/** `Actor.actorType` is the actor's entity type (server `authz_entity_type`, schema.sql:57-59). */
export const ACTOR_TYPE = {
  User: 'user',
  Organization: 'organization',
  VirtualContributor: 'virtual_contributor',
} as const;

/** Every query a role or invitation change must refresh on the Community tab. */
const COMMUNITY_REFETCH = ['SpaceCommunityMembers', 'SpaceCommunityAdmin', 'SpaceCommunityVirtualContributorPicker'];

/**
 * The exact desired role set after granting (`held`) or revoking one role. `setRoles` takes the
 * whole set, so every other role the actor holds is carried over unchanged.
 */
export const withRole = (roles: readonly string[], role: string, held: boolean): string[] => {
  if (!held) return roles.filter(r => r !== role);
  return roles.includes(role) ? [...roles] : [...roles, role];
};

export type SpaceCommunityRolesResult = SetSpaceCommunityRolesMutation['setRoles'];
export type SpaceCommunityInviteOutcome = InviteToSpaceCommunityMutation['invite'][number];

/** `setRoles` (role-assign-remove, direct-add-vc) and `invite` (invite-send) on one space. */
export const useSpaceCommunityMutations = (spaceId: string) => {
  // The refetches are not awaited: a committed write resolves on its own result, and a re-read the caller may not
  // make (the VC picker, FORBIDDEN) keeps its error to itself, as legacy's role-set writes awaited no re-read.
  const [setRolesMutation] = useSetSpaceCommunityRolesMutation({ refetchQueries: COMMUNITY_REFETCH });
  const [inviteMutation] = useInviteToSpaceCommunityMutation({
    // An invitation is a new pending request on the space (MembershipRequests.v2.graphql), as legacy re-read it.
    refetchQueries: [...COMMUNITY_REFETCH, 'MembershipRequests'],
  });

  const setRoles = async (actorId: string, roles: string[]): Promise<SpaceCommunityRolesResult> => {
    const { data } = await setRolesMutation({ variables: { space: spaceId, actor: actorId, roles } });
    if (!data) throw new Error('setRoles returned no result');
    return data.setRoles;
  };

  const invite = async (input: InviteInput): Promise<SpaceCommunityInviteOutcome[]> => {
    const { data } = await inviteMutation({ variables: { space: spaceId, input } });
    if (!data) throw new Error('invite returned no result');
    return data.invite;
  };

  return { setRoles, invite };
};

type CandidateNode = SpaceCommunityCandidatesQuery['candidates']['edges'][number]['node'];

export type SpaceCommunityCandidate = {
  id: string;
  actorType: string;
  displayName: string;
  avatarUrl?: string;
  description?: string;
  /** "City, Country" from `About.location` ({country, city}). */
  location?: string;
  /** Agent keywords (the VC profile's keyword tags). */
  tags: string[];
};

const locationText = (location: unknown): string | undefined => {
  if (!location || typeof location !== 'object') return undefined;
  const { city, country } = location as { city?: unknown; country?: unknown };
  const parts = [city, country].map(part => (typeof part === 'string' ? part.trim() : '')).filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : undefined;
};

export const toSpaceCommunityCandidate = (node: CandidateNode): SpaceCommunityCandidate => ({
  id: node.id,
  actorType: node.actorType,
  displayName: node.about?.displayName ?? '',
  avatarUrl: node.about?.avatar?.file.url,
  description: node.about?.description ?? undefined,
  location: locationText(node.about?.location),
  tags: 'keywords' in node ? node.keywords : [],
});
