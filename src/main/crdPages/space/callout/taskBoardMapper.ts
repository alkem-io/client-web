import type { TaskBoardCalloutFragment, TaskBoardContributionFragment } from '@/core/apollo/generated/graphql-schema';
import type { TaskBoardCardModel, TaskBoardColumnModel } from '@/crd/components/callout/task-board/TaskBoardView';
import {
  getBoardColumns,
  groupContributionsByColumn,
  TASK_TAGSET_NAME,
} from '@/crd/components/callout/task-board/taskBoard';

/** Adapts a generated callout fragment to the plain board-callout shape the helpers read. */
function toBoardCallout(callout: TaskBoardCalloutFragment) {
  return {
    classification: {
      tagsets: (callout.classification?.tagsets ?? []).map(tagset => ({
        name: tagset.name,
        allowedValues: tagset.allowedValues,
      })),
    },
    allowedContributionTypes: callout.settings.contribution.allowedTypes.map(type => String(type)),
  };
}

/** Adapts a generated contribution fragment to the plain grouping shape. */
function toBoardContribution(contribution: TaskBoardContributionFragment) {
  return {
    id: contribution.id,
    classification: {
      tagsets: (contribution.classification?.tagsets ?? []).map(tagset => ({
        name: tagset.name,
        tags: tagset.tags,
      })),
    },
  };
}

/** Renders a single contribution into the presentational card model. */
function toCardModel(contribution: TaskBoardContributionFragment): TaskBoardCardModel {
  const post = contribution.post;
  const authorProfile = post?.createdBy?.profile;
  return {
    id: contribution.id,
    title: post?.profile.displayName ?? '',
    author: authorProfile
      ? { name: authorProfile.displayName, avatarUrl: authorProfile.avatar?.uri || undefined }
      : undefined,
    description: post?.profile.description || undefined,
    tags: post?.profile.tagset?.tags,
    commentCount: post?.comments.messagesCount,
  };
}

/**
 * Builds the ordered column models for the board view: columns come from the
 * marker tagset's allowedValues, each header count from the server-authoritative
 * `taskColumnCounts` (never the card list length), and cards are grouped by the
 * contribution's task tag.
 */
export function mapTaskBoardColumns(
  callout: TaskBoardCalloutFragment,
  contributions: TaskBoardContributionFragment[]
): TaskBoardColumnModel[] {
  const columns = getBoardColumns(toBoardCallout(callout));
  const countByColumn = new Map<string, number>();
  for (const entry of callout.taskColumnCounts ?? []) {
    countByColumn.set(entry.column.toLowerCase(), entry.count);
  }

  // Cards render in ascending sortOrder within each column — the same canonical
  // order used everywhere else contributions are listed (e.g. the contributions
  // sort dialog). Sorting here also lets an optimistic sortOrder update from a
  // within-column drag reorder the board immediately, with no refetch flicker.
  const ordered = [...contributions].sort((a, b) => a.sortOrder - b.sortOrder);

  const grouped = groupContributionsByColumn(
    columns,
    ordered.map(contribution => ({ ...toBoardContribution(contribution), source: contribution }))
  );

  return columns.map(column => ({
    name: column,
    count: countByColumn.get(column.toLowerCase()) ?? 0,
    cards: (grouped.get(column) ?? []).map(item => toCardModel(item.source)),
  }));
}

/** The reserved column tag a contribution currently sits in, if any. */
export function contributionColumnTag(contribution: TaskBoardContributionFragment): string | undefined {
  return contribution.classification?.tagsets?.find(tagset => tagset.name === TASK_TAGSET_NAME)?.tags[0];
}

export type TaskColumnCount = { column: string; count: number };

/**
 * Applies a single task move to the server-authoritative counts: one off the
 * source column, one onto the destination. Case-insensitive on column names and
 * clamped at zero. Returns a new array; the input is not mutated. Used to build
 * the optimistic count update so the header badges reflect the move immediately.
 */
export function applyMoveToCounts(
  counts: readonly TaskColumnCount[],
  fromColumn: string | undefined,
  toColumn: string
): TaskColumnCount[] {
  const from = fromColumn?.toLowerCase();
  const to = toColumn.toLowerCase();
  return counts.map(entry => {
    const key = entry.column.toLowerCase();
    if (from && key === from) return { ...entry, count: Math.max(0, entry.count - 1) };
    if (key === to) return { ...entry, count: entry.count + 1 };
    return entry;
  });
}
