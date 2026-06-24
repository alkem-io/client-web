import { describe, expect, test } from 'vitest';

/**
 * Mirrors the `canContactLeads` guard in CrdSpaceCommunityPage:
 *   const canContactLeads = leadUsers.length > 0 && Boolean(communityId);
 *
 * T018a (zero-leads edge case): when a space has no eligible user leads, the
 * "Contact the leads" entry must be unavailable so the dialog never opens with
 * an empty recipient set.
 */
const canContactLeads = (leadUserCount: number, communityId: string | undefined) =>
  leadUserCount > 0 && Boolean(communityId);

describe('canContactLeads guard (US3 / T018a)', () => {
  test('disabled when there are no user leads', () => {
    expect(canContactLeads(0, 'community-1')).toBe(false);
  });

  test('disabled when the community id is missing', () => {
    expect(canContactLeads(2, undefined)).toBe(false);
  });

  test('enabled only with at least one lead and a community id', () => {
    expect(canContactLeads(1, 'community-1')).toBe(true);
    expect(canContactLeads(3, 'community-1')).toBe(true);
  });
});
