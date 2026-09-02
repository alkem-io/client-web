import type { OrganizationSettingsQuery } from '@/core/apollo/generated/graphql-schema';

export type OrgSettingsMappedData = {
  /** `settings.membership.allowUsersMatchingDomainToJoin`. */
  allowUsersMatchingDomainToJoin: boolean;
  /** `settings.privacy.contributionRolesPubliclyVisible`. */
  contributionRolesPubliclyVisible: boolean;
};

/**
 * Pure mapper: extracts the Org Settings tab's two switch values from
 * `useOrganizationSettingsQuery`. There is NO Design System toggle on this
 * tab (FR-132 — User-only).
 */
export const mapOrgSettings = (data: OrganizationSettingsQuery | undefined): OrgSettingsMappedData => {
  const settings = data?.lookup.organization?.settings;
  return {
    allowUsersMatchingDomainToJoin: settings?.membership?.allowUsersMatchingDomainToJoin ?? false,
    contributionRolesPubliclyVisible: settings?.privacy?.contributionRolesPubliclyVisible ?? false,
  };
};
