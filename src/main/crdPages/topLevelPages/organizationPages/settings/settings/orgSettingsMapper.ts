import type { OrganizationSettingsQuery } from '@/core/apollo/generated/graphql-schema';

export type OrgSettingsMappedData = {
  /** `settings.membership.allowUsersMatchingDomainToJoin`. */
  allowUsersMatchingDomainToJoin: boolean;
  /** `settings.privacy.contributionRolesPubliclyVisible`. */
  contributionRolesPubliclyVisible: boolean;
  /** `settings.membership.allowSpaceInvitations` — server backfill/`@AfterLoad` default is `true`; the client mirrors that default (D10, contract §5) rather than defaulting to `false` like the other switches. */
  allowSpaceInvitations: boolean;
};

/**
 * Pure mapper: extracts the Org Settings tab's switch values from
 * `useOrganizationSettingsQuery`. There is NO Design System toggle on this
 * tab (FR-132 — User-only).
 */
export const mapOrgSettings = (data: OrganizationSettingsQuery | undefined): OrgSettingsMappedData => {
  const settings = data?.lookup.organization?.settings;
  return {
    allowUsersMatchingDomainToJoin: settings?.membership?.allowUsersMatchingDomainToJoin ?? false,
    contributionRolesPubliclyVisible: settings?.privacy?.contributionRolesPubliclyVisible ?? false,
    allowSpaceInvitations: settings?.membership?.allowSpaceInvitations ?? true,
  };
};
