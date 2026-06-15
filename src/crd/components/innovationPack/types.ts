/**
 * Plain prop types for the `src/crd/components/innovationPack/*` components.
 * No runtime dependencies — types only.
 */

import type {
  ReferenceRow,
  TemplateCategorySection,
  TemplatesManagerViewProps,
} from '@/crd/components/templates/types';
import type { MarkdownUploadProps } from '@/crd/forms/markdown/MarkdownEditor';
// MarkdownUploadProps is also spread into CreateInnovationPackDialogProps (markdown description editor).

export type InnovationPackCardData = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  /** profile.cardBanner.uri / profile.visual.uri — undefined ⇒ the component renders the `color` gradient. */
  bannerUrl?: string;
  /** pickColorFromId(pack.id) — deterministic accent for banner/avatar fallback. */
  color: string;
  /** sum of templatesSet.*Count — shown as a "{N} templates" badge. */
  templateCount: number;
  /** profile.url — the card links here. */
  url: string;
  providerName?: string;
  providerAvatarUrl?: string;
  providerUrl?: string;
};

// ---------------------------------------------------------------------------
// US7 — pack edit form, create dialog, admin view (mirrors the contract in
// `specs/098-crd-templates/contracts/innovation-pack.ts`).
// ---------------------------------------------------------------------------

/**
 * Three-way mapping to the server `SearchVisibility` enum:
 *  - `'public'`         ⇄ `SearchVisibility.Public`
 *  - `'authenticated'`  ⇄ `SearchVisibility.Account` (legacy enum name, the broader visibility tier)
 *  - `'account'`        ⇄ `SearchVisibility.Hidden`
 *
 * Naming follows the contract; the integration mapper handles the GraphQL-enum mapping.
 */
export type SearchVisibilityValue = 'public' | 'authenticated' | 'account';

/**
 * The pack EDIT form (on the admin screen). Provider is NOT a field — it's shown
 * read-only by the view (see `InnovationPackAdminViewProps.providerName`).
 */
export type InnovationPackFormValues = {
  /** required, non-empty — = profile.displayName */
  name: string;
  description: string;
  tags: string[];
  /** Queued avatar file — uploaded on save; cleared after the upload succeeds. */
  avatarFile?: File;
  references: ReferenceRow[];
  listedInStore: boolean;
  searchVisibility: SearchVisibilityValue;
};

export type InnovationPackFormErrors = Partial<
  Record<keyof InnovationPackFormValues | `references.${number}.${'name' | 'uri'}`, string>
>;

export type InnovationPackFormProps = {
  value: InnovationPackFormValues;
  errors: InnovationPackFormErrors;
  onChange: (next: InnovationPackFormValues) => void;
  onSubmit: () => void;
  submitting: boolean;
  /** Whether the form differs from the last-saved server state. The Save button stays disabled while `false`. */
  isDirty: boolean;
  /** The provider organisation's display name — rendered read-only (no picker; mirrors the legacy `InnovationPackForm`). */
  providerName: string;
  /** Existing avatar URL (if any) — used to preview the current image. The form does not upload directly; `avatarFile` is queued via `onChange`. */
  avatarUrl?: string;
  /** Optional reference file-upload (paperclip). When provided, each reference row can attach a file whose URL fills `uri`. */
  onReferenceFileUpload?: (file: File) => Promise<string | null>;
  /** `accept` attribute for the reference file picker, derived from the storage bucket's allowed mime types. */
  referenceUploadAccept?: string;
} & MarkdownUploadProps;

/** Pack creation collects ONLY name + description (mirrors the legacy `CreateInnovationPackDialog`). */
export type CreateInnovationPackValues = { name: string; description: string };

export type CreateInnovationPackErrors = Partial<Record<keyof CreateInnovationPackValues, string>>;

export type CreateInnovationPackDialogProps = {
  open: boolean;
  onClose: () => void;
  value: CreateInnovationPackValues;
  errors: CreateInnovationPackErrors;
  onChange: (next: CreateInnovationPackValues) => void;
  onCreate: () => void;
  creating: boolean;
  /**
   * Whether the form is currently valid enough to submit. When provided, it (not the displayed
   * `errors`) drives the Create button's disabled state — so the button can be disabled while the
   * dialog shows no errors yet (errors are surfaced only once fields are touched). Falls back to
   * `errors`-derived blocking when omitted (legacy MUI caller).
   */
  canSubmit?: boolean;
  /** Account display name for the subtitle ("…in {accountName}" / "your account"). Omitted ⇒ user's own account. */
  accountName?: string;
} & MarkdownUploadProps;

export type InnovationPackAdminViewProps = {
  /** Pack-details EDIT form props (incl. `providerName` read-only). */
  form: InnovationPackFormProps;
  /** The holder-agnostic templates manager — `holderKind === 'innovationPack'`, `canImport(*) === false`. */
  templatesManager: TemplatesManagerViewProps;
  // NO delete-pack here — pack deletion is exposed from the three-dot menu on each pack card in the
  // "Account" tab's packs list (FR-042), the same place the legacy app deletes account-owned packs.
};

// Re-export TemplateCategorySection so consumers of this file don't have to dip into templates/types.
export type { TemplateCategorySection };
