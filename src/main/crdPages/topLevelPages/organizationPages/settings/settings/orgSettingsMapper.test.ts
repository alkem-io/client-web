import { describe, expect, it } from 'vitest';
import type { OrganizationSettingsQuery } from '@/core/apollo/generated/graphql-schema';
import { mapOrgSettings } from './orgSettingsMapper';

const buildData = (
  settings?: Partial<{ allowSpaceInvitations: boolean; allowApplications: boolean }>
): OrganizationSettingsQuery => ({
  lookup: {
    organization: {
      id: 'org-1',
      settings: {
        membership: {
          allowUsersMatchingDomainToJoin: true,
          allowSpaceInvitations: settings?.allowSpaceInvitations ?? true,
          allowApplications: settings?.allowApplications ?? true,
        },
        privacy: { contributionRolesPubliclyVisible: true },
      },
    },
  },
});

describe('mapOrgSettings — allowSpaceInvitations (T015)', () => {
  it('reads allowSpaceInvitations off the query when present', () => {
    expect(mapOrgSettings(buildData({ allowSpaceInvitations: false })).allowSpaceInvitations).toBe(false);
    expect(mapOrgSettings(buildData({ allowSpaceInvitations: true })).allowSpaceInvitations).toBe(true);
  });

  it('defaults allowSpaceInvitations to true when data is missing (D10 — server backfill default)', () => {
    expect(mapOrgSettings(undefined).allowSpaceInvitations).toBe(true);
  });

  it('still maps the pre-existing membership/privacy fields unchanged', () => {
    const mapped = mapOrgSettings(buildData());
    expect(mapped.allowUsersMatchingDomainToJoin).toBe(true);
    expect(mapped.contributionRolesPubliclyVisible).toBe(true);
  });

  it('reads allowApplications off the query when present, defaulting to true (062)', () => {
    expect(mapOrgSettings(buildData({ allowApplications: false })).allowApplications).toBe(false);
    expect(mapOrgSettings(buildData({ allowApplications: true })).allowApplications).toBe(true);
    expect(mapOrgSettings(undefined).allowApplications).toBe(true);
  });
});
