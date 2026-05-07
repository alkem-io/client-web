/**
 * User Profile tab — view contract (per-section save model — matches 045 About).
 *
 * Save model: per-section explicit save via `FieldFooter` per section. State
 * (`idle | saving | saved | error`) lives in the integration hook
 * (`useUserProfileTabData`). On success a "Saved!" indicator flashes for
 * 1800 ms (`SAVED_FLASH_MS`) before returning to idle. On failure the section
 * stays dirty with the user's typed values preserved + an inline error
 * message that persists until the admin edits a field in the section again.
 *
 * See data-model.md "User Story 1" for field-level details and
 * research.md Decision #2 for the state machine.
 *
 * Renamed from `tab-userMyProfile.ts` per spec clarification Q3 (2026-05-06).
 */

import type { ReactNode } from 'react';

/** Per-section save status. Matches 045's SAVED_FLASH_MS = 1800. */
export type SectionSaveStatus =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved' }
  | { kind: 'error'; message: string };

/** A single editable section — rendered as input(s) + FieldFooter. */
export type EditableSectionProps = {
  /** Visible label rendered above the input(s). */
  label: string;
  /** Optional hint rendered inside the FieldFooter slot. */
  hint?: string;
  /** The input(s) themselves — rendered by the parent (InlineEditText, MarkdownEditor, CountryCombobox, TagsField, etc.). */
  children: ReactNode;
  /** True when the section's draft differs from the last server-known value. Drives Save-button enablement and the dirty indicator. */
  dirty: boolean;
  /** Per-render status from the integration hook. */
  status: SectionSaveStatus;
  /** Called on Save click. Fires the targeted mutation for ONLY this section's fields. */
  onSave: () => void;
};

/** Avatar column on the right side of the Profile tab body. */
export type AvatarColumnProps = {
  avatarUrl?: string;
  displayName: string;
  tagline?: string;
  uploading: boolean;
  uploadHelperText: string; // i18n: "Recommended: 400x400px. JPG, PNG or GIF."
  changeButtonLabel: string;
  /** File-pick commits immediately on file-select (FR-024). */
  onAvatarFilePicked: (file: File) => Promise<void>;
};

/** A single reference row inside the References section buffer. */
export type ReferenceRow = {
  id: string; // server id, OR `temp-<uuid>` for unsaved rows
  name: string;
  uri: string;
  description?: string;
  /** True when this is one of the recognized social tiles (linkedin / bsky / github). */
  recognized: boolean;
  /** True when this row's URI is format-invalid (disables the section's Save). */
  uriInvalid: boolean;
};

/**
 * References section state — single section unit.
 * Add / Edit / Delete operate on the local buffer until onSave fires the batch
 * (createReferenceOnProfile × N + updateReference × M + deleteReference × P).
 */
export type ReferencesSectionProps = {
  rows: ReferenceRow[];
  /** Append a new temp-id row to the local buffer in edit state. */
  onAdd: () => void;
  /** Patch a row in the local buffer by id. */
  onUpdate: (id: string, patch: Partial<Omit<ReferenceRow, 'id' | 'recognized'>>) => void;
  /**
   * Open the destructive ConfirmationDialog for this row (Rule #9 / FR-025).
   * Sets pendingReferenceDeleteId; only the dialog's Confirm queues the row
   * for deletion in the local buffer.
   */
  onRequestDelete: (id: string) => void;
  /** True when at least one URI in the section is format-invalid. Drives Save disabled. */
  hasInvalidUri: boolean;
  /** Section-level dirty / status / Save handler — same shape as EditableSectionProps. */
  dirty: boolean;
  status: SectionSaveStatus;
  onSave: () => void;
};

/** ConfirmationDialog state for reference deletion (Rule #9 / FR-025). */
export type PendingReferenceDeleteProps = {
  pendingId: string | null;
  pendingName: string | null; // surfaces the ref name in the dialog body
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Sections of the Profile tab. Each maps to one section unit in the
 * integration hook's `saveStatusByField` / `dirtyByField` records.
 */
export type UserProfileSections = {
  // Identity (4 single-field sections + 1 read-only)
  displayName: EditableSectionProps;
  firstName: EditableSectionProps;
  lastName: EditableSectionProps;
  email: { value: string; readOnlyCaption: string }; // not a section; renders as plain text + caption
  phone: EditableSectionProps;

  // About You
  tagline: EditableSectionProps;
  /** Compound section: city + country share one Save button. */
  location: EditableSectionProps;
  bio: EditableSectionProps;
  tags: EditableSectionProps;

  // Social Links / References — one list-managed section
  references: ReferencesSectionProps;
};

/** Top-level view contract for the User Profile tab. */
export type UserProfileViewProps = {
  sections: UserProfileSections;
  avatarColumn: AvatarColumnProps;
  pendingReferenceDelete: PendingReferenceDeleteProps;
  loading: boolean;
};
