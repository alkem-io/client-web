/**
 * Org Profile tab — view contract (per-section save model — matches 045 About).
 *
 * Save model: per-section explicit save via `FieldFooter` per section. State
 * (`idle | saving | saved | error`) lives in the integration hook
 * (`useOrgProfileTabData`). On success a "Saved!" indicator flashes for
 * 1800 ms (`SAVED_FLASH_MS`) before returning to idle. On failure the section
 * stays dirty with the user's typed values preserved + an inline error
 * message that persists until the admin edits a field in the section again.
 *
 * Identical save semantics to User Profile — see `tab-userProfile.ts` and
 * data-model.md "User Story 8" for field-level details, research.md
 * Decision #2 for the state machine.
 *
 * Rewritten per spec clarification Q4 (2026-05-06) and tasks.md T066a
 * (per-section / SAVED_FLASH_MS = 1800 / Rule #9 reference deletion).
 */

import type {
  AvatarColumnProps,
  EditableSectionProps,
  PendingReferenceDeleteProps,
  ReferencesSectionProps,
} from './tab-userProfile';

/** Read-only verification status badge (FR-094). No edit affordance. */
export type OrgVerifiedBadgeProps = {
  /** Display label resolved from `Organization.verification.status`. */
  status: 'verified' | 'pending' | 'notVerified';
  /** Localized label rendered next to the badge icon. */
  label: string;
};

/**
 * Read-only Name ID — the URL slug, fixed after creation. Renders as plain
 * text + a "Cannot be changed after creation" caption; not an editable
 * section, so no `FieldFooter` and no Save button.
 */
export type OrgNameIdReadOnlyProps = {
  value: string;
  caption: string; // i18n: "Cannot be changed after creation"
};

/**
 * Sections of the Org Profile tab. Each maps to one section unit in the
 * integration hook's `saveStatusByField` / `dirtyByField` records.
 */
export type OrgProfileSections = {
  // Identity (2 single-field sections + 1 read-only)
  displayName: EditableSectionProps;
  nameID: OrgNameIdReadOnlyProps; // not a section; renders as plain text + caption
  tagline: EditableSectionProps;

  // About
  description: EditableSectionProps;
  /** Compound section: city + country share one Save button. */
  location: EditableSectionProps;
  /**
   * `Keywords` profile tagset. Independent per-section save — fires
   * `updateOrganization` patching only `profileData.tagsets[ID=<keywords-id>].tags`,
   * or `createTagsetOnProfile({ name: 'Keywords' })` on first save when
   * the tagset doesn't yet exist on the profile. Mirrors the existing
   * MUI `OrganizationForm` + `TagsetSegment` (one labeled input per
   * profile tagset) and `useOrganization.ts`'s case-insensitive name
   * lookup.
   */
  keywords: EditableSectionProps;
  /**
   * `Capabilities` profile tagset. Same shape as `keywords` but writes
   * to a different tagset; saved independently.
   */
  capabilities: EditableSectionProps;

  // Contact & Legal — each its own section; format validators run live
  contactEmail: EditableSectionProps;
  domain: EditableSectionProps;
  legalEntityName: EditableSectionProps;
  website: EditableSectionProps;

  // Social Links / References — one list-managed section
  references: ReferencesSectionProps;
};

/** Top-level view contract for the Org Profile tab. */
export type OrgProfileViewProps = {
  sections: OrgProfileSections;
  avatarColumn: AvatarColumnProps;
  /** Read-only verification badge (FR-094). */
  verifiedBadge: OrgVerifiedBadgeProps;
  pendingReferenceDelete: PendingReferenceDeleteProps;
  loading: boolean;
};
