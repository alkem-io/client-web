/**
 * ⚠️ STALE — pre-clarification per-field 5-state machine.
 *
 * Spec clarification Q4 (2026-05-06) replaced the per-field model with the
 * 045 About per-section model. The new contract lives in:
 *   - `tab-userProfile.ts`  → `EditableSectionProps`, `SectionSaveStatus`
 *   - `tab-orgProfile.ts`   → (will be updated to mirror tab-userProfile)
 *
 * Save / dirty / status are now SECTION-level, not field-level. The single-line
 * input primitive is `@/crd/components/common/InlineEditText` (already shared
 * with 045); the rich-text input is `@/crd/forms/markdown/MarkdownEditor`;
 * the country select is `@/crd/components/common/CountryCombobox`; the tags
 * input is `@/crd/forms/tags-input`. The Save button + dirty indicator + status
 * pill is rendered by `FieldFooter` (extracted from 045's
 * `SpaceSettingsAboutView.tsx` to `@/crd/components/common/FieldFooter.tsx`).
 *
 * This file is retained ONLY as a transitional reference; consumers should
 * import from `tab-userProfile.ts` / `tab-orgProfile.ts` instead. It will be
 * deleted in the /speckit.tasks pass once every consumer has migrated.
 *
 * ─── original docstring (per-field model) ────────────────────────────────
 *
 * EditableField family — per-field explicit-save primitive shared by
 * User My Profile (Story 1) and Org Profile (Story 8).
 *
 * The state machine is defined in research.md Decision #2 (5 states:
 * idle / editing / pending / idle-saved / editing-error).
 *
 * The primitive is a controlled component — the parent integration hook
 * owns `status`, `serverValue`, `draftValue`, and `errorMessage`. The
 * primitive renders the right UI for the current state and delegates
 * Save / Cancel to callback props.
 *
 * Components live under `src/crd/components/contributor/settings/`.
 */

import type { ReactNode } from 'react';

/** State machine for the editable-field primitive. */
export type EditableFieldStatus =
  | 'idle' // value visible as plain text; pencil reveal on hover
  | 'editing' // input focused, Save+Cancel icons visible
  | 'pending' // mutation in flight; spinner; aria-busy
  | 'idle-saved' // success flash; transient "Saved" indicator next to label
  | 'editing-error'; // mutation failed; typed value preserved; inline error

/** Shared shell props. Specific variants (text / markdown / select / tags / reference) wrap this. */
export type EditableFieldShellProps = {
  /** Visible label rendered above the input. */
  label: string;
  /** Optional helper text rendered below the label, above the input. */
  helperText?: string;
  /** Current state from the parent integration hook. */
  status: EditableFieldStatus;
  /** Inline error message (only meaningful in `editing-error`). */
  errorMessage?: string | null;
  /** Whether this field is required (renders a visual indicator). */
  required?: boolean;
  /** Whether this field is read-only (renders the value plainly, no pencil affordance). */
  readOnly?: boolean;
  /** Called when the user clicks the value or pencil to enter edit mode. */
  onEnterEdit: () => void;
  /** Called when the user clicks Save (check) or presses Enter (single-line only). */
  onSave: () => void;
  /** Called when the user clicks Cancel (×) or presses Escape. */
  onCancel: () => void;
  /** When true, Enter inserts a newline instead of saving. Used by Bio / Description (markdown). */
  enterIsNewline?: boolean;
  /** The actual input — provided by the variant wrapper (text input / markdown / select / etc.). */
  children: ReactNode;
};

/** Single-line text variant (also used for email and tel via `inputType`). */
export type EditableTextFieldProps = {
  label: string;
  helperText?: string;
  status: EditableFieldStatus;
  errorMessage?: string | null;
  required?: boolean;
  readOnly?: boolean;
  inputType?: 'text' | 'email' | 'tel';
  serverValue: string;
  draftValue: string;
  /** Optional leading icon (e.g., `MapPin` for City). */
  leadingIcon?: import('lucide-react').LucideIcon;
  onEnterEdit: () => void;
  onChange: (next: string) => void;
  onSave: () => void;
  onCancel: () => void;
  /** Optional client-side validator. When it returns a non-empty string, Save is disabled and the message is displayed. */
  validate?: (value: string) => string | null;
};

/** Markdown variant — Enter inserts newline; commit only via Save icon. */
export type EditableMarkdownFieldProps = {
  label: string;
  helperText?: string;
  status: EditableFieldStatus;
  errorMessage?: string | null;
  required?: boolean;
  serverValue: string;
  draftValue: string;
  onEnterEdit: () => void;
  onChange: (next: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

/** Select variant — used by Country picker. */
export type EditableSelectFieldProps<T extends string = string> = {
  label: string;
  helperText?: string;
  status: EditableFieldStatus;
  errorMessage?: string | null;
  required?: boolean;
  options: Array<{ value: T; label: string }>;
  serverValue: T | null;
  draftValue: T | null;
  onEnterEdit: () => void;
  onChange: (next: T | null) => void;
  onSave: () => void;
  onCancel: () => void;
};

/** Tags variant — wraps the existing `@/crd/forms/tags-input`. */
export type EditableTagsFieldProps = {
  label: string;
  helperText?: string;
  status: EditableFieldStatus;
  errorMessage?: string | null;
  serverValue: string[];
  draftValue: string[];
  onEnterEdit: () => void;
  onChange: (next: string[]) => void;
  onSave: () => void;
  onCancel: () => void;
};

/** Single reference row — recognized social link or arbitrary reference. */
export type ReferenceKind = 'linkedin' | 'bsky' | 'github' | 'arbitrary';

export type EditableReferenceRowProps = {
  /** Stable id; null for an unsaved-yet (newly added) row. */
  id: string | null;
  kind: ReferenceKind;
  /** Editable only when `kind === 'arbitrary'`; read-only otherwise (the recognized name is fixed). */
  name: string;
  serverUrl: string;
  draftUrl: string;
  serverDescription?: string;
  draftDescription?: string;
  status: EditableFieldStatus;
  errorMessage?: string | null;
  onEnterEdit: () => void;
  onUrlChange: (next: string) => void;
  onDescriptionChange?: (next: string) => void;
  onNameChange?: (next: string) => void; // arbitrary only
  onSave: () => void;
  onCancel: () => void;
  /** Trash icon — fires immediately, no confirmation (FR-025). */
  onDelete: () => void;
  /** Used by URL input — disables Save when URL is invalid. */
  validateUrl: (url: string) => string | null;
};
