/**
 * About tab — view + autosave contracts.
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
 * images; grouped in a single Space Branding region in the prototype).
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
 * Per-field autosave state. FR-005a requires a per-field indicator:
 *   - `idle`    : field has no in-flight save and no recent success feedback.
 *   - `pending` : user has edited the field; 2-second debounce timer is running.
 *   - `saving`  : mutation is in flight; view shows a spinner next to the field label.
 *   - `saved`   : mutation just succeeded; view shows a grayed "Saved!" indicator
 *                 for exactly 2 seconds before the hook transitions the state
 *                 back to `idle`. No auto-retry on error.
 *   - `error`   : mutation failed; view shows an inline error next to the field label;
 *                 the error persists until the next `onChange` for that field
 *                 clears it and restarts the autosave cycle (no auto-retry).
 *
 * Indicator slots in the view MUST be rendered as `role="status"` with
 * `aria-live="polite"` and a descriptive `aria-label` (screen-reader users
 * must hear the transition `saving → saved` or the error message).
 */
export type FieldAutosaveState =
  | { kind: 'idle' }
  | { kind: 'pending' }
  | { kind: 'saving' }
  | { kind: 'saved'; at: number }
  | { kind: 'error'; message: string };

/**
 * Keys used by the indicator map. Scalar form-fields map 1:1; compound fields
 * (avatar / pageBanner / cardBanner / references / tags) share one indicator
 * slot per group since they commit as a unit.
 */
export type AboutFieldKey =
  | 'name'
  | 'tagline'
  | 'location' // groups country + city
  | 'avatar'
  | 'pageBanner'
  | 'cardBanner'
  | 'tags'
  | 'references'
  | 'what'
  | 'why'
  | 'who';

export type AboutAutosaveStateMap = Partial<Record<AboutFieldKey, FieldAutosaveState>>;

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
 * No Save Changes button and no Reset button (FR-005a). Each field autosaves
 * after a 2-second idle debounce. File-upload fields autosave immediately on
 * upload completion — the act of choosing a file IS the commit. Reference
 * add / remove and tag changes also autosave immediately.
 */
export type AboutViewProps = AboutFormValues & {
  previewCard: SpaceCardPreview;
  autosaveState: AboutAutosaveStateMap;
  onChange: (patch: Partial<AboutFormValues>) => void;
  onUploadAvatar: (file: File) => void;
  onUploadPageBanner: (file: File) => void;
  onUploadCardBanner: (file: File) => void;
  onAddReference: () => void;
  onUpdateReference: (id: string, patch: Partial<Omit<AboutReference, 'id'>>) => void;
  onRemoveReference: (id: string) => void;
};
