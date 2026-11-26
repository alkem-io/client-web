import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  useMoveTaskToColumnMutation,
  useUpdateContributionsSortOrderMutation,
} from '@/core/apollo/generated/apollo-hooks';
import type { PostBodyFragment, ResponseCardFragment } from '@/core/apollo/generated-v2/graphql-schema';
import { TaskBoardView } from '@/crd/components/callout/task-board/TaskBoardView';
import { TASK_TAGSET_NAME } from '@/crd/components/callout/task-board/taskBoard';
import { cn } from '@/crd/lib/utils';
import { useCachedPost } from '@/domain/collaboration/callout/useCalloutDetails/useCalloutDetails';
import { PostContributionAddConnector } from './PostContributionAddConnector';
import { applyMoveToCounts } from './taskBoardMapper';

type TaskBoardConnectorProps = {
  calloutId: string;
  /** Fill the container height — set when rendered inside the board dialog. */
  fill?: boolean;
  /** Rendered when the post is not a task board. */
  fallback: ReactNode;
  onOpenTask?: (contributionId: string) => void;
};

type TaskBoardContent = Extract<NonNullable<PostBodyFragment['content']>, { __typename: 'TaskBoardContent' }>;

/**
 * 021 FR-009 / H19: the board is the post of content kind `task_board`; its columns and its complete task list
 * arrive in its own content, in the feed window of its card (or the post URL's load), so the board sends nothing.
 */
export function TaskBoardConnector({ calloutId, fill, fallback, onOpenTask }: TaskBoardConnectorProps) {
  const board = useCachedPost(calloutId);
  const content = board?.contentKind === 'task_board' ? (board.content as TaskBoardContent | null) : undefined;
  if (!board || !content) {
    return <>{fallback}</>;
  }
  return <TaskBoardBody board={board} content={content} fill={fill} onOpenTask={onOpenTask} />;
}

const taskCard = (task: ResponseCardFragment) => ({
  id: task.id,
  title: task.about.displayName,
  description: task.about.description || undefined,
  tags: task.tags,
  commentCount: task.room?.messageCount,
});

