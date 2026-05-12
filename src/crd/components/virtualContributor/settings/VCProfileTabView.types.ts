/**
 * Public types for `VCProfileTabView`. Plain TypeScript — no GraphQL types,
 * no Apollo imports, no MUI imports.
 *
 * Implements the contract documented in
 * `specs/097-crd-user-settings/contracts/tab-vcProfile.ts`.
 */

import type { ReactNode } from 'react';
import type { SectionSaveStatus } from '@/crd/components/common/FieldFooter';

export type { SectionSaveStatus };

/**
 * Logical sections of the VC Profile tab. Each maps to ONE Save button and
 * ONE targeted mutation. Compared to User Profile: no `firstName` /
 * `lastName` / `email` / `phone` / `location` / `bio` / `skills` — VC has a
 * single Keywords tagset only.
 */
export type VcProfileSectionKey = 'displayName' | 'tagline' | 'description' | 'keywords' | 'references';

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

  /** Per-section dirty flags (true when draft differs from server). */
  dirtyByField: Partial<Record<VcProfileSectionKey, boolean>>;
  /** Per-section save status. Absent → idle. */
  saveStatusByField: Partial<Record<VcProfileSectionKey, SectionSaveStatus>>;

  /** Patch the local buffer for any single field. */
  onChange: (patch: Partial<VcProfileFormValues>) => void;

  /** Append a new arbitrary reference row in the local buffer (temp-id). */
  onAddReference: () => void;
  /** Patch a reference by id. */
  onUpdateReference: (id: string, patch: Partial<Omit<VcProfileReference, 'id'>>) => void;
  /** Open the destructive ConfirmationDialog for this row (Rule #9 / FR-025). */
  onRequestRemoveReference: (id: string) => void;

  /** Avatar upload — opens the CRD `ImageCropDialog` first (Decision #10). */
  onUploadAvatar: (file: File) => void;
  uploadingAvatar: boolean;

  /** Save a single section (only that section's fields are persisted). */
  onSaveSection: (section: VcProfileSectionKey) => void;

  /** ConfirmationDialog state for reference deletion (Rule #9 / FR-025). */
  pendingReferenceDelete: { id: string; name: string } | null;
  onConfirmRemoveReference: () => void;
  onCancelRemoveReference: () => void;

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
};
