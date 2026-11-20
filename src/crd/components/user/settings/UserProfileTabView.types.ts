/**
 * Public types for `UserProfileTabView`. Plain TypeScript — no GraphQL
 * types, no Apollo imports, no MUI imports.
 *
 * Implements the contract documented in
 * `specs/097-crd-user-settings/contracts/tab-userProfile.ts`.
 */

import type { CityOption } from '@/crd/components/common/CityAutocompleteInput';
import type { MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import type { ReferenceRow } from '@/crd/forms/references/ReferencesEditor';

/**
 * One named profile tagset (Skills / Keywords for User; Keywords /
 * Capabilities for Org). `id` is `undefined` when the tagset doesn't yet
 * exist on the profile — the first Save lazy-creates it via
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
 * the last server-known snapshot (`saved`) inhabit this type; the changes
 * are derived per field by comparison.
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
  /** City suggestions for the City input; `undefined` until loaded (see `onCityFocus`). */
  cityOptions?: ReadonlyArray<CityOption>;
  /** City input focused — the consumer lazily loads `cityOptions`. */
  onCityFocus?: () => void;
  loading: boolean;
  /** True while a Save runs: the form is frozen, so nothing typed is lost to the post-save rebase. */
  disabled?: boolean;

  /** Patch the local buffer for any single field. */
  onChange: (patch: Partial<UserProfileFormValues>) => void;

  /** Replace the arbitrary references list — the shared ReferencesEditor owns add/edit/remove + delete-confirm. */
  onReferencesChange: (rows: ReferenceRow[]) => void;
  /** Reference file-upload (paperclip) — passed through to the shared editor. */
  onReferenceFileUpload?: (file: File) => Promise<string | null>;
  referenceUploadAccept?: string;

  /** Patch a recognized reference by network kind (linkedin/bsky/github). */
  onUpdateRecognizedReference: (kind: 'linkedin' | 'bsky' | 'github', uri: string) => void;

  /** Avatar upload commits IMMEDIATELY (FR-024). */
  onUploadAvatar: (file: File) => void;
  uploadingAvatar: boolean;
} & MarkdownUploadProps;
