export type AboutReference = {
  id: string;
  title: string;
  url: string;
};

export type AboutVisual = {
  id: string;
  url: string;
  alt: string;
};

export type AboutFormValues = {
  name: string;
  tagline: string;
  email: string;
  pronouns: string;
  country: string;
  city: string;
  avatarUrl: string | null;
  pageBannerUrl: string | null;
  cardBannerUrl: string | null;
  visualsGallery: AboutVisual[];
  tags: string[];
  references: AboutReference[];
  /** Renamed in CRD from `description` to `what`. */
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

export type AboutFieldKey = keyof AboutFormValues;
export type AboutAutosaveStateMap = Partial<Record<AboutFieldKey, FieldAutosaveState>>;

export type SpaceCardPreview = {
  name: string;
  tagline: string;
  bannerUrl: string | null;
  avatarUrl: string | null;
  tags: string[];
  /** From pickColorFromId(space.id). Used when banner/avatar are missing. */
  color: string;
};

/**
 * AboutViewProps
 *
 * No Save Changes button and no Reset button (FR-005a). Each field autosaves
 * after a 2-second idle debounce. File-upload fields autosave immediately on
 * upload completion — the act of choosing a file IS the commit.
 *
 * The view receives one combined `autosaveState: AboutAutosaveStateMap` and
 * renders the per-field indicator (spinner / "Saved!" / inline error) next
 * to each field's label based on that map.
 */
export type AboutViewProps = AboutFormValues & {
  previewCard: SpaceCardPreview;
  autosaveState: AboutAutosaveStateMap;
  onChange: (patch: Partial<AboutFormValues>) => void;
  onUploadPageBanner: (file: File) => void;
  onUploadCardBanner: (file: File) => void;
  onUploadAvatar: (file: File) => void;
  onAddReference: () => void;
  onRemoveReference: (id: string) => void;
  onUploadVisual: (file: File) => void;
  onRemoveVisual: (id: string) => void;
};
