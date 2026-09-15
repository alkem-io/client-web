import { describe, expect, it } from 'vitest';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { mapOrgApplicationToCardData, mapOrgInvitationToCardData } from './pendingMembershipsDataMappers';

const t = ((key: string) => key) as (key: string, options?: Record<string, unknown>) => string;

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
    const card = mapOrgInvitationToCardData(baseItem as any, t);
    expect(card.id).toBe('inv-1');
    expect(card.organizationName).toBe('Acme Org');
    expect(card.organizationAvatarUrl).toBe('acme.png');
    expect(card.color).toBeTruthy();
  });

  it('resolves the offered-role label key from extraRoles', () => {
    const associate = mapOrgInvitationToCardData(
      // biome-ignore lint/suspicious/noExplicitAny: partial GraphQL fixture
      { ...baseItem, invitation: { ...baseItem.invitation, extraRoles: [] } } as any,
      t
    );
    expect(associate.offeredRoleLabel).toBe('pendingMemberships.orgAssociateCard.role.associate');

    const admin = mapOrgInvitationToCardData(
      // biome-ignore lint/suspicious/noExplicitAny: partial GraphQL fixture
      { ...baseItem, invitation: { ...baseItem.invitation, extraRoles: [RoleName.Admin] } } as any,
      t
    );
    expect(admin.offeredRoleLabel).toBe('pendingMemberships.orgAssociateCard.role.associateAdmin');

    const owner = mapOrgInvitationToCardData(
      // biome-ignore lint/suspicious/noExplicitAny: partial GraphQL fixture
      { ...baseItem, invitation: { ...baseItem.invitation, extraRoles: [RoleName.Owner] } } as any,
      t
    );
    expect(owner.offeredRoleLabel).toBe('pendingMemberships.orgAssociateCard.role.associateOwner');
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
