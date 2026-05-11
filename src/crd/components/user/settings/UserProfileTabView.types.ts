/**
 * Public types for `UserProfileTabView`. Plain TypeScript — no GraphQL
 * types, no Apollo imports, no MUI imports.
 *
 * Implements the contract documented in
 * `specs/097-crd-user-settings/contracts/tab-userProfile.ts`.
 */

import type { SectionSaveStatus } from '@/crd/components/common/FieldFooter';

export type { SectionSaveStatus };

/**
 * Logical "sections" of the User Profile tab. Each maps to ONE Save button
 * and ONE targeted mutation. `email` is read-only and not a section.
 *
 * `skills` and `keywords` are two **independent** tagset sections — each
 * writes to its own named profile tagset (`Skills` / `Keywords`). There is
 * no unified `tags` section; saving Skills MUST NOT touch Keywords and
 * vice versa (parity with the existing MUI `UserForm` + `TagsetSegment`).
 */
export type UserProfileSectionKey =
  | 'displayName'
  | 'firstName'
  | 'lastName'
  | 'phone'
  | 'tagline'
  | 'location'
  | 'bio'
  | 'skills'
  | 'keywords'
  | 'references';

/**
 * One named profile tagset (Skills / Keywords for User; Keywords /
 * Capabilities for Org). `id` is `undefined` when the tagset doesn't yet
 * exist on the profile — the section's first Save lazy-creates it via
 * `createTagsetOnProfile`.
 */
export type UserProfileTagset = {
  id?: string;
  tags: string[];
};

export type UserProfileVisual = {
  id: string;
  uri: string | null;
  altText: string | null;
};

/** A reference row in the local section buffer. */
export type UserProfileReference = {
  /** Server id, OR `temp-<uuid>` for unsaved rows. */
  id: string;
  name: string;
  uri: string;
  description: string;
  /** True when this is one of the recognized social tiles (linkedin / bsky / github). */
  recognized: boolean;
};

/** A country option for the location section. */
export type UserProfileCountryOption = {
  /** ISO code stored on the profile (e.g. "ES"). */
  code: string;
  /** Localized country name. */
  name: string;
};

/**
 * The canonical form values shape — both the user's draft (`values`) and
 * the last server-known snapshot (`saved`) inhabit this type, and dirty is
 * derived per-section by comparison.
 */
export type UserProfileFormValues = {
  /** GraphQL profile id — used by reference create / tagset create mutations. */
  profileId: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tagline: string;
  city: string;
  /** ISO code, never the localized country name. */
  country: string;
  bio: string;
  /** `Skills` profile tagset (case-insensitive `name` match). */
  skills: UserProfileTagset;
  /** `Keywords` profile tagset (case-insensitive `name` match). */
  keywords: UserProfileTagset;
  avatar: UserProfileVisual;
  /** All non-recognized references (the Add-Another list). */
  references: UserProfileReference[];
  /** The three recognized social rows, keyed by network. */
  recognizedReferences: {
    linkedin: UserProfileReference | null;
    bsky: UserProfileReference | null;
    github: UserProfileReference | null;
  };
};

export type UserProfileViewProps = {
  values: UserProfileFormValues;
  /** Static list of countries for the Location combobox. */
  countries: ReadonlyArray<UserProfileCountryOption>;
  loading: boolean;

  /** Per-section dirty flags (true when draft differs from server). */
  dirtyByField: Partial<Record<UserProfileSectionKey, boolean>>;
  /** Per-section save status. Absent → idle. */
  saveStatusByField: Partial<Record<UserProfileSectionKey, SectionSaveStatus>>;

  /** Patch the local buffer for any single field. */
  onChange: (patch: Partial<UserProfileFormValues>) => void;

  /** Append a new arbitrary reference row in the local buffer (temp-id). */
  onAddReference: () => void;
  /** Patch a reference (recognized OR arbitrary) by id. */
  onUpdateReference: (id: string, patch: Partial<Omit<UserProfileReference, 'id' | 'recognized'>>) => void;
  /** Open the destructive ConfirmationDialog for this row (Rule #9 / FR-025). */
  onRequestRemoveReference: (id: string) => void;

  /** Patch a recognized reference by network kind (linkedin/bsky/github). */
  onUpdateRecognizedReference: (kind: 'linkedin' | 'bsky' | 'github', uri: string) => void;

  /** Avatar upload commits IMMEDIATELY (FR-024). */
  onUploadAvatar: (file: File) => void;
  uploadingAvatar: boolean;

  /** Save a single section (only that section's fields are persisted). */
  onSaveSection: (section: UserProfileSectionKey) => void;

  /** ConfirmationDialog state for reference deletion (Rule #9 / FR-025). */
  pendingReferenceDelete: { id: string; name: string } | null;
  onConfirmRemoveReference: () => void;
  onCancelRemoveReference: () => void;
};
