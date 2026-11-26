import type { ApolloError } from '@apollo/client';
import { useEffect, useState } from 'react';
import {
  useSpaceCommunityAdminQuery,
  useSpaceCommunityMembersQuery,
  useSpaceCommunityVirtualContributorPickerQuery,
} from '@/core/apollo/generated-v2/apollo-hooks';
import useRoleSetApplicationsAndInvitations from '@/domain/access/ApplicationsAndInvitations/useRoleSetApplicationsAndInvitations';
import type { ApplicationModel } from '@/domain/access/model/ApplicationModel';
import type { InvitationModel } from '@/domain/access/model/InvitationModel';
import type { PlatformInvitationModel } from '@/domain/access/model/PlatformInvitationModel';
import {
  ACTOR_TYPE,
  SPACE_ROLE,
  type SpaceCommunityRolesResult,
  useSpaceCommunityMutations,
  withRole,
} from '@/domain/spaceAdmin/SpaceAdminCommunity/native/spaceCommunityNative';

interface useCommunityAdminParams {
  /** The space whose members and roles are managed (native `members` / `setRoles` resource). */
  spaceId: string;
  /** Legacy role set id — only the applications/invitations lists still read it. */
  roleSetId: string;
}

/** Holder bounds of one role per actor type; `maximum: -1` = unbounded, `minimum: 0` = no minimum. */
export type CommunityRoleBounds = {
  userPolicy: { minimum: number; maximum: number };
  organizationPolicy: { minimum: number; maximum: number };
};

/** One roster row: an actor holding a community role on the space, with every role it holds. */
export type CommunityActorMember = {
  id: string;
  actorType: string;
  displayName: string;
  avatarUrl?: string;
  url?: string;
  firstName?: string;
  /** Null without READ_USER_PII on the user (api-second-pass.md:301), as legacy showed none. */
  email?: string;
  roles: string[];
  isMember: boolean;
  isLead: boolean;
  isAdmin: boolean;
};

/**
 * The native verdicts each Community control is gated on. `undefined` = the verdict could not
 * be read (still loading, or the read failed).
 */
export type CommunityGates = {
  /** `SpaceCan.invite` — the space's INVITE verdict. */
  invite: boolean | undefined;
  /** `SpaceCan.manageMembers` — the space's GRANT verdict (role changes of existing holders). */
  manageMembers: boolean | undefined;
  /** `invite` / `manageMembers` still loading. */
  loading: boolean;
  /** The add-VC picker verdict served by `candidates(entry: DIRECT)` (admitted or FORBIDDEN). */
  virtualContributorPicker: boolean | undefined;
  virtualContributorPickerLoading: boolean;
};

export interface useCommunityAdminProvided {
  userAdmin: {
    members: CommunityActorMember[];
    onLeadChange: (memberId: string, isLead: boolean) => Promise<SpaceCommunityRolesResult>;
    onAuthorizationChange: (memberId: string, isAdmin: boolean) => Promise<SpaceCommunityRolesResult>;
    onRemove: (memberId: string) => Promise<SpaceCommunityRolesResult>;
  };
  organizationAdmin: {
    members: CommunityActorMember[];
    onLeadChange: (memberId: string, isLead: boolean) => Promise<SpaceCommunityRolesResult>;
    onRemove: (memberId: string) => Promise<SpaceCommunityRolesResult>;
  };
  virtualContributorAdmin: {
    members: CommunityActorMember[];
    onAdd: (memberId: string) => Promise<SpaceCommunityRolesResult>;
    onRemove: (memberId: string) => Promise<SpaceCommunityRolesResult>;
  };
  membershipAdmin: {
    memberRoleDefinition: CommunityRoleBounds | undefined;
    leadRoleDefinition: CommunityRoleBounds | undefined;
    applications: ApplicationModel[];
    invitations: InvitationModel[];
    platformInvitations: PlatformInvitationModel[];
    onApplicationStateChange: (applicationId: string, eventName: string) => Promise<unknown>;
    onInvitationStateChange: (invitationId: string, eventName: string) => Promise<unknown>;
    onDeleteInvitation: (invitationId: string) => Promise<unknown>;
    onDeletePlatformInvitation: (invitationId: string) => Promise<unknown>;
    onResendPlatformInvitation: (invitationId: string) => Promise<unknown>;
  };
  permissions: {
    canInvite: boolean;
    canInviteOrganizations: boolean;
    canAddVirtualContributors: boolean;
  };
  gates: CommunityGates;
  loading: boolean;
  errored: boolean;
}

