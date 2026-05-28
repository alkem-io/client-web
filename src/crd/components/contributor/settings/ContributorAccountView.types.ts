/**
 * Public types for `ContributorAccountView`. Plain TypeScript — no GraphQL
 * types, no Apollo imports, no MUI imports.
 *
 * Implements the contract documented in
 * `specs/097-crd-user-settings/contracts/tab-userAccount.ts`. Both User
 * Account (US2) and Org Account (US9) map their GraphQL data to this
 * shape via per-actor mappers.
 */

import type { LucideIcon } from 'lucide-react';

export type AccountKebabAction = {
  /** Discriminator that integration mappers populate to wire onClick to navigation. */
  kind: 'view' | 'manage' | 'transfer' | 'delete';
  /** Pre-localized label — view never calls `t()` for this. */
  label: string;
  icon: LucideIcon;
  onClick: () => void;
};

export type AccountResourceCardItem = {
  id: string;
  displayName: string;
  description?: string;
  /** Banner / avatar URL when available. */
  avatarUrl?: string;
  /** Deterministic accent color from `pickColorFromId` (used when avatarUrl absent). */
  color: string;
  /** Resource URL — used by the row name link. */
  href: string;
  actions: AccountKebabAction[];
};

/** Per-plan capacity breakdown — populated only for the spaces group (FR-033 / MUI parity). */
export type AccountSpacePlanCapacity = {
  free: { usage: number; limit: number };
  plus: { usage: number; limit: number };
  premium: { usage: number; limit: number };
};

export type AccountCapacity = {
  /** Sum across plans for Spaces; single-entitlement usage for the other groups. */
  usage: number;
  /** Sum across plans for Spaces; single-entitlement limit for the other groups. */
  limit: number;
  /**
   * When false AND usage === 0, the badge renders "Not available" with its
   * own tooltip. Matches the MUI `BlockHeader` `isAvailable` branch.
   */
  isAvailable: boolean;
  /** Spaces-only — drives the multi-line per-plan tooltip. */
  perPlan?: AccountSpacePlanCapacity;
};

export type AccountResourceGroup = {
  /**
   * Group key — drives layout variant (banner card grid for Spaces / VCs,
   * compact list with Empty Slot fallbacks for Innovation Packs, full
   * empty-state for Innovation Hubs).
   */
  groupId: 'spaces' | 'virtualContributors' | 'innovationPacks' | 'innovationHubs';
  /** Pre-localized section heading. */
  title: string;
  /** Visible only when the privilege resolves true. */
  canCreate: boolean;
  /**
   * True when the account's license still has an available entitlement for
   * this resource (any of `AccountSpaceFree/Plus/Premium` for Spaces; the
   * single matching entitlement for VC / Pack / Hub). Consumers gate the
   * `onCreate` callback on this — when false, the integration page should
   * redirect to the contact page rather than open the create dialog.
   */
  isEntitled: boolean;
  /** Pre-localized "Create" button label. */
  createButtonLabel: string;
  onCreate: () => void;
  items: AccountResourceCardItem[];
  /** Per-group capacity for the hover-tooltip badge; absent during loading or when the license is missing. */
  capacity?: AccountCapacity;
};

/** The shared contributor-account view shape. Both User Account and Org Account map to this. */
export type ContributorAccountViewProps = {
  /** Pre-localized help-banner copy. */
  helpBannerLabel: string;
  groups: AccountResourceGroup[];
  loading: boolean;
};
