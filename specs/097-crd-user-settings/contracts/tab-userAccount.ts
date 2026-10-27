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

/**
 * Per-plan capacity breakdown — populated only for the `spaces` group.
 * Drives the multi-line per-plan hover tooltip (FR-034a — Spaces variant).
 */
export type AccountSpacePlanCapacity = {
  free: { usage: number; limit: number };
  plus: { usage: number; limit: number };
  premium: { usage: number; limit: number };
};

/**
 * Per-group capacity for the section header's `X/Y` badge + hover tooltip
 * (FR-034a). Source data: `account.license.entitlements[]` + the actor's
 * `canCreate*` authorization privilege.
 */
export type AccountCapacity = {
  /** Sum across Free/Plus/Premium for Spaces; single-entitlement usage for the other groups. */
  usage: number;
  /** Same — sum across plans for Spaces; single-entitlement limit for the other groups. */
  limit: number;
  /**
   * Mirror of MUI `BlockHeader`'s `isAvailable` — when `false` AND
   * `usage === 0`, the badge renders "Not available" with the
   * contact-team tooltip. Source: the actor's `canCreate*` privilege
   * (NOT `availableEntitlements` — the two diverge in practice).
   */
  isAvailable: boolean;
  /** Present only for `groupId === 'spaces'`. */
  perPlan?: AccountSpacePlanCapacity;
};

export type AccountResourceGroup = {
  /** Group key for stable iteration. */
  groupId: 'spaces' | 'virtualContributors' | 'innovationPacks' | 'innovationHubs';
  title: string; // i18n
  /** Visible only when the privilege resolves true. */
  canCreate: boolean;
  // createButtonLabel removed 2026-10-23 — no header Create button; the dashed tile is the only create affordance (spec Session 2026-10-23).
  onCreate: () => void;
  items: AccountResourceCardItem[];
  emptyStateLabel: string; // i18n — shown when items.length === 0 and the section isn't omitted
  /** Section-header `X/Y` badge + hover tooltip (FR-034a). Absent during loading or when the license is missing. */
  capacity?: AccountCapacity;
};

/** The shared contributor-account view shape. Both User Account and Org Account map to this. */
export type ContributorAccountViewProps = {
  // helpBannerLabel removed 2026-10-23 — no help banner; groups render as collapsible SettingsSection cards (spec Session 2026-10-23).
  groups: AccountResourceGroup[];
  loading: boolean;
};
