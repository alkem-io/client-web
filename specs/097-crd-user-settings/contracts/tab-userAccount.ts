/**
 * User Account tab — view contract.
 * Reuses the shared `ContributorAccountView` (same view used by Org Account, Story 9).
 * See data-model.md "User Story 2" for field-level details.
 */

import type { LucideIcon } from 'lucide-react';

export type AccountKebabAction = {
  /** Discriminator that integration mappers populate to wire onClick to navigation. */
  kind: 'view' | 'manage' | 'transfer' | 'delete';
  label: string; // i18n
  icon: LucideIcon;
  onClick: () => void;
};

export type AccountResourceCardItem = {
  id: string;
  displayName: string;
  description?: string;
  avatarUrl?: string;
  /** Deterministic accent color from `pickColorFromId`. */
  color: string;
  /** Resource URL — used by the row name link. */
  href: string;
  actions: AccountKebabAction[];
};

export type AccountResourceGroup = {
  /** Group key for stable iteration. */
  groupId: 'spaces' | 'virtualContributors' | 'innovationPacks' | 'innovationHubs';
  title: string; // i18n
  /** Visible only when the privilege resolves true. */
  canCreate: boolean;
  createButtonLabel: string; // i18n
  onCreate: () => void;
  items: AccountResourceCardItem[];
  emptyStateLabel: string; // i18n — shown when items.length === 0 and the section isn't omitted
};

/** The shared contributor-account view shape. Both User Account and Org Account map to this. */
export type ContributorAccountViewProps = {
  helpBannerLabel: string; // i18n — "Here you can view your active resources..."
  groups: AccountResourceGroup[];
  loading: boolean;
};
