/**
 * Public types for `VCProfileTabView`. Plain TypeScript — no GraphQL types,
 * no Apollo imports, no MUI imports.
 *
 * Implements the contract documented in
 * `specs/097-crd-user-settings/contracts/tab-vcProfile.ts`.
 */

import type { ReactNode } from 'react';
import type { MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
import type { ReferenceRow } from '@/crd/forms/references/ReferencesEditor';

/**
 * Logical sections of the VC Profile tab. Each maps to ONE Save button and
 * ONE targeted mutation. Compared to User Profile: no `firstName` /
 * `lastName` / `email` / `phone` / `location` / `bio` / `skills` — VC has a
 * single Keywords tagset only.
 */

export type VcProfileTagset = {
  id?: string;
  tags: string[];
};

export type VcProfileVisual = {
  id: string;
  uri: string | null;
  altText: string | null;
};

export type VcProfileReference = {
  /** Server id, OR `temp-<uuid>` for unsaved rows. */
  id: string;
  name: string;
  uri: string;
  description: string;
};

/**
 * The canonical form values shape — both the user's draft (`values`) and
 * the last server-known snapshot (`saved`) inhabit this type, and dirty is
 * derived per-section by comparison.
 */
export type VcProfileFormValues = {
  /** GraphQL profile id — used by reference create / tagset create mutations. */
  profileId: string;
  displayName: string;
  tagline: string;
  description: string;
  /** `Keywords` profile tagset (case-insensitive `name` match). */
  keywords: VcProfileTagset;
  avatar: VcProfileVisual;
  /** References list (arbitrary entries; no per-network recognized rows on VC). */
  references: VcProfileReference[];
};

/** Read-only metadata row (host org link or body-of-knowledge name). */
export type VcReadOnlyMetadataRow = {
  label: string;
  value: string;
  /** Optional href when the value links to another page (e.g. host org). */
  href?: string;
};

export type VcProfileViewProps = {
  values: VcProfileFormValues;
  loading: boolean;

  /** Patch the local buffer for any single field. */
  onChange: (patch: Partial<VcProfileFormValues>) => void;

  /** Replace the references list — the shared ReferencesEditor owns add/edit/remove + delete-confirm. */
  onReferencesChange: (rows: ReferenceRow[]) => void;
  /** Reference file-upload (paperclip) — passed through to the shared editor. */
  onReferenceFileUpload?: (file: File) => Promise<string | null>;
  referenceUploadAccept?: string;

  /** Avatar upload — opens the CRD `ImageCropDialog` first (Decision #10). */
  onUploadAvatar: (file: File) => void;
  uploadingAvatar: boolean;

  /**
   * Read-only metadata rendered under the form: host organization (link) +
   * Body of Knowledge name. Both optional; hidden when absent.
   */
  metadata?: {
    host?: VcReadOnlyMetadataRow;
    bodyOfKnowledge?: VcReadOnlyMetadataRow;
  };

  /** Optional content slot below the form (used for tests / custom embeds). */
  footerSlot?: ReactNode;
} & MarkdownUploadProps;
