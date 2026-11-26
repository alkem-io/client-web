import { describe, expect, test } from 'vitest';
import { LicenseEntitlementType, RoleName } from '@/core/apollo/generated-v2/legacy-vocabulary';
import { isVcCampaignTargeted, isVcCreationAvailable } from './isVcCampaignTargeted';

describe('isVcCampaignTargeted (workspace#027 — native Viewer.platformRoles)', () => {
  test('the FEATURE_VC_CAMPAIGN successor (feature-vc-campaign) targets the campaign on its own', () => {
    expect(isVcCampaignTargeted([RoleName.FeatureVcCampaign])).toBe(true);
  });

  test('any other role — including the other Feature roles and legacy spellings — does not', () => {
    expect(isVcCampaignTargeted([RoleName.FeatureBetaTester, RoleName.PlatformUsersAdmin])).toBe(false);
    expect(isVcCampaignTargeted(['FEATURE_VC_CAMPAIGN'])).toBe(false);
    expect(isVcCampaignTargeted([])).toBe(false);
  });

  test('an unloaded role list is simply "not targeted", never a throw', () => {
    expect(isVcCampaignTargeted(undefined)).toBe(false);
  });
});

describe('isVcCreationAvailable (AccountSummary.canCreate byEntitlement, screens-dispositions.tsv:16196)', () => {
  const vc = (allowed: boolean, name: string = LicenseEntitlementType.AccountVirtualContributor) => [
    { kind: 'virtual_contributor', byEntitlement: [{ name, allowed }] },
  ];

  test('available only when account-virtual-contributor is allowed for the virtual_contributor kind', () => {
    expect(isVcCreationAvailable(vc(true))).toBe(true);
    expect(isVcCreationAvailable(vc(false))).toBe(false);
    expect(isVcCreationAvailable(vc(true, LicenseEntitlementType.AccountSpaceFree))).toBe(false);
    expect(
      isVcCreationAvailable([
        { kind: 'space', byEntitlement: [{ name: LicenseEntitlementType.AccountVirtualContributor, allowed: true }] },
      ])
    ).toBe(false);
    expect(isVcCreationAvailable(undefined)).toBe(false);
  });
});
