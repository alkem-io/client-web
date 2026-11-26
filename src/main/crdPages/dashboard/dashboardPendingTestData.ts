import type { PendingMembershipRequest } from '@/domain/community/pendingMembership/PendingMemberships';

const fileRef = (id: string, url: string) => ({
  __typename: 'FileRef' as const,
  file: { __typename: 'File' as const, id, url },
});

type SpaceOpts = { depth?: number; avatar?: string; card?: string; url?: string | null };

/** A native Viewer.pendingInvitations / pendingApplications entry (V2PendingMembershipRequest) for a space. */
export const pendingSpaceRequest = (
  id: string,
  { depth = 0, avatar, card, url = '/a-space' }: SpaceOpts = {},
  overrides: Partial<PendingMembershipRequest> = {}
): PendingMembershipRequest => ({
  __typename: 'MembershipRequest',
  id,
  state: 'INVITED',
  createdAt: '2026-11-20T10:00:00Z',
  message: null,
  roles: ['member'],
  availableEvents: ['ACCEPT', 'REJECT'],
  wouldJoin: [],
  resource: { __typename: 'Space', id: `space-${id}`, entityType: 'space' },
  space: {
    __typename: 'Space',
    id: `space-${id}`,
    url,
    depth,
    tags: ['green'],
    about: {
      __typename: 'About',
      displayName: 'A Space',
      tagline: 'Tagline',
      avatar: avatar ? fileRef(`a-${id}`, avatar) : null,
      card: card ? fileRef(`c-${id}`, card) : null,
    },
  },
  actor: { __typename: 'User', id: 'user-1', actorType: 'user', about: { __typename: 'About', displayName: 'Me' } },
  createdBy: { __typename: 'User', id: 'inviter', about: { __typename: 'About', displayName: 'Jane Doe' } },
  ...overrides,
});

/** A native request addressed to an organization (MembershipRequest.resource, entityType organization). */
export const pendingOrganizationRequest = (
  id: string,
  overrides: Partial<PendingMembershipRequest> = {}
): PendingMembershipRequest => ({
  ...pendingSpaceRequest(id),
  space: null,
  resource: {
    __typename: 'Organization',
    id: `org-${id}`,
    entityType: 'organization',
    url: `/organization/org-${id}`,
    about: { __typename: 'About', displayName: 'Acme Org', avatar: fileRef('acme', 'acme.png') },
  },
  ...overrides,
});
