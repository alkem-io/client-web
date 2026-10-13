import { RoleName } from '@/core/apollo/generated/graphql-schema';

/**
 * Whether the viewer is targeted by the Virtual Contributor campaign (the
 * dashboard offer to create a VC).
 *
 * workspace#027: `FEATURE_VC_CAMPAIGN` is the successor of the legacy
 * `PLATFORM_VC_CAMPAIGN`, retired at Slice B (T013/T077). The VC entitlement is
 * a separate condition the callers still AND with this.
 */
export const isVcCampaignTargeted = (platformRoles: readonly RoleName[] | undefined): boolean =>
  platformRoles?.some(role => role === RoleName.FeatureVcCampaign) ?? false;
