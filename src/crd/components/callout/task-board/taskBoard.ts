/**
 * Pure, presentational helpers for the Tasks board. These live in the CRD layer
 * so they carry no GraphQL or Apollo knowledge — inputs are plain shapes the
 * connector maps from generated types.
 *
 * A "Tasks board" is an ordinary posts callout carrying a reserved classification
 * tagset (named below). Its presence — together with a POSTS-only contribution
 * configuration and the build-time kill switch being enabled — flips the callout
 * into board mode. The tagset's `allowedValues` are the ordered columns; each
 * task's column is the single tag on the same-named tagset of its contribution's
 * classification.
 */

/** Reserved classification tagset name that marks a callout as a Tasks board. */
export const TASK_TAGSET_NAME = 'task';

/** A classification tagset as read from a callout or a contribution. */
export type BoardTagset = {
  name: string;
  /** Ordered column list — only meaningful on the callout-level marker tagset. */
  allowedValues?: string[];
  /** The selected value(s) — a task's column tag lives here on the contribution side. */
  tags?: string[];
};

export type BoardClassificationShape = {
  tagsets?: BoardTagset[];
};

export type BoardCalloutShape = {
  classification?: BoardClassificationShape | null;
  /** Allowed contribution types on the callout — a board is POSTS-only. */
  allowedContributionTypes?: string[];
};

export type BoardContributionShape = {
  id: string;
  classification?: BoardClassificationShape | null;
};

/** Case-insensitive lookup of the reserved task tagset on a classification. */
function findTaskTagset(classification?: BoardClassificationShape | null): BoardTagset | undefined {
  return classification?.tagsets?.find(tagset => tagset.name === TASK_TAGSET_NAME);
}

/**
 * Whether the board view is enabled at build time. The board is opt-in per
 * callout (via the marker), but the whole rendering can be switched off — a
 * board callout then falls back to the plain posts view. This gates rendering
 * only; it is never a server-side marker.
 */
export function isTaskBoardEnabled(): boolean {
  return import.meta.env.VITE_TASK_BOARD_DISABLED !== 'true';
}

/**
 * A callout is a Tasks board when it carries the reserved task tagset, collects
 * only POST contributions, and the board view is enabled. Any callout missing
 * the marker renders exactly as before.
 */
export function isTaskBoard(callout: BoardCalloutShape | undefined | null): boolean {
  if (!callout || !isTaskBoardEnabled()) return false;
  if (!findTaskTagset(callout.classification)) return false;
  const allowed = callout.allowedContributionTypes ?? [];
  // POSTS-only: exactly the POST contribution type. Matched case-insensitively
  // so the check is robust to enum serialization.
  return allowed.length === 1 && allowed[0].toLowerCase() === 'post';
}

/** Ordered column list of a board, from the marker tagset's allowedValues. */
export function getBoardColumns(callout: BoardCalloutShape | undefined | null): string[] {
  return findTaskTagset(callout?.classification)?.allowedValues ?? [];
}

/** The column value a contribution currently sits in, or undefined if none. */
export function getContributionColumn(contribution: BoardContributionShape): string | undefined {
  return findTaskTagset(contribution.classification)?.tags?.[0];
}

/**
 * Groups contributions into their columns, preserving input order within a
 * column. Matching is case-insensitive against the canonical column spelling.
 * Defensive: a contribution whose column value is missing or no longer on the
 * board falls into the first column — a state unreachable by any in-scope
 * operation, so this only guards a corrupt board.
 */
export function groupContributionsByColumn<T extends BoardContributionShape>(
  columns: string[],
  contributions: T[]
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const column of columns) {
    grouped.set(column, []);
  }
  if (columns.length === 0) return grouped;

  const firstColumn = columns[0];
  const canonicalByLower = new Map(columns.map(column => [column.toLowerCase(), column]));

  for (const contribution of contributions) {
    const value = getContributionColumn(contribution);
    const canonical = (value && canonicalByLower.get(value.toLowerCase())) || firstColumn;
    grouped.get(canonical)?.push(contribution);
  }
  return grouped;
}
