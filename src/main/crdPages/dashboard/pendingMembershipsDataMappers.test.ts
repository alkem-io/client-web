import { describe, expect, it } from 'vitest';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { mapOrgApplicationToCardData, mapOrgInvitationToCardData } from './pendingMembershipsDataMappers';

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

describe('mapOrgInvitationToCardData (062, T011)', () => {
  const baseItem = {
    id: 'inv-1',
    invitation: {
      id: 'invitation-1',
      extraRoles: [] as RoleName[],
      createdDate: new Date().toISOString(),
    },
    organization: {
      id: 'org-1',
      profile: { displayName: 'Acme Org', avatar: { uri: 'acme.png' } },
    },
  };

  it('maps id, organization name/avatar and a stable color', () => {
    // biome-ignore lint/suspicious/noExplicitAny: partial GraphQL fixture — only the mapped fields matter
    const card = mapOrgInvitationToCardData(baseItem as any, t, tCommon);
    expect(card.id).toBe('inv-1');
    expect(card.organizationName).toBe('Acme Org');
    expect(card.organizationAvatarUrl).toBe('acme.png');
    expect(card.color).toBeTruthy();
  });

  it('resolves the offered-role label key from extraRoles', () => {
    const associate = mapOrgInvitationToCardData(
      // biome-ignore lint/suspicious/noExplicitAny: partial GraphQL fixture
      { ...baseItem, invitation: { ...baseItem.invitation, extraRoles: [] } } as any,
      t,
      tCommon
    );
    expect(associate.offeredRoleLabel).toBe('pendingMemberships.orgAssociateCard.role.associate');

    const admin = mapOrgInvitationToCardData(
      // biome-ignore lint/suspicious/noExplicitAny: partial GraphQL fixture
      { ...baseItem, invitation: { ...baseItem.invitation, extraRoles: [RoleName.Admin] } } as any,
      t,
      tCommon
    );
    expect(admin.offeredRoleLabel).toBe('pendingMemberships.orgAssociateCard.role.associateAdmin');

    const owner = mapOrgInvitationToCardData(
      // biome-ignore lint/suspicious/noExplicitAny: partial GraphQL fixture
      { ...baseItem, invitation: { ...baseItem.invitation, extraRoles: [RoleName.Owner] } } as any,
      t,
      tCommon
    );
    expect(owner.offeredRoleLabel).toBe('pendingMemberships.orgAssociateCard.role.associateOwner');
  });

  it('resolves the relative-time label through the shared crd-common translator', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const card = mapOrgInvitationToCardData(
      // biome-ignore lint/suspicious/noExplicitAny: partial GraphQL fixture
      { ...baseItem, invitation: { ...baseItem.invitation, createdDate: twoDaysAgo } } as any,
      t,
      tCommon
    );
    expect(card.timeElapsed).toBe('2d ago');
    // Guards the actual defect: handing the card's own namespace to `formatTimeElapsed`
    // renders the raw key, because `common.time.*` is not in `crd-dashboard`.
    expect(card.timeElapsed).not.toContain('common.time');
  });
});

describe('mapOrgApplicationToCardData (062, T011)', () => {
  it('maps id, organization name/avatar/href and a stable color', () => {
    const card = mapOrgApplicationToCardData({
      id: 'app-1',
      application: { id: 'application-1', state: 'new', createdDate: new Date().toISOString(), nextEvents: [] },
      organization: {
        id: 'org-2',
        profile: { displayName: 'Beta Org', url: '/organization/beta', avatar: { uri: 'beta.png' } },
      },
      // biome-ignore lint/suspicious/noExplicitAny: partial GraphQL fixture — only the mapped fields matter
    } as any);
    expect(card).toMatchObject({
      id: 'app-1',
      organizationName: 'Beta Org',
      organizationAvatarUrl: 'beta.png',
      organizationHref: '/organization/beta',
    });
    expect(card.color).toBeTruthy();
  });
});
