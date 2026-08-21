import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  type BoardCalloutShape,
  type BoardContributionShape,
  getBoardColumns,
  getContributionColumn,
  groupContributionsByColumn,
  isTaskBoard,
  isTaskBoardEnabled,
  TASK_TAGSET_NAME,
} from './taskBoard';

const DEFAULT_COLUMNS = ['Backlog', 'To do', 'In progress', 'Done'];

function boardCallout(overrides: Partial<BoardCalloutShape> = {}): BoardCalloutShape {
  return {
    classification: { tagsets: [{ name: TASK_TAGSET_NAME, allowedValues: DEFAULT_COLUMNS }] },
    allowedContributionTypes: ['POST'],
    ...overrides,
  };
}

function contribution(id: string, column?: string): BoardContributionShape {
  return {
    id,
    classification: column ? { tagsets: [{ name: TASK_TAGSET_NAME, tags: [column] }] } : undefined,
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('isTaskBoardEnabled', () => {
  it('is enabled by default', () => {
    expect(isTaskBoardEnabled()).toBe(true);
  });

  it('is disabled when the kill switch is set', () => {
    vi.stubEnv('VITE_TASK_BOARD_DISABLED', 'true');
    expect(isTaskBoardEnabled()).toBe(false);
  });
});

describe('isTaskBoard', () => {
  it('recognizes a marked POSTS-only callout', () => {
    expect(isTaskBoard(boardCallout())).toBe(true);
  });

  it('is false when the marker tagset is absent', () => {
    expect(isTaskBoard(boardCallout({ classification: { tagsets: [{ name: 'flow-state' }] } }))).toBe(false);
  });

  it('is false when the callout allows non-POST contributions', () => {
    expect(isTaskBoard(boardCallout({ allowedContributionTypes: ['POST', 'WHITEBOARD'] }))).toBe(false);
    expect(isTaskBoard(boardCallout({ allowedContributionTypes: ['WHITEBOARD'] }))).toBe(false);
    expect(isTaskBoard(boardCallout({ allowedContributionTypes: [] }))).toBe(false);
  });

  it('is false when the kill switch is set even with the marker present', () => {
    vi.stubEnv('VITE_TASK_BOARD_DISABLED', 'true');
    expect(isTaskBoard(boardCallout())).toBe(false);
  });

  it('is false for null / undefined callouts', () => {
    expect(isTaskBoard(undefined)).toBe(false);
    expect(isTaskBoard(null)).toBe(false);
  });

  it('matches the POST type case-insensitively', () => {
    expect(isTaskBoard(boardCallout({ allowedContributionTypes: ['post'] }))).toBe(true);
  });
});

describe('getBoardColumns', () => {
  it('returns the ordered allowedValues of the marker tagset', () => {
    expect(getBoardColumns(boardCallout())).toEqual(DEFAULT_COLUMNS);
  });

  it('returns an empty list when there is no marker tagset', () => {
    expect(getBoardColumns({ classification: { tagsets: [] } })).toEqual([]);
    expect(getBoardColumns(undefined)).toEqual([]);
  });
});

describe('getContributionColumn', () => {
  it('reads the single task tag', () => {
    expect(getContributionColumn(contribution('c1', 'To do'))).toBe('To do');
  });

  it('is undefined with no classification', () => {
    expect(getContributionColumn(contribution('c1'))).toBeUndefined();
  });
});

describe('groupContributionsByColumn', () => {
  it('groups tasks under their columns, zero-filling empties', () => {
    const grouped = groupContributionsByColumn(DEFAULT_COLUMNS, [
      contribution('a', 'Backlog'),
      contribution('b', 'Backlog'),
      contribution('c', 'Done'),
    ]);
    expect(grouped.get('Backlog')?.map(c => c.id)).toEqual(['a', 'b']);
    expect(grouped.get('To do')).toEqual([]);
    expect(grouped.get('In progress')).toEqual([]);
    expect(grouped.get('Done')?.map(c => c.id)).toEqual(['c']);
  });

  it('matches column values case-insensitively, keying by canonical spelling', () => {
    const grouped = groupContributionsByColumn(DEFAULT_COLUMNS, [contribution('a', 'to DO')]);
    expect(grouped.get('To do')?.map(c => c.id)).toEqual(['a']);
  });

  it('falls back to the first column for unknown or missing values', () => {
    const grouped = groupContributionsByColumn(DEFAULT_COLUMNS, [contribution('a', 'Archived'), contribution('b')]);
    expect(grouped.get('Backlog')?.map(c => c.id)).toEqual(['a', 'b']);
  });

  it('returns an empty map when there are no columns', () => {
    expect(groupContributionsByColumn([], [contribution('a', 'Backlog')]).size).toBe(0);
  });
});
