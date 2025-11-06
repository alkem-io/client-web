# Data Model – Tag Cloud Filter for Knowledge Base

## CalloutsSet (existing, extended usage)

- **Fields used**:
  - `id: string`
  - `tags: string[]` (aggregated list from separate query)
- **Relationships**: owns multiple callouts; tags are pre-aggregated by backend query.
- **Validation rules**: tags array treated as `[]` when missing; duplicates already removed by backend.

## Callout (existing, unchanged for tag cloud)

- **Fields used**:
  - `id: string`
  - `framing.profile.displayName: string`
  - `framing.profile.url?: string`
  - `sortOrder: number`
  - `classification.flowState` (unchanged)
- **Relationships**: each callout belongs to one `CalloutsSet`.
- **Note**: Tag data for filtering comes from separate `CalloutsSetTags` query, not from individual callout profiles.

## Tag (from CalloutsSetTags query)

- **Fields**:
  - Raw string value from backend aggregation
- **Relationships**: represents tags across all callouts in the set; no explicit callout linkage in this query.
- **Validation rules**: normalize comparisons by exact string match (case-sensitive); backend handles deduplication.

## TagChipModel (derived)

- **Fields**:
  - `tagName: string` (normalized from backend string)
  - `label: string` (display value, same as tagName from backend)
  - `selected: boolean`
  - `visibleIndex: number` (position after ordering rules)
- **Relationships**: computed from CalloutsSetTags string array; selected chips render ahead of unselected chips.
- **Validation rules**: when `selected = true`, chip must move to prefix segment; ensure `visibleIndex` respects two-row capacity when collapsed.
- **Note**: Frequency counting removed; backend provides pre-aggregated unique tags, ordering is alphabetical by default.

## TagCloudDisplayState

- **Fields**:
  - `isExpanded: boolean`
  - `collapsedVisibleChips: TagChipModel[]` (max two rows)
  - `hiddenCount: number` (for "+N" chip)
- **State transitions**:
  - `collapsed → expanded`: triggered by clicking `+N`; recompute to show all chips, swap control to caret-up.
  - `expanded → collapsed`: triggered by clicking caret-up; recompute collapsed view and hidden count.

## TagFilterState

- **Fields**:
  - `selectedTagNames: string[]` (ordered by selection time or frequency)
  - `filteredCallouts: Callout[]`
  - `resultsCount: number`
- **State transitions**:
  - `select(tag)` → add tag if absent, recalc filtered callouts (AND logic) and summary count.
  - `deselect(tag)` → remove tag, recalc filtered callouts and count.
  - `clear()` → reset `selectedTagNames`, `filteredCallouts = all`, hide results summary.
- **Validation rules**: only tags present in aggregated list can be selected; maintain deterministic ordering (selected chips respect frequency order among themselves).

## ResultsSummaryModel

- **Fields**:
  - `visible: boolean` (true when `resultsCount` < total or any tag selected)
  - `resultsCount: number`
  - `label: string` ("1 result" vs "N results" with pluralization)
- **Validation rules**: label must reflect latest count and localization; `visible = false` when no tags selected.

## ExpandControlChip (UI control)

- **Fields**:
  - `mode: 'showMore' | 'collapse'`
  - `label: string` (`+N` or caret-up glyph)
  - `ariaLabel: string`
- **State transitions**: toggles with `TagCloudDisplayState.isExpanded`.

## Color & Theming (derived constraints)

- Selected chips use `theme.palette.primary.dark`; unselected chips use transparent background with themed border.
- Accessibility requires 3:1 contrast ratio; rely on MUI theme tokens to ensure consistent styling.
