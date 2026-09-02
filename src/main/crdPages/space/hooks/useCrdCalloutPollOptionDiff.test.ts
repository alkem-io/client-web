import { describe, expect, it } from 'vitest';
import { addedSentinel, diffPollOptions, isAddedSentinel, parseAddedSentinel } from './useCrdCalloutPollOptionDiff';

describe('diffPollOptions', () => {
  it('no changes → empty diff', () => {
    const before = [
      { id: '1', text: 'A' },
      { id: '2', text: 'B' },
    ];
    const after = [
      { id: '1', text: 'A' },
      { id: '2', text: 'B' },
    ];
    const diff = diffPollOptions(before, after);
    expect(diff).toEqual({ toAdd: [], toRemove: [], toUpdate: [], orderedIds: [] });
  });

  it('detects new options', () => {
    const before = [{ id: '1', text: 'A' }];
    const after = [{ id: '1', text: 'A' }, { text: 'B' }];
    const diff = diffPollOptions(before, after);
    expect(diff.toAdd).toEqual([{ index: 1, text: 'B' }]);
    expect(diff.toRemove).toEqual([]);
    expect(diff.toUpdate).toEqual([]);
    expect(diff.orderedIds).toEqual(['1', addedSentinel(1)]);
  });

  it('drops empty new options from the add list', () => {
    const before = [{ id: '1', text: 'A' }];
    const after = [{ id: '1', text: 'A' }, { text: '   ' }];
    const diff = diffPollOptions(before, after);
    expect(diff.toAdd).toEqual([]);
    expect(diff.orderedIds).toEqual([]);
  });

  it('detects removed options', () => {
    const before = [
      { id: '1', text: 'A' },
      { id: '2', text: 'B' },
    ];
    const after = [{ id: '2', text: 'B' }];
    const diff = diffPollOptions(before, after);
    expect(diff.toRemove).toEqual(['1']);
    expect(diff.orderedIds).toEqual([]);
  });

  it('detects updated text for existing options', () => {
    const before = [
      { id: '1', text: 'Old' },
      { id: '2', text: 'B' },
    ];
    const after = [
      { id: '1', text: 'New' },
      { id: '2', text: 'B' },
    ];
    const diff = diffPollOptions(before, after);
    expect(diff.toUpdate).toEqual([{ id: '1', text: 'New' }]);
  });

  it('detects reorder of existing options', () => {
    const before = [
      { id: '1', text: 'A' },
      { id: '2', text: 'B' },
      { id: '3', text: 'C' },
    ];
    const after = [
      { id: '3', text: 'C' },
      { id: '1', text: 'A' },
      { id: '2', text: 'B' },
    ];
    const diff = diffPollOptions(before, after);
    expect(diff.orderedIds).toEqual(['3', '1', '2']);
  });

  it('combines add + remove + update + reorder', () => {
    const before = [
      { id: '1', text: 'A' },
      { id: '2', text: 'B' },
      { id: '3', text: 'C' },
    ];
    const after = [{ id: '3', text: 'C' }, { text: 'D' }, { id: '1', text: 'A-updated' }];
    const diff = diffPollOptions(before, after);
    expect(diff.toAdd).toEqual([{ index: 1, text: 'D' }]);
    expect(diff.toRemove).toEqual(['2']);
    expect(diff.toUpdate).toEqual([{ id: '1', text: 'A-updated' }]);
    expect(diff.orderedIds).toEqual(['3', addedSentinel(1), '1']);
  });
});

describe('sentinel helpers', () => {
  it('addedSentinel / isAddedSentinel / parseAddedSentinel roundtrip', () => {
    const s = addedSentinel(7);
    expect(isAddedSentinel(s)).toBe(true);
    expect(parseAddedSentinel(s)).toBe(7);
  });

  it('real ids are not mistaken for sentinels', () => {
    expect(isAddedSentinel('abc-123')).toBe(false);
    expect(parseAddedSentinel('abc-123')).toBeUndefined();
  });
});
