import { describe, expect, test } from 'vitest';
import { mapDashboardMemberships } from './dashboardV2DataMapper';

// One flat SpaceMembership of V2DashboardMemberships (User.memberships).
const space = (id: string, parent: string | null = null, roles = ['member'], url: string | null = `/spaces/${id}`) => ({
  roles,
  space: {
    id,
    url,
    depth: parent ? 1 : 0,
    isContentPublic: true,
    about: {
      displayName: id,
      tagline: `${id} tagline`,
      avatar: { file: { id: `avatar-${id}`, url: `/avatar/${id}` } },
      card: { file: { id: `card-${id}`, url: `/card/${id}` } },
    },
    parent: parent ? { id: parent } : null,
  },
});

describe('legacy dashboard membership data bridge', () => {
  test('a missing canonical URL retains membership metadata without a fabricated destination', () => {
    const [item] = mapDashboardMemberships([space('metadata-only', null, ['member'], null)]);
    expect(item).toMatchObject({
      id: 'metadata-only',
      name: 'metadata-only',
      tagline: 'metadata-only tagline',
      roles: ['member'],
    });
    expect(item.href).toBeUndefined();
  });
  // fed85 dashboardDataMappers.tsx:464–494: fixed role priority and banner/child-avatar selection.
  test('keeps the legacy role ordering and visual rules when the parent arrives after its child', () => {
    const [root] = mapDashboardMemberships([
      space('child', 'root', ['member', 'admin', 'lead', 'admin', 'audience']),
      space('root'),
    ]);
    expect(root.id).toBe('root');
    expect(root.image).toBe('/card/root');
    expect(root.children).toEqual([
      expect.objectContaining({ id: 'child', image: '/avatar/child', roles: ['admin', 'lead', 'member'] }),
    ]);
  });

  // fed85 dashboardDataMappers.tsx:494–499: map preserves root and sibling order.
  test('preserves root and sibling ordering', () => {
    const roots = mapDashboardMemberships([
      space('second', 'root'),
      space('other-root'),
      space('root'),
      space('first', 'root'),
    ]);
    expect(roots.map(item => item.id)).toEqual(['other-root', 'root']);
    expect(roots[1].children?.map(item => item.id)).toEqual(['second', 'first']);
  });
});
