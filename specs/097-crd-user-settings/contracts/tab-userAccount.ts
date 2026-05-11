/**
 * User Account tab — view contract.
 * Reuses the shared `ContributorAccountView` (same view used by Org Account, Story 9).
 * See data-model.md "User Story 2" for field-level details.
 *
 * The four `onCreate` callbacks on `AccountResourceGroup` (below) open CRD creation dialogs
 * (FR-034 / research Decision #3) — never a route navigation. The dialog prop contracts live in
 * `./account-create-dialogs.ts`; the integration page (`CrdUserAccountTab`) mounts the dialogs and
 * owns their Apollo wiring (the shared `useCrdCreate*` hooks). The `manage` kebab action navigates
 * to the resource's existing settings URL; the `delete` kebab action opens a CRD `ConfirmationDialog`
 * then fires the existing delete mutation.
 */

import type { LucideIcon } from 'lucide-react';

export type AccountKebabAction = {
  /**
   * Discriminator that integration mappers populate to wire `onClick`:
   * `view` → navigate to the resource's public URL; `manage` → navigate to the resource's
   * existing settings URL; `transfer` → existing transfer flow; `delete` → open the CRD
   * `ConfirmationDialog` then fire the existing delete mutation.
   */
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