function TaskBoardBody({
  board,
  content,
  fill,
  onOpenTask,
}: {
  board: PostBodyFragment;
  content: TaskBoardContent;
  fill?: boolean;
  onOpenTask?: (contributionId: string) => void;
}) {
  const { t } = useTranslation('crd-taskBoard');
  const [moveTask] = useMoveTaskToColumnMutation();
  const [reorderTasks] = useUpdateContributionsSortOrderMutation();
  // Creation dialog state: closed when undefined. When open, `column` is the
  // per-column add's pre-targeted column. Using an explicit open flag keeps an
  // add with no column distinct from the closed state.
  const [addState, setAddState] = useState<{ column?: string } | undefined>();

  const canMove = board.can.moveTask;
  const canAdd = board.can.respond;
  const tasks = [...content.tasks].sort((a, b) => a.sortOrder - b.sortOrder);
  const columns = [...content.columns]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(column => {
      const cards = tasks.filter(task => task.stage?.id === column.id).map(taskCard);
      return { name: column.name, count: cards.length, cards };
    });

  // Persist a card order (every contribution id, in the board's new top-to-bottom
  // order). The board renders by sortOrder, so the optimistic response reassigns
  // sortOrder to that order (index-based) and the cards settle in place with no
  // refetch flicker; the server replaces the values with its own on completion,
  // preserving the same order. Shared by a within-column reorder and the
  // position half of a cross-column move.
  const persistOrder = (orderedCardIds: string[]) => {
    if (orderedCardIds.length === 0) return;
    void reorderTasks({
      variables: { calloutID: board.id, contributionIds: orderedCardIds },
      optimisticResponse: {
        updateContributionsSortOrder: orderedCardIds.map((id, index) => ({
          __typename: 'CalloutContribution',
          id,
          sortOrder: index,
        })),
      },
      onError: () => {
        toast.error(t('moveError'));
      },
    });
  };

  const handleMoveTask = (contributionId: string, toColumn: string, orderedCardIds: string[]) => {
    const task = tasks.find(item => item.id === contributionId);
    const fromColumn = content.columns.find(column => column.id === task?.stage?.id)?.name;

    void moveTask({
      variables: { moveData: { contributionID: contributionId, column: toColumn } },
      optimisticResponse: {
        moveTaskToColumn: {
          __typename: 'CalloutContribution',
          id: contributionId,
          // Optimistic hint only; the sort-order pass below is authoritative.
          sortOrder: orderedCardIds.indexOf(contributionId),
          classification: {
            __typename: 'Classification',
            id: `${contributionId}-classification`,
            tagsets: [
              {
                __typename: 'Tagset',
                id: `${contributionId}-task`,
                name: TASK_TAGSET_NAME,
                tags: [toColumn],
              },
            ],
          },
          post: undefined,
        },
      },
      update: cache => {
        // Patch the callout's authoritative counts so the header badges reflect
        // the move immediately; the server value replaces this on settle. The
        // stored entries carry a __typename that the helper preserves via spread.
        cache.modify<{ taskColumnCounts?: { column: string; count: number }[] }>({
          id: cache.identify({ __typename: 'Callout', id: board.id }),
          fields: {
            taskColumnCounts(existing = []) {
              // These entries have no id, so the cache stores them inline (never
              // as references); reading column/count directly is safe.
              return applyMoveToCounts(existing as { column: string; count: number }[], fromColumn, toColumn);
            },
          },
        });
      },
      onError: () => {
        toast.error(t('moveError'));
      },
    })
      // Persist the dropped position within the destination column, but only
      // AFTER the column move has settled on the server. moveTaskToColumn assigns
      // its own sortOrder to the moved card; issuing the reorder afterwards makes
      // it the authoritative last write, so the card lands — and stays — exactly
      // where it was dropped. Firing both at once let the server apply them in a
      // nondeterministic order, so the persisted position could disagree with the
      // dropped one. The optimistic column re-tag above already shows the card in
      // the destination column instantly; the reorder settles its exact slot a
      // moment later.
      .then(() => persistOrder(orderedCardIds))
      .catch(() => {
        // A failed move already surfaced its toast; do not reorder on top of it.
      });
  };

  return (
    <div className={cn(fill && 'flex flex-col h-full min-h-0')}>
      <TaskBoardView
        columns={columns}
        fill={fill}
        canAdd={canAdd}
        canMove={canMove}
        addLabel={t('addTask')}
        emptyLabel={t('emptyColumn')}
        onAddTask={canAdd ? column => setAddState({ column }) : undefined}
        onOpenTask={onOpenTask}
        onMoveTask={handleMoveTask}
        onReorder={canMove ? persistOrder : undefined}
      />
      {addState !== undefined && (
        // Reuse the existing post creation dialog, pre-targeted at the picked
        // column. The refetch of TaskBoardData (inside the dialog) surfaces the
        // new card under its column with updated counts.
        <PostContributionAddConnector
          calloutId={board.id}
          taskColumn={addState.column}
          isTaskBoard={true}
          // Seed a new task from the board's contribution defaults (the "default
          // task template" set at creation) — title + description — instead of the
          // generic "New Post" fallback. Mirrors the non-board add flow in
          // CalloutDetailDialogConnector.
          inlineTrigger={true}
          // The board is a Radix dialog (z-50, fullscreen via the DOM Fullscreen
          // API — not a z-[100] portal), so the creation dialog only needs to sit
          // just above it. z-[60] keeps it above the board (and the feed) while
          // staying BELOW the markdown editor's own toolbar dialogs (image / link /
          // embed, z-[70]) — otherwise the image-upload dialog opens behind the
          // create dialog and appears to do nothing.
          overlayClassName="z-[60]"
          contentClassName="z-[60]"
          open={true}
          onOpenChange={open => {
            if (!open) setAddState(undefined);
          }}
        />
      )}
    </div>
  );
}
