// Activity-view preference resolution for the home dashboard (spec 024).
// Legacy device-local view choice + a per-device flag so the account preference is
// seeded from it at most once (FR-026).
export const LEGACY_VIEW_KEY = 'dashboardView';
export const SEED_FLAG_KEY = 'dashboardViewSeeded';

/**
 * The effective activity-view flag: a local override (instant toggle feedback) wins,
 * then the persisted account setting, then the default — Activity view on (FR-024).
 */
export const resolveActivityView = (override: boolean | null, setting: boolean | null | undefined): boolean =>
  override ?? setting ?? true;

/**
 * Whether a legacy device-local `dashboardView === 'SPACES'` choice should seed the
 * account preference to the non-activity view (FR-026). Only seeds when the account has
 * no explicit non-activity value yet; an ACTIVITY / unset legacy value already matches
 * the default, so no write is needed.
 */
export const shouldSeedFromLegacy = (legacy: string | null, setting: boolean | null | undefined): boolean =>
  legacy === 'SPACES' && setting !== false;
