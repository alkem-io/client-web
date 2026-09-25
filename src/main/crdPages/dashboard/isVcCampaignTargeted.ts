import { RoleName } from '@/core/apollo/generated/graphql-schema';

/**
 * Whether the viewer is targeted by the Virtual Contributor campaign (the
 * dashboard offer to create a VC).
 *
 * workspace#027 Slice A: `FEATURE_VC_CAMPAIGN` is the additive successor of
 * the legacy `PLATFORM_VC_CAMPAIGN`. Both are live until Slice B retires the
 * legacy credential, so either one targets the viewer. The VC entitlement is
 * a separate condition the callers still AND with this.
 */
export const isVcCampaignTargeted = (platformRoles: readonly RoleName[] | undefined): boolean =>
  platformRoles?.some(role => role === RoleName.PlatformVcCampaign || role === RoleName.FeatureVcCampaign) ?? false;
