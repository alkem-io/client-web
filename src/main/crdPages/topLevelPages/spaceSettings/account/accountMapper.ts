import type { SpaceAccountQuery } from '@/core/apollo/generated/graphql-schema';
import { ActorType, LicensingCredentialBasedPlanType, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import type {
  AccountHost,
  AccountHostType,
  AccountPlan,
  AccountVisibility,
} from '@/crd/components/space/settings/SpaceSettingsAccountView';

type SpaceData = NonNullable<SpaceAccountQuery['lookup']['space']>;
type PlatformData = SpaceAccountQuery['platform'];

export function mapAccountPlan(space: SpaceData, platform: PlatformData): AccountPlan | null {
  const subscription = space.activeSubscription;
  if (!subscription) return null;

  const plans = platform.licensingFramework.plans.filter(p => p.type === LicensingCredentialBasedPlanType.SpacePlan);

  // A credential the licensing framework has no plan for is still an active license — show it by its raw name.
  const matchedPlan = plans.find(p => p.licenseCredential === subscription.name);

  let daysLeft: number | null = null;
  if (subscription.expires) {
    const diff = new Date(subscription.expires).getTime() - Date.now();
    daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return {
    name: matchedPlan?.name ?? subscription.name,
    features: [],
    daysLeft,
  };
}

// Spec 045 FR-024b: the view translates plain values, never the raw enum.
const VISIBILITY: Record<SpaceVisibility, AccountVisibility> = {
  [SpaceVisibility.Active]: 'active',
  [SpaceVisibility.Archived]: 'archived',
  [SpaceVisibility.Demo]: 'demo',
  [SpaceVisibility.Inactive]: 'inactive',
};

export function mapAccountVisibility(visibility: SpaceVisibility | undefined): AccountVisibility | null {
  return visibility ? VISIBILITY[visibility] : null;
}

const HOST_TYPE: Partial<Record<ActorType, AccountHostType>> = {
  [ActorType.Organization]: 'organization',
  [ActorType.User]: 'user',
  [ActorType.VirtualContributor]: 'virtualContributor',
};

export function mapAccountHost(space: SpaceData): AccountHost | null {
  const provider = space.about.provider;
  if (!provider?.profile) return null;

  return {
    displayName: provider.profile.displayName,
    avatarUrl: provider.profile.avatar?.uri ?? null,
    type: HOST_TYPE[provider.type] ?? null,
  };
}
