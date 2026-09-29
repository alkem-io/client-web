import { describe, expect, test } from 'vitest';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { isVcCampaignTargeted } from './isVcCampaignTargeted';

describe('isVcCampaignTargeted (workspace#027 Slice A — legacy and successor both honoured)', () => {
  test('the legacy PLATFORM_VC_CAMPAIGN role still targets the campaign', () => {
    expect(isVcCampaignTargeted([RoleName.PlatformVcCampaign])).toBe(true);
  });

  test('the additive FEATURE_VC_CAMPAIGN successor targets the campaign on its own', () => {
    expect(isVcCampaignTargeted([RoleName.FeatureVcCampaign])).toBe(true);
  });

  test('any other role — including the other Feature roles — does not', () => {
    expect(isVcCampaignTargeted([RoleName.FeatureBetaTester, RoleName.PlatformUsersAdmin])).toBe(false);
    expect(isVcCampaignTargeted([])).toBe(false);
  });

  test('an unloaded role list is simply "not targeted", never a throw', () => {
    expect(isVcCampaignTargeted(undefined)).toBe(false);
  });
});
