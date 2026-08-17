import { describe, expect, it } from 'vitest';
import {
  type ClassificationEntryData,
  groupEntriesForDisplay,
  hasNoSelection,
  isHiddenFromViewers,
  isRenderableOnAboutForEditor,
  isRenderableOnAboutForViewer,
  resolveSelectedValues,
} from './types';

function makeEntry(overrides: Partial<ClassificationEntryData> = {}): ClassificationEntryData {
  return {
    id: 'entry-1',
    displayLabel: 'SDGs',
    cardinality: 'MULTI_SELECT',
    values: [
      { id: 'sdg-13', label: '13 · Climate Action' },
      { id: 'sdg-14', label: '14 · Life Below Water' },
    ],
    selectedValueIDs: ['sdg-13'],
    display: true,
    sortOrder: 0,
    ...overrides,
  };
}

describe('classification render-rule predicates (FR-018c / FR-018d)', () => {
  it('a normal shown, non-empty entry renders for both viewers and editors', () => {
    const entry = makeEntry();
    expect(isRenderableOnAboutForViewer(entry)).toBe(true);
    expect(isRenderableOnAboutForEditor(entry)).toBe(true);
  });

  it('a hidden entry renders for editors only, never for a read-only viewer', () => {
    const entry = makeEntry({ display: false });
    expect(isHiddenFromViewers(entry)).toBe(true);
    expect(isRenderableOnAboutForViewer(entry)).toBe(false);
    expect(isRenderableOnAboutForEditor(entry)).toBe(true);
  });

  it('a zero-value entry renders for editors only, never for a read-only viewer', () => {
    const entry = makeEntry({ selectedValueIDs: [] });
    expect(hasNoSelection(entry)).toBe(true);
    expect(isRenderableOnAboutForViewer(entry)).toBe(false);
    expect(isRenderableOnAboutForEditor(entry)).toBe(true);
  });

  it('a hidden AND zero-value entry still renders for editors only', () => {
    const entry = makeEntry({ display: false, selectedValueIDs: [] });
    expect(isRenderableOnAboutForViewer(entry)).toBe(false);
    expect(isRenderableOnAboutForEditor(entry)).toBe(true);
  });
});

describe('groupEntriesForDisplay', () => {
  it('orders by sortOrder (addition order), never alphabetically, for a viewer audience', () => {
    const b = makeEntry({ id: 'b', displayLabel: 'B-classification', sortOrder: 2 });
    const a = makeEntry({ id: 'a', displayLabel: 'A-classification', sortOrder: 1 });
    const result = groupEntriesForDisplay([b, a], { canEdit: false });
    expect(result.map(e => e.id)).toEqual(['a', 'b']);
  });

  it('excludes hidden and zero-value entries for a read-only viewer', () => {
    const shown = makeEntry({ id: 'shown', sortOrder: 0 });
    const hidden = makeEntry({ id: 'hidden', display: false, sortOrder: 1 });
    const empty = makeEntry({ id: 'empty', selectedValueIDs: [], sortOrder: 2 });
    const result = groupEntriesForDisplay([shown, hidden, empty], { canEdit: false });
    expect(result.map(e => e.id)).toEqual(['shown']);
  });

  it('includes hidden and zero-value entries for an editor', () => {
    const shown = makeEntry({ id: 'shown', sortOrder: 0 });
    const hidden = makeEntry({ id: 'hidden', display: false, sortOrder: 1 });
    const empty = makeEntry({ id: 'empty', selectedValueIDs: [], sortOrder: 2 });
    const result = groupEntriesForDisplay([shown, hidden, empty], { canEdit: true });
    expect(result.map(e => e.id)).toEqual(['shown', 'hidden', 'empty']);
  });

  it('does not mutate the input array', () => {
    const entries = [makeEntry({ id: 'b', sortOrder: 2 }), makeEntry({ id: 'a', sortOrder: 1 })];
    const original = [...entries];
    groupEntriesForDisplay(entries, { canEdit: true });
    expect(entries).toEqual(original);
  });
});

describe('resolveSelectedValues', () => {
  it('resolves selected ids against values, preserving authored order', () => {
    const entry = makeEntry({
      values: [
        { id: 'c', label: 'C' },
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      selectedValueIDs: ['b', 'c'],
    });
    expect(resolveSelectedValues(entry).map(v => v.id)).toEqual(['c', 'b']);
  });

  it('returns an empty array when nothing is selected', () => {
    expect(resolveSelectedValues(makeEntry({ selectedValueIDs: [] }))).toEqual([]);
  });
});
