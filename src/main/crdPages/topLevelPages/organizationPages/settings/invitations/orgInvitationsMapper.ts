import type { OrgInvitationsQuery } from '@/core/apollo/generated/graphql-schema';
import { ActorType, RoleName } from '@/core/apollo/generated/graphql-schema';

export type OrgPendingInvitationRow = {
  id: string;
  spaceDisplayName: string;
  spaceUrl: string;
  invitedBy: string | null;
  createdDate: string;
  /** Whether the invitation also offers the Lead role, alongside the always-granted Member role. */
  role: 'member' | 'memberLead';
  welcomeMessage?: string;
  /** Root → target, target last (D7) — every Space the organization joins on accept. */
  spacesToJoin: { displayName: string; url: string }[];
  /** Actions are only offered while the invitation is still `invited` (`nextEvents` contains `ACCEPT`). */
  canAct: boolean;
};

const toIsoString = (d: Date | string | undefined | null): string => {
  if (!d) return '';
  return d instanceof Date ? d.toISOString() : String(d);
};

/**
 * Pure mapper: the organization's own pending Space invitations from
 * `me.communityInvitations`, filtered to invitations addressed to this
 * organization (the same query also returns the current user's own user-kind
 * invitations — everything else must be excluded).
 */
export const mapOrgInvitations = (
  data: OrgInvitationsQuery | undefined,
  organizationId: string | undefined
): OrgPendingInvitationRow[] => {
  if (!data || !organizationId) return [];
  return data.me.communityInvitations
    .filter(
      inv =>
        inv.invitation.actor.type === ActorType.Organization &&
        inv.invitation.actor.id === organizationId &&
        // The tab lists open invitations only — 'invited' (actionable) and the
        // brief in-flight 'accepting' state; 'accepted'/'rejected' invitations
        // stay in the cache until the query refetches but no longer belong here.
        (inv.invitation.state === 'invited' || inv.invitation.state === 'accepting')
    )
    .map(inv => ({
      id: inv.id,
      spaceDisplayName: inv.spacePendingMembershipInfo.about.profile.displayName,
      spaceUrl: inv.spacePendingMembershipInfo.about.profile.url,
      invitedBy: inv.invitation.createdBy?.profile?.displayName ?? null,
      createdDate: toIsoString(inv.invitation.createdDate),
      role: inv.invitation.extraRoles.includes(RoleName.Lead) ? ('memberLead' as const) : ('member' as const),
      welcomeMessage: inv.invitation.welcomeMessage ?? undefined,
      spacesToJoin: inv.invitation.spacesToJoinOnAccept.map(space => ({
        displayName: space.profile.displayName,
        url: space.profile.url,
      })),
      canAct: inv.invitation.nextEvents.includes('ACCEPT'),
    }));
};
