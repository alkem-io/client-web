/**
 * Plain-TypeScript prop / model types for the Classifications CRD kit
 * (024-classifications). No GraphQL generated types, no MUI, no Apollo — the
 * integration layer under `src/main/crdPages/` and
 * `src/domain/space/about/` maps GraphQL shapes onto these.
 *
 * The canonical read path is `about.classifications[].values[]` (D1) — there
 * is no container hop. Compact-surface (card/tile/search) shapes are
 * deliberately absent this iteration (D2).
 */

export type ClassificationCardinality = 'SINGLE_SELECT' | 'MULTI_SELECT';

/** One selectable option in a classification's vocabulary — never re-sorted. */
export type ClassificationValueData = {
  id: string;
  label: string;
};

/** One vocabulary group on a Space's About — the spec's "a Classification". */
export type ClassificationEntryData = {
  id: string;
  displayLabel: string;
  cardinality: ClassificationCardinality;
  /** The snapshot vocabulary, in authored order. Never re-sorted. */
  values: ClassificationValueData[];
  /** Ids of the currently selected values. */
  selectedValueIDs: string[];
  /** Render-only: false means "not shown on the Space page" — never an access control. */
  display: boolean;
  /** Render order on the About — order of addition, oldest first. */
  sortOrder: number;
};

/** A template offered by the Step A picker — one entry in either source group. */
export type ClassificationTemplateOptionData = {
  id: string;
  displayLabel: string;
  description: string;
  cardinality: ClassificationCardinality;
  /** The template's vocabulary, shown once the value selector is reached (FR-007b description-only in the picker itself). */
  values: ClassificationValueData[];
};

// ---------------------------------------------------------------------------
// Render-rule predicates (FR-018c / FR-018d) — defined ONCE so the About page
// and the Settings → About editor cannot each get them subtly wrong.
// ---------------------------------------------------------------------------

/** True if a viewer with no edit rights on the Space may see this entry on the About page. */
export function isRenderableOnAboutForViewer(entry: ClassificationEntryData): boolean {
  // A hidden entry (FR-018d) or a zero-value entry (FR-018c) renders to editors
  // only — a read-only visitor sees neither.
  return entry.display && entry.selectedValueIDs.length > 0;
}

/**
 * True if a Space editor may see this entry on the About page. Editors see
 * every entry, hidden and zero-value included — the point of both rules is
 * that the toggle and the unfinished state stay reachable to whoever can act
 * on them. Kept as a named predicate (rather than inlined `true`) so callers
 * always route through the same audience switch as the viewer predicate.
 */
export function isRenderableOnAboutForEditor(_entry: ClassificationEntryData): boolean {
  return true;
}

/** True when the entry is hidden from public viewers (FR-010b) — render-only, never an access control. */
export function isHiddenFromViewers(entry: ClassificationEntryData): boolean {
  return !entry.display;
}

/** True when Step A was completed but Step B has not (FR-012a) — an authoring prompt, editor-only. */
export function hasNoSelection(entry: ClassificationEntryData): boolean {
  return entry.selectedValueIDs.length === 0;
}

/**
 * Filters + orders a Space's classification entries for one audience.
 * Groups render in `sortOrder` (order of addition) — never alphabetically,
 * and never re-sorted by the caller (FR-018b).
 */
export function groupEntriesForDisplay(
  entries: ReadonlyArray<ClassificationEntryData>,
  audience: { canEdit: boolean }
): ClassificationEntryData[] {
  const predicate = audience.canEdit ? isRenderableOnAboutForEditor : isRenderableOnAboutForViewer;
  return entries
    .filter(predicate)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** The selected values resolved against `values`, in authored order (mirrors the server's `selectedValues`). */
export function resolveSelectedValues(entry: ClassificationEntryData): ClassificationValueData[] {
  const selected = new Set(entry.selectedValueIDs);
  return entry.values.filter(v => selected.has(v.id));
}
