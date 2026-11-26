import { describe, expect, it } from 'vitest';
import { classifyInvitations, resolveInvitationSpaceUri } from './CrdPendingMembershipsDialog';

// MembershipRequest.actor.actorType is the invited actor's type (user | organization | virtual_contributor).
type Fixture = { id: string; actor: { actorType: string } | null };

const invitation = (id: string, actorType: string): Fixture => ({ id, actor: { actorType } });

describe('classifyInvitations (T014 — three buckets)', () => {
  it('splits a mixed list into user / organization / virtualContributor buckets', () => {
    const invitations = [
      invitation('u1', 'user'),
      invitation('o1', 'organization'),
      invitation('vc1', 'virtual_contributor'),
      invitation('u2', 'user'),
    ];

    const { userInvitations, organizationInvitations, virtualContributorInvitations } =
      classifyInvitations(invitations);

    expect(userInvitations?.map(i => i.id)).toEqual(['u1', 'u2']);
    expect(organizationInvitations?.map(i => i.id)).toEqual(['o1']);
    expect(virtualContributorInvitations?.map(i => i.id)).toEqual(['vc1']);
  });

  it('passes undefined through unchanged in every bucket', () => {
    const { userInvitations, organizationInvitations, virtualContributorInvitations } = classifyInvitations(undefined);
    expect(userInvitations).toBeUndefined();
    expect(organizationInvitations).toBeUndefined();
    expect(virtualContributorInvitations).toBeUndefined();
  });
});

describe('resolveInvitationSpaceUri (T014 — org accept does not navigate)', () => {
  it('returns the space url for a user invitation', () => {
    expect(resolveInvitationSpaceUri('user', '/space/green-energy')).toBe('/space/green-energy');
  });

  it('returns undefined for an organization invitation — accept returns to the list, no navigation', () => {
    expect(resolveInvitationSpaceUri('organization', '/space/green-energy')).toBeUndefined();
  });

  it('returns undefined for a virtual contributor invitation (existing behavior, unchanged)', () => {
    expect(resolveInvitationSpaceUri('virtual_contributor', '/space/green-energy')).toBeUndefined();
  });

  it('returns undefined when the space has no route for the viewer', () => {
    expect(resolveInvitationSpaceUri('user', null)).toBeUndefined();
  });
});
