import { LicenseEntitlementType } from '../../../../core/apollo/generated/graphql-schema';

type Entitlement = {
  id: string;
  type: LicenseEntitlementType;
  enabled: boolean;
};

export const filterAndMapEnabledEntitlements = (entitlements: Entitlement[] = []): LicenseEntitlementType[] => {
  return entitlements
    .filter(entitlement => entitlement.enabled) // Filter enabled entitlements
    .map(entitlement => entitlement.type); // Map to their types
};
