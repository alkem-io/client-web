/**
 * About tab — view + per-section save contracts.
 *
 * Exact parity with the current MUI Space Admin About page. Every field
 * below binds to a real, existing mutation surface:
 *   - plain profile fields   → `useUpdateSpaceMutation` (partial UpdateSpaceInput)
 *   - tags                   → `useUpdateSpaceMutation` (nested UpdateTagsetInput)
 *   - references             → `useCreateReferenceOnProfileMutation`
 *                              `useDeleteReferenceMutation`
 *                              `useUpdateSpaceMutation` for title/uri/description patch
 *   - avatar / banner / card → `useUploadVisualMutation` (+ existing CropDialog)
 *
 * The spec intentionally does NOT include email or pronouns (user-only
 * fields) or a separate "visuals gallery" (the three visuals are the only
 * images; grouped in the "Visuals" section — formerly "Space Branding").
 *
 * Layout (amended 2026-10-16, prototype parity): the view body is a stack of
 * collapsible `SettingsSection` cards (`@/crd/components/common/SettingsSection`
 * — coloured icon tile, `<h3>` title, optional description, chevron; ALL open
 * by default; collapsing is purely visual), in this order:
 *   Identity (name, tagline) · Visuals (avatar, page banner [L0 only], card
 *   banner) · Location (city, country) · Context (what, why, who) · Tags ·
 *   Classifications · References & Links.
 * Name, tagline and city are plain boxed `Input`s — no `InlineEditText` on
 * About. Each field keeps its hint + `FieldFooter` inside its section. The
 * Preview (SpaceCard + Live Preview note) sits beside the stack, outside the
 * cards.
 */

export type AboutVisual = {
  id: string;
  uri: string | null;
  altText: string | null;
};

export type AboutReference = {
  id: string;
  title: string;
  uri: string;
  description: string;
};

export type AboutFormValues = {
  name: string;
  tagline: string;
  country: string; // 2-char ISO code
  city: string;
  avatar: AboutVisual;
  pageBanner: AboutVisual;
  cardBanner: AboutVisual;
  /** Needed by the UpdateTagsetInput patch. */
  tagsetId: string;
  tags: string[];
  /** Needed by useCreateReferenceOnProfileMutation. */
  profileId: string;
  references: AboutReference[];
  /** Renamed in CRD from `profile.description`. */
  what: string;
  why: string;
  who: string;
};

/**
 * Amended 2026-10-22 (spec Session 2026-10-22, FR-005a / FR-025): the
 * per-section model below is SUPERSEDED. About saves through the tab-wide
 * unsaved-changes bar — `useAboutTabData` exposes `unsaved: TabUnsavedChanges`
 * (see `./shell`), there is no `FieldFooter` Save / Saved! / Retry, and every
 * Classifications action (add from template, pick values, show-on-space
 * toggle, remove) is staged in the same buffer. Visual uploads still commit on
 * file pick. `SectionSaveStatus`, `onSaveSection` and `saveStatusByField` are
 * removed from the view contract.
 *
 * Per-section save model (FR-005a — amended 2026-10-16).
 *
 * The original contract here was a 2-second debounced per-field autosave
 * (`FieldAutosaveState` with a `pending` state, `AboutAutosaveStateMap`,
 * `flushPending()`). It never shipped and is removed. What ships:
 *
 *   - Each section renders the shared `FieldFooter`
 *     (`@/crd/components/common/FieldFooter`): hint on the left; on the right
 *     a Save button while the section is dirty and idle, a spinner +
 *     "Saving…" (`aria-busy`) while saving, "Saved!" (`aria-live="polite"`)
 *     for `SAVED_FLASH_MS` (1800 ms) after success, and the error message
 *     (`role="alert"`) + a Retry button after failure.
 *   - Save sends ONLY that section's patch.
 *   - Visual uploads (avatar / pageBanner / cardBanner) are not sections:
 *     the file pick (through the crop step) IS the commit.
 *   - Classifications commit immediately per action (workspace spec 024
 *     FR-006a); their section footer only reports status.
 */
export type SectionSaveStatus =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved'; at?: number }
  | { kind: 'error'; message: string };

/** One key per independently saved section. */
export type AboutSectionKey =
  | 'name'
  | 'tagline'
  | 'location' // groups city + country
  | 'what'
  | 'why'
  | 'who'
  | 'tags'
  | 'references'
  | 'classifications';

/**
 * Props for the live Preview card on the About tab. The Preview renders the
 * existing `src/crd/components/space/SpaceCard.tsx` component unchanged, but
 * only includes fields that are actually editable from the About tab — the
 * SpaceCard's non-editable surfaces (LEADS row, member count, etc.) are
 * omitted from the preview prop set.
 */
export type SpaceCardPreview = {
  name: string;
  tagline: string;
  bannerUrl: string | null;
  avatarUrl: string | null;
  tags: string[];
  /** From pickColorFromId(space.id). Used when banner/avatar are missing. */
  color: string;
  /** Generated initials for the avatar fallback, e.g. "GE". */
  initials: string;
  /** Used by SpaceCardData.href in the preview — same URL the card page will get. */
  href: string;
};

/**
 * AboutViewProps
 *
 * No tab-wide Save Changes / Reset bar (FR-005a). `onChange` only updates the
 * local buffer; each section commits on its own Save (`onSaveSection`). File
 * uploads commit immediately on file pick — choosing a file IS the commit.
 * References are edited in the shared `ReferencesEditor` and committed by the
 * References & Links section's Save (create new + patch edited + delete removed).
 * (Amended 2026-10-16 — replaces the never-shipped `autosaveState` contract.)
 */
export type AboutViewProps = AboutFormValues & {
  previewCard: SpaceCardPreview;
  /** Which sections differ from the server value. */
  dirtyByField: Partial<Record<AboutSectionKey, boolean>>;
  /** Per-section save status. */
  saveStatusByField: Partial<Record<AboutSectionKey, SectionSaveStatus>>;
  onSaveSection: (section: AboutSectionKey) => void;
  onChange: (patch: Partial<AboutFormValues>) => void;
  onUploadAvatar: (file: File) => void;
  onUploadPageBanner: (file: File) => void;
  onUploadCardBanner: (file: File) => void;
  /**
   * Replaces the whole references list — the shared `ReferencesEditor` owns
   * add / edit / remove + delete-confirm (Session 2026-05-20; replaced the
   * granular onAdd/onUpdate/onRemoveReference handlers).
   */
  onReferencesChange: (rows: ReadonlyArray<{ id?: string; name: string; uri: string; description?: string }>) => void;
};
