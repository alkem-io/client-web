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
  /** Pre-localized "Create" button label. */
  createButtonLabel: string;
  onCreate: () => void;
  items: AccountResourceCardItem[];
};

/** The shared contributor-account view shape. Both User Account and Org Account map to this. */
export type ContributorAccountViewProps = {
  /** Pre-localized help-banner copy. */
  helpBannerLabel: string;
  groups: AccountResourceGroup[];
  loading: boolean;
};
