import { describe, expect, it } from 'vitest';
import { RoleName } from '@/core/apollo/generated-v2/legacy-vocabulary';
import { pendingOrganizationRequest, pendingSpaceRequest } from './dashboardPendingTestData';
import {
  mapOrgApplicationToCardData,
  mapOrgInvitationToCardData,
  mapPendingApplicationToCardData,
  mapPendingInvitationToCardData,
  mapPendingInvitationToDetailData,
} from './pendingMembershipsDataMappers';

/**
 * The card's own `crd-dashboard` translator. It deliberately does NOT resolve
 * `common.*`: those keys live in `crd-common`, and i18next has no `fallbackNS`, so a
 * real `crd-dashboard` `t` returns the raw key for them. Modelling that here is what
 * keeps the relative-time label from silently regressing to `common.time.short.timeAgo`.
 */
const t = ((key: string) => (key.startsWith('common.') ? `UNRESOLVED:${key}` : key)) as (
  key: string,
  options?: Record<string, unknown>
) => string;

/** The shared `crd-common` translator, which is the one that owns `common.time.short.*`. */
const tCommon = ((key: string, options?: Record<string, unknown>) => {
  if (key === 'common.time.short.justNow') return 'just now';
  if (key === 'common.time.short.timeAgo') return `${options?.time} ago`;
  return `${options?.count}${key.replace('common.time.short.', '').charAt(0)}`;
}) as (key: string, options?: Record<string, unknown>) => string;

describe('mapOrgInvitationToCardData (062, T011; MembershipRequest.resource = organization)', () => {
  it('maps id, organization name/avatar and a stable color', () => {
    const card = mapOrgInvitationToCardData(pendingOrganizationRequest('inv-1'), t, tCommon);
    expect(card.id).toBe('inv-1');
    expect(card.organizationName).toBe('Acme Org');
    expect(card.organizationAvatarUrl).toBe('acme.png');
    expect(card.color).toBeTruthy();
  });

  it('resolves the offered-role label key from the request roles', () => {
    const label = (roles: string[]) =>
      mapOrgInvitationToCardData(pendingOrganizationRequest('inv-1', { roles }), t, tCommon).offeredRoleLabel;
    expect(label([RoleName.Associate])).toBe('pendingMemberships.orgAssociateCard.role.associate');
    expect(label([RoleName.Associate, RoleName.Admin])).toBe('pendingMemberships.orgAssociateCard.role.associateAdmin');
    expect(label([RoleName.Associate, RoleName.Owner])).toBe('pendingMemberships.orgAssociateCard.role.associateOwner');
  });

  it('resolves the relative-time label through the shared crd-common translator', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const card = mapOrgInvitationToCardData(pendingOrganizationRequest('inv-1', { createdAt: twoDaysAgo }), t, tCommon);
    expect(card.timeElapsed).toBe('2d ago');
    // Guards the actual defect: handing the card's own namespace to `formatTimeElapsed`
    // renders the raw key, because `common.time.*` is not in `crd-dashboard`.
    expect(card.timeElapsed).not.toContain('common.time');
  });

  it('a request that is not addressed to an organization is an error', () => {
    expect(() => mapOrgInvitationToCardData(pendingSpaceRequest('inv-1'), t, tCommon)).toThrow(
      'is not addressed to an organization'
    );
  });
});

describe('mapOrgApplicationToCardData (062, T011)', () => {
  it('maps id, organization name/avatar/href and a stable color', () => {
    const card = mapOrgApplicationToCardData(pendingOrganizationRequest('app-1'));
    expect(card).toMatchObject({
      id: 'app-1',
      organizationName: 'Acme Org',
      organizationAvatarUrl: 'acme.png',
      organizationHref: '/organization/org-app-1',
    });
    expect(card.color).toBeTruthy();
  });
});

describe('space request cards and detail (Viewer.pendingInvitations / pendingApplications)', () => {
  it('maps a space invitation card from the request itself: inviter, organization, message excerpt', () => {
    const card = mapPendingInvitationToCardData(
      pendingSpaceRequest(
        'inv-1',
        { card: 'card.png' },
        {
          message: 'x'.repeat(120),
          actor: { __typename: 'Organization', id: 'org', actorType: 'organization', about: { displayName: 'Org' } },
        }
      ),
      tCommon as never
    );
    expect(card).toMatchObject({
      id: 'inv-1',
      spaceName: 'A Space',
      spaceAvatarUrl: 'card.png',
      senderName: 'Jane Doe',
      organizationName: 'Org',
    });
    expect(card.welcomeMessageExcerpt).toBe(`${'x'.repeat(100)}...`);
  });

  it('maps a space application card with tagline and href', () => {
    expect(mapPendingApplicationToCardData(pendingSpaceRequest('app-1'))).toMatchObject({
      id: 'app-1',
      tagline: 'Tagline',
      spaceHref: '/a-space',
    });
  });

  it('maps the invitation detail with the space tags and the inviter', () => {
    expect(mapPendingInvitationToDetailData(pendingSpaceRequest('inv-1'), 'en')).toMatchObject({
      spaceName: 'A Space',
      spaceTagline: 'Tagline',
      spaceTags: ['green'],
      spaceHref: '/a-space',
      senderName: 'Jane Doe',
    });
  });
});