const MEMBERS_PAGE_SIZE = 100;
/** The roles the Community tab lists holders of (legacy `RELEVANT_ROLES.Community`). */
const COMMUNITY_ROLES: readonly string[] = [SPACE_ROLE.Member, SPACE_ROLE.Lead, SPACE_ROLE.Admin];

const isForbidden = (error: ApolloError) => error.graphQLErrors.some(e => e.extensions?.code === 'FORBIDDEN');

const useCommunityAdmin = ({ spaceId, roleSetId }: useCommunityAdminParams): useCommunityAdminProvided => {
  const skip = !spaceId;

  // roster (community-roles-screens.tsv:187): every page of Query.members.
  const membersQuery = useSpaceCommunityMembersQuery({
    variables: { space: spaceId, first: MEMBERS_PAGE_SIZE },
    skip,
  });
  const connection = skip ? undefined : membersQuery.data?.members;
  const nextCursor = connection?.pageInfo.hasNextPage ? (connection.pageInfo.endCursor ?? '') : undefined;
  const [pagingError, setPagingError] = useState<{ space: string; error: Error }>();
  // `membersQuery.fetchMore` is a fresh function every render — the effect re-runs per cursor only.
  useEffect(() => {
    if (skip || nextCursor === undefined) return;
    if (!nextCursor) {
      setPagingError({ space: spaceId, error: new Error('Members continuation is missing its cursor') });
      return;
    }
    membersQuery
      .fetchMore({ variables: { space: spaceId, first: MEMBERS_PAGE_SIZE, after: nextCursor } })
      .then(({ data }) => {
        const { hasNextPage, endCursor } = data.members.pageInfo;
        if (hasNextPage && (!endCursor || endCursor === nextCursor)) {
          setPagingError({ space: spaceId, error: new Error('Members continuation did not advance its cursor') });
        }
      })
      .catch((cause: unknown) =>
        setPagingError({
          space: spaceId,
          error: cause instanceof Error ? cause : new Error('Members continuation failed'),
        })
      );
  }, [skip, spaceId, nextCursor]);
  const membersPagingFailed = pagingError !== undefined && pagingError.space === spaceId;

  // roleset-privileges (:186) and role-bounds (:185).
  const adminQuery = useSpaceCommunityAdminQuery({ variables: { space: spaceId }, skip });
  const pickerQuery = useSpaceCommunityVirtualContributorPickerQuery({ variables: { space: spaceId }, skip });

  const allMembers = (connection?.edges ?? [])
    .map<CommunityActorMember>(({ node }) => {
      const { actor, roles } = node;
      return {
        id: actor.id,
        actorType: actor.actorType,
        displayName: actor.about?.displayName ?? '',
        avatarUrl: actor.about?.avatar?.file.url,
        url: actor.url ?? undefined,
        firstName: ('firstName' in actor ? actor.firstName : undefined) ?? undefined,
        email: ('email' in actor ? actor.email : undefined) ?? undefined,
        roles,
        isMember: roles.includes(SPACE_ROLE.Member),
        isLead: roles.includes(SPACE_ROLE.Lead),
        isAdmin: roles.includes(SPACE_ROLE.Admin),
      };
    })
    .filter(member => member.roles.some(role => COMMUNITY_ROLES.includes(role)));
  const membersOfType = (actorType: string) => allMembers.filter(member => member.actorType === actorType);

  const rolePolicies = skip ? undefined : adminQuery.data?.rolePolicies;
  const roleBounds = (role: string): CommunityRoleBounds | undefined => {
    if (!rolePolicies) return undefined;
    const bounds = (actorType: string) => {
      const policy = rolePolicies.find(p => p.role === role && p.actorType === actorType);
      return { minimum: policy?.minHolders ?? 0, maximum: policy?.maxHolders ?? -1 };
    };
    return { userPolicy: bounds(ACTOR_TYPE.User), organizationPolicy: bounds(ACTOR_TYPE.Organization) };
  };

  const space = skip ? undefined : adminQuery.data?.node;
  const can = space && 'can' in space ? space.can : undefined;
  const virtualContributorPicker = skip
    ? undefined
    : pickerQuery.error
      ? isForbidden(pickerQuery.error)
        ? false
        : undefined
      : pickerQuery.data
        ? true
        : undefined;
  const gates: CommunityGates = {
    invite: can?.invite,
    manageMembers: can?.manageMembers,
    loading: adminQuery.loading,
    virtualContributorPicker,
    virtualContributorPickerLoading: pickerQuery.loading,
  };

  // role-assign-remove (:184) / direct-add-vc (:167): each change sends the actor's exact desired set.
  const { setRoles } = useSpaceCommunityMutations(spaceId);
  const rolesOf = (actorId: string) => allMembers.find(member => member.id === actorId)?.roles ?? [];
  const changeRole = (actorId: string, role: string, held: boolean) =>
    setRoles(actorId, withRole(rolesOf(actorId), role, held));
  // Removing an actor from the community is ONE exact set: no role left (the server cascades delegates).
  const removeActor = (actorId: string) => setRoles(actorId, []);

  const {
    applications,
    invitations,
    platformInvitations,
    applicationStateChange,
    invitationStateChange,
    deleteInvitation,
    deletePlatformInvitation,
    resendPlatformInvitation,
    loading: loadingApplicationsAndInvitations,
    errored: erroredApplicationsAndInvitations,
  } = useRoleSetApplicationsAndInvitations({
    roleSetId,
  });

  const membersLoading = !skip && (membersQuery.loading || (nextCursor !== undefined && !membersPagingFailed));

  return {
    userAdmin: {
      members: membersOfType(ACTOR_TYPE.User),
      onLeadChange: (memberId, isLead) => changeRole(memberId, SPACE_ROLE.Lead, isLead),
      onAuthorizationChange: (memberId, isAdmin) => changeRole(memberId, SPACE_ROLE.Admin, isAdmin),
      onRemove: removeActor,
    },
    organizationAdmin: {
      members: membersOfType(ACTOR_TYPE.Organization),
      onLeadChange: (memberId, isLead) => changeRole(memberId, SPACE_ROLE.Lead, isLead),
      onRemove: removeActor,
    },
    virtualContributorAdmin: {
      members: membersOfType(ACTOR_TYPE.VirtualContributor),
      onAdd: memberId => changeRole(memberId, SPACE_ROLE.Member, true),
      onRemove: removeActor,
    },
    membershipAdmin: {
      memberRoleDefinition: roleBounds(SPACE_ROLE.Member),
      leadRoleDefinition: roleBounds(SPACE_ROLE.Lead),
      applications,
      invitations,
      platformInvitations,
      onApplicationStateChange: applicationStateChange,
      onInvitationStateChange: invitationStateChange,
      onDeleteInvitation: deleteInvitation,
      onDeletePlatformInvitation: deletePlatformInvitation,
      onResendPlatformInvitation: resendPlatformInvitation,
    },
    permissions: {
      canInvite: gates.invite === true,
      canInviteOrganizations: gates.invite === true,
      canAddVirtualContributors: gates.virtualContributorPicker === true,
    },
    gates,
    loading: membersLoading || adminQuery.loading || loadingApplicationsAndInvitations,
    errored:
      (!skip && (!!membersQuery.error || membersPagingFailed || !!adminQuery.error)) ||
      erroredApplicationsAndInvitations,
  };
};

export default useCommunityAdmin;
