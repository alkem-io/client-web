# Data Model – Tag Cloud Filter for Knowledge Base

## Callout (existing, extended usage)

- **Fields used**:
  - `id: string`
  - `framing.profile.displayName: string`
  - `framing.profile.url?: string`
  - `framing.profile.tagset.tags: TagReference[]`
  - `sortOrder: number`
  - `classification.flowState` (unchanged)
- **Relationships**: each callout belongs to one `CalloutsSet`; tags are aggregated across all callouts in the active set.
- **Validation rules**: tagset collection must exist even when empty; `tagset.tags` is treated as `[]` when missing to avoid null access.

## TagReference (from GraphQL profile tagset)

- **Fields**:
  - `id: string`
  - `name: string` (unique within a callout's tagset)
  - `displayName: string`
- **Relationships**: many-to-many with callouts; a tag may appear on multiple callouts.
- **Validation rules**: normalize comparisons by `name` (case-sensitive) to avoid duplicates; `displayName` drives chip label.

## TagChipModel (derived)

- **Fields**:
  - `tagName: string`
  - `label: string`
  - `frequency: number`
  - `selected: boolean`
  - `visibleIndex: number` (position after ordering rules)
- **Relationships**: computed from aggregated `TagReference` list; selected chips render ahead of unselected chips.
- **Validation rules**: frequency ≥1; when `selected = true`, chip must move to prefix segment; ensure `visibleIndex` respects two-row capacity when collapsed.

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
