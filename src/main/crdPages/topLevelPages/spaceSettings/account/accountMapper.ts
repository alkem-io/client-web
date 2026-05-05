import type { SpaceAccountQuery } from '@/core/apollo/generated/graphql-schema';
import { LicensingCredentialBasedPlanType } from '@/core/apollo/generated/graphql-schema';
import type { AccountHost, AccountPlan } from '@/crd/components/space/settings/SpaceSettingsAccountView';

type SpaceData = NonNullable<SpaceAccountQuery['lookup']['space']>;
type PlatformData = SpaceAccountQuery['platform'];

export function mapAccountPlan(space: SpaceData, platform: PlatformData): AccountPlan | null {
  const subscription = space.activeSubscription;
  if (!subscription) return null;

  const plans = platform.licensingFramework.plans.filter(p => p.type === LicensingCredentialBasedPlanType.SpacePlan);

  const matchedPlan = plans.find(p => p.licenseCredential === subscription.name);
  if (!matchedPlan) return null;

  let daysLeft: number | null = null;
  if (subscription.expires) {
    const diff = new Date(subscription.expires).getTime() - Date.now();
    daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return {
    name: matchedPlan.name,
    features: [],
    daysLeft,
  };
}

export function mapAccountHost(space: SpaceData): AccountHost | null {
  const provider = space.about.provider;
  if (!provider?.profile) return null;

  return {
    displayName: provider.profile.displayName,
    avatarUrl: provider.profile.avatar?.uri ?? null,
    type: provider.type,
  };
}
