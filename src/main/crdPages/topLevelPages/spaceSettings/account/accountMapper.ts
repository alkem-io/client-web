import { PlanScope, type SpaceSettingsAccountQuery } from '@/core/apollo/generated-v2/graphql-schema';
import type { AccountHost, AccountPlan } from '@/crd/components/space/settings/SpaceSettingsAccountView';

export type AccountSpace = Extract<NonNullable<SpaceSettingsAccountQuery['node']>, { __typename?: 'Space' }>;

/**
 * The space's active subscription, as legacy derives it: the unexpired SPACE plan assignment with the highest plan
 * sortOrder (screens-dispositions.tsv:16351; H-licensing-8: plans are matched by `assignment.plan`).
 */
export function mapAccountPlan(space: AccountSpace, now = Date.now()): AccountPlan | null {
  const active = (space.planAssignments ?? [])
    .filter(assignment => assignment.plan.scope === PlanScope.Space)
    .filter(assignment => !assignment.expiresAt || new Date(assignment.expiresAt).getTime() > now)
    .sort((a, b) => b.plan.sortOrder - a.plan.sortOrder)[0];
  if (!active) return null;

  let daysLeft: number | null = null;
  if (active.expiresAt) {
    const diff = new Date(active.expiresAt).getTime() - now;
    daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return {
    name: active.plan.name,
    features: [],
    daysLeft,
  };
}

/** The host card (screens-dispositions.tsv:5165): Space.host's About and its actorType. */
export function mapAccountHost(space: AccountSpace): AccountHost | null {
  const host = space.host;
  if (!host?.about) return null;

  return {
    displayName: host.about.displayName,
    avatarUrl: host.about.avatar?.file.url ?? null,
    type: host.actorType,
  };
}
