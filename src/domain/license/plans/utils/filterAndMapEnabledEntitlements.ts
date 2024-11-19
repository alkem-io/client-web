import { LicenseEntitlementType } from '../../../../core/apollo/generated/graphql-schema';

type Entitlement = {
  id: string;
  type: LicenseEntitlementType;
  enabled: boolean;
  isAvailable: boolean;
};

export const filterAndMapEnabledEntitlements = (entitlements: Entitlement[] = []): LicenseEntitlementType[] => {
  return entitlements
    .filter(entitlement => entitlement.enabled) // Filter enabled entitlements
    .filter(entitlement => entitlement.isAvailable) // Filter available entitlements
    .map(entitlement => entitlement.type); // Map to their types
};
