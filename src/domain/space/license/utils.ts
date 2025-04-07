import { LicenseEntitlementType } from '@/core/apollo/generated/graphql-schema';

type SpaceEntitlementType =
  | LicenseEntitlementType.SpaceFree
  | LicenseEntitlementType.SpacePlus
  | LicenseEntitlementType.SpacePremium;

export const getSpaceSubscriptionLevel = (
  availableEntitlements: LicenseEntitlementType[]
): SpaceEntitlementType | undefined => {
  if (availableEntitlements.length === 0) {
    return undefined;
  }

  const targetTypes = [
    LicenseEntitlementType.SpacePremium,
    LicenseEntitlementType.SpacePlus,
    LicenseEntitlementType.SpaceFree,
  ];
  const customOrder = [
    LicenseEntitlementType.SpacePremium,
    LicenseEntitlementType.SpacePlus,
    LicenseEntitlementType.SpaceFree,
  ];
  // Filter and sort
  const [firstSortedType] = availableEntitlements
    .filter(item => targetTypes.includes(item))
    .sort((a, b) => customOrder.indexOf(a) - customOrder.indexOf(b));

  return firstSortedType as SpaceEntitlementType;
};
