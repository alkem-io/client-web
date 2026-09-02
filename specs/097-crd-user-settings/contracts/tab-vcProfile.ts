/**
 * VC Profile tab — view contract.
 *
 * Save model: same per-section explicit-save pattern User Profile and Org
 * Profile use (Decision #2 in research.md). Each section drives one
 * `FieldFooter` with idle / saving / saved / error state from the integration
 * hook. On success the "Saved!" indicator flashes for `SAVED_FLASH_MS = 1800`
 * before returning to idle. On failure the section stays dirty with typed
 * values preserved.
 *
 * Mirrors the existing MUI `VirtualContributorForm`
 * (`src/domain/community/virtualContributorAdmin/vcSettingsPage/VirtualContributorForm.tsx`)
 * — same fields, same mutations (`updateVirtualContributor`,
 * `createReferenceOnProfile`, `updateReference`, `deleteReference`,
 * `createTagsetOnProfile`, `uploadImageOnVisual`), restyled.
 *
 * Reuses the shared types from `tab-userProfile.ts`:
 * - `SectionSaveStatus`
 * - `EditableSectionProps`
 * - `AvatarColumnProps`
 * - `PendingAvatarCrop`
 * - `ReferenceRow` / `ReferencesSectionProps`
 * - `PendingReferenceDeleteProps`
 *
 * Decision #17 in research.md (VC engine-conditional Settings sub-sections)
 * does NOT apply here — Profile fields are engine-agnostic.
 */

import type {
  AvatarColumnProps,
  EditableSectionProps,
  PendingReferenceDeleteProps,
  ReferencesSectionProps,
} from './tab-userProfile';

/**
 * Read-only display rows in the right column: host organization, body of
 * knowledge. The VC profile presents these as informational rows (no edit
 * affordance) — same wording the MUI `VirtualContributorForm` shows.
 */
export type ReadOnlyMetadataRowProps = {
  label: string;
  value: string;
  /** Optional href when the value links to another page (e.g. host org). */
  href?: string;
};

/**
 * Sections of the VC Profile tab.
 *
 * Compared to User Profile: VC has no `firstName` / `lastName` / `email` /
 * `phone` / `skills` (single `keywords` tagset only, parity with MUI).
 */
export type VcProfileSections = {
  // Identity (3 single-field sections)
  displayName: EditableSectionProps;
  tagline: EditableSectionProps;
  description: EditableSectionProps;

  /**
   * `Keywords` profile tagset. Single per-section save — fires
   * `updateVirtualContributor` patching only the Keywords tagset entry, or
   * `createTagsetOnProfile({ name: 'Keywords' })` on first save when the
   * tagset doesn't yet exist. Mirrors the existing MUI
   * `VirtualContributorForm` tagset segment.
   */
  keywords: EditableSectionProps;

  // Social Links / References — one list-managed section (parity with User
  // Profile References).
  references: ReferencesSectionProps;
};

/** Top-level view contract for the VC Profile tab. */
export type VcProfileViewProps = {
  sections: VcProfileSections;
  avatarColumn: AvatarColumnProps;
  /** Two read-only rows: host org + body-of-knowledge name. Hidden when absent. */
  metadata: {
    host?: ReadOnlyMetadataRowProps;
    bodyOfKnowledge?: ReadOnlyMetadataRowProps;
  };
  pendingReferenceDelete: PendingReferenceDeleteProps;
  loading: boolean;
};
