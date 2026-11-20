import { LicensingCredentialBasedPlanType } from '@/core/apollo/generated/graphql-schema';

/** One plan of the platform licensing framework, as the section needs it. */
export type LicensingPlan = {
  id: string;
  name: string;
  type: LicensingCredentialBasedPlanType;
  licenseCredential: string;
  sortOrder: number;
};

/** A plan the row currently holds — the badge shows `name`; `isFeatureFlag`
 * picks the outline tone so plans and feature flags read apart at a glance. */
export type ActivePlan = { id: string; name: string; isFeatureFlag: boolean };

const isFeatureFlag = (type: LicensingCredentialBasedPlanType) =>
  type === LicensingCredentialBasedPlanType.SpaceFeatureFlag ||
  type === LicensingCredentialBasedPlanType.AccountFeatureFlag;

/**
 * Resolves the subscriptions a space/account reports (by `licenseCredential`)
 * to the plans that grant them — the same matching the MUI dialogs use — in
 * the framework's sort order.
 */
export const resolveActivePlans = (
  plans: readonly LicensingPlan[],
  subscriptions: readonly { name: string }[] | undefined
): ActivePlan[] => {
  const held = new Set((subscriptions ?? []).map(subscription => subscription.name));
  return [...plans]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .filter(plan => held.has(plan.licenseCredential))
    .map(plan => ({ id: plan.id, name: plan.name, isFeatureFlag: isFeatureFlag(plan.type) }));
};

/** The plans an ACCOUNT dialog may offer (plans + feature flags scoped to accounts). */
export const accountPlanOptions = (plans: readonly LicensingPlan[]) =>
  [...plans]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .filter(
      plan =>
        plan.type === LicensingCredentialBasedPlanType.AccountPlan ||
        plan.type === LicensingCredentialBasedPlanType.AccountFeatureFlag
    )
    .map(plan => ({ id: plan.id, name: plan.name }));
