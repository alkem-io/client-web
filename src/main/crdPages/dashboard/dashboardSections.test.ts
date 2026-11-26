import { describe, expect, it } from 'vitest';
import { RoleName } from '@/core/apollo/generated-v2/legacy-vocabulary';
import {
  type DashboardSpace,
  mapHostSection,
  mapLastActiveSection,
  mapLeadAdminSection,
  mapMostActivitySection,
} from './dashboardDataMappers';

type SpaceOpts = {
  name?: string;
  isPublic?: boolean;
  depth?: number;
  activityScore?: number | null;
  url?: string | null;
};

// The native V2DashboardSpaceCard (+ activityScore where the section reads it).
const makeSpace = (id: string, opts: SpaceOpts = {}): DashboardSpace & { activityScore?: number | null } => ({
  id,
  url: opts.url === undefined ? `/space/${id}` : opts.url,
  depth: opts.depth ?? 0,
  isContentPublic: opts.isPublic ?? true,
  activityScore: opts.activityScore === undefined ? 0 : opts.activityScore,
  about: {
    displayName: opts.name ?? id,
    card: { file: { id: `card-${id}`, url: `/card/${id}` } },
  },
});

const daysAgo = (now: Date, days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

describe('mapLastActiveSection (Section 1, Viewer.recentSpaces L011)', () => {
  const now = new Date('2026-07-30T12:00:00Z');

  it('keeps Spaces participated in within 30 days and drops older ones, most-recent first', () => {
    const recentSpaces = [
      { space: makeSpace('recent'), lastParticipatedAt: daysAgo(now, 3) },
      { space: makeSpace('stale'), lastParticipatedAt: daysAgo(now, 45) },
      { space: makeSpace('older-recent'), lastParticipatedAt: daysAgo(now, 20) },
    ];

    const result = mapLastActiveSection(recentSpaces, undefined, undefined, now);

    expect(result.map(c => c.id)).toEqual(['recent', 'older-recent']);
    expect(result[0]).toMatchObject({ href: '/space/recent', bannerUrl: '/card/recent', isPrivate: false });
  });

  it('pins the home Space (Viewer.homeSpace) first and never duplicates it among the recent items', () => {
    const recentSpaces = [
      { space: makeSpace('home'), lastParticipatedAt: daysAgo(now, 1) },
      { space: makeSpace('other'), lastParticipatedAt: daysAgo(now, 2) },
    ];

    const result = mapLastActiveSection(recentSpaces, makeSpace('home'), 'home', now);

    expect(result.map(c => c.id)).toEqual(['home', 'other']);
    expect(result[0].isHomeSpace).toBe(true);
  });

  it('excludes entries whose participation time is not a date', () => {
    const recentSpaces = [
      { space: makeSpace('no-date'), lastParticipatedAt: 'not-a-date' },
      { space: makeSpace('dated'), lastParticipatedAt: daysAgo(now, 1) },
    ];

    const result = mapLastActiveSection(recentSpaces, undefined, undefined, now);

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

  it('a space without a canonical destination is an error, not a card linking nowhere', () => {
    expect(() => mapMostActivitySection([makeSpace('no-url', { url: null })])).toThrow(
      'Dashboard space no-url has no canonical destination'
    );
  });
});

describe('mapLeadAdminSection (Section 3, flat User.memberships)', () => {
  it('keeps only Lead/Admin Spaces at depth 0/1, ordered by activity (zeros last)', () => {
    const memberships = [
      { roles: [RoleName.Member, RoleName.Lead], space: makeSpace('lead-hi', { activityScore: 10 }) },
      { roles: [RoleName.Admin], space: makeSpace('admin-sub', { depth: 1, activityScore: 0 }) },
      { roles: [RoleName.Member], space: makeSpace('member-sub', { depth: 1, activityScore: 99 }) },
      { roles: [RoleName.Admin], space: makeSpace('admin-mid', { activityScore: 5 }) },
    ];

    const result = mapLeadAdminSection(memberships);

    // member-sub excluded (not lead/admin); ordered by activityScore desc, zero last
    expect(result.map(c => c.id)).toEqual(['lead-hi', 'admin-mid', 'admin-sub']);
  });

  it('excludes depth-2 Spaces even when the member leads them', () => {
    const memberships = [
      { roles: [RoleName.Lead], space: makeSpace('l0', { activityScore: 1 }) },
      { roles: [RoleName.Lead], space: makeSpace('l2', { depth: 2, activityScore: 100 }) },
    ];

    expect(mapLeadAdminSection(memberships).map(c => c.id)).toEqual(['l0']);
  });
});

describe('mapHostSection (Section 4, Viewer.account.hosted.spaces)', () => {
  it('orders account Spaces by activity score, zeros and unreadable scores last', () => {
    const result = mapHostSection([
      makeSpace('quiet', { activityScore: 0 }),
      makeSpace('busy', { activityScore: 42 }),
      makeSpace('unscored', { activityScore: null }),
      makeSpace('mid', { activityScore: 7 }),
    ]);

    expect(result.map(c => c.id)).toEqual(['busy', 'mid', 'quiet', 'unscored']);
  });
});
