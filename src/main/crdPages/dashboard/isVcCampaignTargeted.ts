import { LicenseEntitlementType, RoleName } from '@/core/apollo/generated-v2/legacy-vocabulary';

/**
 * Whether the viewer is targeted by the Virtual Contributor campaign (the
 * dashboard offer to create a VC).
 *
 * workspace#027: `FEATURE_VC_CAMPAIGN` is the successor of the legacy
 * `PLATFORM_VC_CAMPAIGN`, retired at Slice B (T013/T077). The VC entitlement is
 * a separate condition the callers still AND with this.
 */
export const isVcCampaignTargeted = (platformRoles: readonly string[] | undefined): boolean =>
  platformRoles?.some(role => role === RoleName.FeatureVcCampaign) ?? false;

type CanCreate = { kind: string; byEntitlement: ReadonlyArray<{ name: string; allowed: boolean }> };

/**
 * The campaign's entitlement condition (screens-dispositions.tsv:16196): the viewer's own account has
 * account-virtual-contributor available, read as AccountSummary.canCreate[virtual_contributor].byEntitlement
 * (client-repoint.md Licensing: legacy availableEntitlements meant remaining capacity).
 */
export const isVcCreationAvailable = (canCreate: readonly CanCreate[] | undefined): boolean =>
  canCreate?.some(
    verdict =>
      verdict.kind === 'virtual_contributor' &&
      verdict.byEntitlement.some(
        entitlement => entitlement.name === LicenseEntitlementType.AccountVirtualContributor && entitlement.allowed
      )
  ) ?? false;
