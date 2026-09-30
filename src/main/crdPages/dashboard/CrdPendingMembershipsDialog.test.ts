import { describe, expect, it } from 'vitest';
import { ActorType } from '@/core/apollo/generated/graphql-schema';
import { classifyInvitations, resolveInvitationSpaceUri } from './CrdPendingMembershipsDialog';

type Fixture = { id: string; invitation: { actor?: { type: ActorType } } };

const invitation = (id: string, type: ActorType): Fixture => ({ id, invitation: { actor: { type } } });

describe('classifyInvitations (T014 — three buckets)', () => {
  it('splits a mixed list into user / organization / virtualContributor buckets', () => {
    const invitations = [
      invitation('u1', ActorType.User),
      invitation('o1', ActorType.Organization),
      invitation('vc1', ActorType.VirtualContributor),
      invitation('u2', ActorType.User),
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
    expect(resolveInvitationSpaceUri(ActorType.User, '/space/green-energy')).toBe('/space/green-energy');
  });

  it('returns undefined for an organization invitation — accept returns to the list, no navigation', () => {
    expect(resolveInvitationSpaceUri(ActorType.Organization, '/space/green-energy')).toBeUndefined();
  });

  it('returns undefined for a virtual contributor invitation (existing behavior, unchanged)', () => {
    expect(resolveInvitationSpaceUri(ActorType.VirtualContributor, '/space/green-energy')).toBeUndefined();
  });
});
