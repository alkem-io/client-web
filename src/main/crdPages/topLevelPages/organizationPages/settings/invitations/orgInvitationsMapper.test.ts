import { describe, expect, it } from 'vitest';
import { ActorType, type OrgInvitationsQuery, RoleName } from '@/core/apollo/generated/graphql-schema';
import { mapOrgInvitations } from './orgInvitationsMapper';

const invitationResult = (
  overrides: Partial<OrgInvitationsQuery['me']['communityInvitations'][number]['invitation']> = {},
  actorId = 'org-1',
  actorType: ActorType = ActorType.Organization
): OrgInvitationsQuery['me']['communityInvitations'][number] => ({
  id: 'inv-1',
  spacePendingMembershipInfo: {
    id: 'space-1',
    level: 'L1' as OrgInvitationsQuery['me']['communityInvitations'][number]['spacePendingMembershipInfo']['level'],
    about: { id: 'about-1', profile: { id: 'p1', displayName: 'Green Energy', url: '/space/green-energy' } },
  },
  invitation: {
    id: 'inv-1',
    welcomeMessage: 'Welcome!',
    suggestedLanguage: undefined,
    extraRoles: [],
    invitedToParent: false,
    nextEvents: ['ACCEPT', 'REJECT'],
    state: 'invited',
    createdDate: new Date('2026-01-01T00:00:00.000Z'),
    createdBy: { id: 'u1', profile: { id: 'p2', displayName: 'Alice' } },
    actor: { id: actorId, type: actorType },
    spacesToJoinOnAccept: [
      { id: 'space-1', profile: { id: 'p1', displayName: 'Green Energy', url: '/space/green-energy' } },
    ],
    ...overrides,
  },
});

const buildData = (invitations: OrgInvitationsQuery['me']['communityInvitations']): OrgInvitationsQuery => ({
  lookup: { organization: { id: 'org-1', authorization: { id: 'auth-1', myPrivileges: [] } } },
  me: { id: 'me-1', communityInvitations: invitations },
});

describe('mapOrgInvitations', () => {
  it('returns [] when data or organizationId is missing', () => {
    expect(mapOrgInvitations(undefined, 'org-1')).toEqual([]);
    expect(mapOrgInvitations(buildData([invitationResult()]), undefined)).toEqual([]);
  });

  it('filters to invitations addressed to this organization only', () => {
    const data = buildData([
      invitationResult({}, 'org-1', ActorType.Organization),
      invitationResult({}, 'org-2', ActorType.Organization),
      invitationResult({}, 'org-1', ActorType.User),
    ]);
    const rows = mapOrgInvitations(data, 'org-1');
    expect(rows).toHaveLength(1);
  });

  it('maps role to "member" when extraRoles has no Lead, "memberLead" otherwise', () => {
    const memberOnly = mapOrgInvitations(buildData([invitationResult({ extraRoles: [] })]), 'org-1');
    expect(memberOnly[0].role).toBe('member');

    const withLead = mapOrgInvitations(buildData([invitationResult({ extraRoles: [RoleName.Lead] })]), 'org-1');
    expect(withLead[0].role).toBe('memberLead');
  });

  it('maps invitedBy from createdBy.profile.displayName, or null when unknown', () => {
    const known = mapOrgInvitations(buildData([invitationResult()]), 'org-1');
    expect(known[0].invitedBy).toBe('Alice');

    const unknown = mapOrgInvitations(buildData([invitationResult({ createdBy: undefined })]), 'org-1');
    expect(unknown[0].invitedBy).toBeNull();
  });

  it('canAct is true only when nextEvents includes ACCEPT', () => {
    const acceptable = mapOrgInvitations(buildData([invitationResult({ nextEvents: ['ACCEPT', 'REJECT'] })]), 'org-1');
    expect(acceptable[0].canAct).toBe(true);

    const accepting = mapOrgInvitations(buildData([invitationResult({ nextEvents: ['ACCEPTED'] })]), 'org-1');
    expect(accepting[0].canAct).toBe(false);
  });

  it('excludes accepted/rejected invitations, keeps invited and accepting', () => {
    const data = buildData([
      invitationResult({ state: 'invited' }, 'org-1'),
      invitationResult({ state: 'accepting' }, 'org-1'),
      invitationResult({ state: 'accepted' }, 'org-1'),
      invitationResult({ state: 'rejected' }, 'org-1'),
    ]);
    const rows = mapOrgInvitations(data, 'org-1');
    expect(rows).toHaveLength(2);
  });

  it('maps spacesToJoinOnAccept in server order (root → target, target last)', () => {
    const data = buildData([
      invitationResult({
        spacesToJoinOnAccept: [
          { id: 'root', profile: { id: 'p-root', displayName: 'Root Space', url: '/space/root' } },
          { id: 'target', profile: { id: 'p-target', displayName: 'Target Subspace', url: '/space/root/target' } },
        ],
      }),
    ]);
    const rows = mapOrgInvitations(data, 'org-1');
    expect(rows[0].spacesToJoin).toEqual([
      { displayName: 'Root Space', url: '/space/root' },
      { displayName: 'Target Subspace', url: '/space/root/target' },
    ]);
  });
});
