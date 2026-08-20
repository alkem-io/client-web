import { describe, expect, it } from 'vitest';
import { RoleName, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import {
  mapHostSection,
  mapLastActiveSection,
  mapLeadAdminSection,
  mapMostActivitySection,
} from './dashboardDataMappers';

type SpaceOpts = {
  name?: string;
  isPublic?: boolean;
  level?: SpaceLevel;
  activityScore?: number;
  roles?: string[];
};

const makeSpace = (id: string, opts: SpaceOpts = {}) => ({
  id,
  level: opts.level ?? SpaceLevel.L0,
  activityScore: opts.activityScore ?? 0,
  about: {
    isContentPublic: opts.isPublic ?? true,
    profile: { displayName: opts.name ?? id, url: `/space/${id}` },
  },
  community: opts.roles ? { roleSet: { myRoles: opts.roles } } : undefined,
});

const daysAgo = (now: Date, days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

describe('mapLastActiveSection (Section 1)', () => {
  const now = new Date('2026-07-30T12:00:00Z');

  it('keeps Spaces active within 30 days and drops older ones, most-recent first', () => {
    const mySpaces = [
      { space: makeSpace('recent'), latestActivity: { createdDate: daysAgo(now, 3) } },
      { space: makeSpace('stale'), latestActivity: { createdDate: daysAgo(now, 45) } },
      { space: makeSpace('older-recent'), latestActivity: { createdDate: daysAgo(now, 20) } },
    ];

    const result = mapLastActiveSection(mySpaces, undefined, undefined, now);

    expect(result.map(c => c.id)).toEqual(['recent', 'older-recent']);
  });

  it('pins the home Space first and never duplicates it among the recent items', () => {
    const home = makeSpace('home');
    const mySpaces = [
      { space: makeSpace('home'), latestActivity: { createdDate: daysAgo(now, 1) } },
      { space: makeSpace('other'), latestActivity: { createdDate: daysAgo(now, 2) } },
    ];

    const result = mapLastActiveSection(mySpaces, home, 'home', now);

    expect(result.map(c => c.id)).toEqual(['home', 'other']);
    expect(result[0].isHomeSpace).toBe(true);
  });

  it('excludes entries with no activity date', () => {
    const mySpaces = [
      { space: makeSpace('no-date'), latestActivity: null },
      { space: makeSpace('dated'), latestActivity: { createdDate: daysAgo(now, 1) } },
    ];

    const result = mapLastActiveSection(mySpaces, undefined, undefined, now);

    expect(result.map(c => c.id)).toEqual(['dated']);
  });
});

describe('mapMostActivitySection (Section 2)', () => {
  it('maps the server-ordered ranking to cards, preserving order', () => {
    const result = mapMostActivitySection([makeSpace('a'), makeSpace('b')]);
    expect(result.map(c => c.id)).toEqual(['a', 'b']);
  });

  it('marks non-public Spaces as private', () => {
    const [card] = mapMostActivitySection([makeSpace('p', { isPublic: false })]);
    expect(card.isPrivate).toBe(true);
  });
});

describe('mapLeadAdminSection (Section 3)', () => {
  it('keeps only Lead/Admin Spaces, flattens L0+L1, orders by activity (zeros last)', () => {
    const memberships = [
      {
        space: makeSpace('lead-hi', { level: SpaceLevel.L0, activityScore: 10, roles: [RoleName.Lead] }),
        childMemberships: [
          {
            space: makeSpace('admin-sub', {
              level: SpaceLevel.L1,
              activityScore: 0,
              roles: [RoleName.Admin],
            }),
          },
          {
            space: makeSpace('member-sub', {
              level: SpaceLevel.L1,
              activityScore: 99,
              roles: [RoleName.Member],
            }),
          },
        ],
      },
      { space: makeSpace('admin-mid', { level: SpaceLevel.L0, activityScore: 5, roles: [RoleName.Admin] }) },
    ];

    const result = mapLeadAdminSection(memberships);

    // member-sub excluded (not lead/admin); ordered by activityScore desc, zero last
    expect(result.map(c => c.id)).toEqual(['lead-hi', 'admin-mid', 'admin-sub']);
  });

  it('excludes L2+ Spaces even when the member leads them', () => {
    const memberships = [
      {
        space: makeSpace('l0', { level: SpaceLevel.L0, activityScore: 1, roles: [RoleName.Lead] }),
        childMemberships: [
          { space: makeSpace('l2', { level: SpaceLevel.L2, activityScore: 100, roles: [RoleName.Lead] }) },
        ],
      },
    ];

    const result = mapLeadAdminSection(memberships);

    expect(result.map(c => c.id)).toEqual(['l0']);
  });
});

describe('mapHostSection (Section 4)', () => {
  it('orders account Spaces by activity score, zeros last', () => {
    const result = mapHostSection([
      makeSpace('quiet', { activityScore: 0 }),
      makeSpace('busy', { activityScore: 42 }),
      makeSpace('mid', { activityScore: 7 }),
    ]);

    expect(result.map(c => c.id)).toEqual(['busy', 'mid', 'quiet']);
  });
});
