/**
 * CRD My Profile tab contracts.
 *
 * File location at implementation time:
 *   src/crd/components/user/settings/EditableField.tsx (+ variants)
 *   src/crd/components/user/settings/tabs/MyProfileView.tsx
 *   src/crd/components/user/settings/tabs/MyProfileAvatarColumn.tsx
 *
 * Per-field explicit-save model (FR-031 / FR-032). On save failure the field
 * stays in `editing` with the typed value preserved (Q2 clarification).
 */

import type { ReactNode } from 'react';

/* ----------------------------- EditableField ---------------------------- */

export type EditableFieldStatus =
  | { kind: 'idle' }
  | { kind: 'idle-saved' }   // transient ~2 s after a successful save
  | { kind: 'editing' }
  | { kind: 'pending' }
  | { kind: 'editing-error'; errorMessage: string };

/**
 * Generic state machine wrapper. Each concrete variant supplies the input UI
 * (text, select, markdown, tags, reference row).
 */
export type EditableFieldShellProps = {
  /** i18n-resolved label rendered above / next to the field. */
  label: string;
  /** Optional caption rendered beneath the label (e.g., "Displayed next to your name in lists"). */
  helperText?: string;
  /** `true` when the user has the predicate to edit (always true in CRD shell — see FR-035 / FR-008a). */
  editable: boolean;
  status: EditableFieldStatus;
  /** Body of the field — rendered by the variant component. */
  children: ReactNode;
  /** Visual-only callbacks. Mutation invocation lives in the integration mapper. */
  onEnterEdit: () => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  /**
   * When true, the variant disables Enter-to-save (Bio is the only such field
   * — Enter inserts a newline). Save / Cancel happen via icons only.
   */
  enterIsNewline?: boolean;
};

/* --------------------------- EditableTextField --------------------------- */

export type EditableTextFieldProps = Omit<EditableFieldShellProps, 'children'> & {
  value: string;
  onChange: (next: string) => void;
  /** Optional client-side validator. Returning a string surfaces it as the inline error inside `editing` (mutation never fires). */
  validate?: (value: string) => string | null;
  inputType?: 'text' | 'email' | 'tel';
  /** lucide-react icon to render inside the input (e.g., MapPin for City). */
  icon?: ReactNode;
};

/* ------------------------- EditableMarkdownField ------------------------- */

export type EditableMarkdownFieldProps = Omit<EditableFieldShellProps, 'children' | 'enterIsNewline'> & {
  markdown: string;
  onChange: (next: string) => void;
  /** Forced true — Enter inserts a newline. Save / Cancel only via icons. */
  enterIsNewline: true;
};

/* -------------------------- EditableSelectField -------------------------- */

export type EditableSelectFieldProps<T extends string> = Omit<EditableFieldShellProps, 'children'> & {
  value: T | null;
  options: { value: T; label: string }[];
  onChange: (next: T | null) => void;
  /** When supplied, renders a search input within the open Select dropdown. */
  searchable?: boolean;
};

/* --------------------------- EditableTagsField --------------------------- */

export type EditableTagsFieldProps = Omit<EditableFieldShellProps, 'children'> & {
  tags: string[];
  onChange: (next: string[]) => void;
  /** Suggestion list, optional. */
  suggestions?: string[];
};

/* ------------------------- EditableReferenceRow ------------------------- */

export type EditableReferenceRowKind = 'LinkedIn' | 'Bluesky' | 'GitHub' | 'arbitrary';

export type EditableReferenceRowProps = {
  kind: EditableReferenceRowKind;
  /** Existing reference id; null for an unsaved row (Add Another Reference flow). */
  id: string | null;
  name: string;
  uri: string;
  description: string | null;
  status: EditableFieldStatus;
  /** Whether the URL passes the existing reference URL validator. */
  uriValid: boolean;

  onChangeName: (next: string) => void;        // arbitrary kind only
  onChangeUri: (next: string) => void;
  onChangeDescription: (next: string) => void; // arbitrary kind only

  onEnterEdit: () => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  onDelete: () => Promise<void>;               // trash icon — fires immediately, no confirmation
};

/* ----------------------------- MyProfileView ----------------------------- */

export type MyProfileViewProps = {
  identity: {
    displayName: EditableTextFieldProps;
    firstName: EditableTextFieldProps;
    lastName: EditableTextFieldProps;
    email: { value: string; helperTextI18nKey: string };
    phone: EditableTextFieldProps;
  };
  aboutYou: {
    tagline: EditableTextFieldProps;
    city: EditableTextFieldProps;
    country: EditableSelectFieldProps<string>;
    bio: EditableMarkdownFieldProps;
    tags: EditableTagsFieldProps;
  };
  socialLinks: {
    recognized: EditableReferenceRowProps[];   // always 3 rows: LinkedIn / Bluesky / GitHub
    arbitrary: EditableReferenceRowProps[];    // user-defined order
    onAddAnotherReference: () => void;         // appends an unsaved arbitrary row in `editing` mode
  };
  avatar: AvatarColumnProps;
  /** i18n-resolved section / sub-section labels. */
  labels: {
    identity: string;
    aboutYou: string;
    socialLinks: string;
    addAnotherReference: string;
  };
};

/* ------------------------- MyProfileAvatarColumn ------------------------- */

export type AvatarColumnProps = {
  imageUrl: string | null;
  displayName: string;
  tagline: string | null;
  helperTextI18nKey: string;                   // "Recommended: 400x400px. JPG, PNG or GIF."
  /** Called immediately on file-select. Mutation lives in the integration layer. */
  onAvatarFilePicked: (file: File) => Promise<void>;
  /** Visual upload state, surfaced as an overlay spinner on the avatar. */
  uploading: boolean;
};
