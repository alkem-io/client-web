import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  useMoveTaskToColumnMutation,
  useTaskBoardDataQuery,
  useUpdateContributionsSortOrderMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  type TaskBoardCalloutFragment,
  type TaskBoardContributionFragment,
} from '@/core/apollo/generated/graphql-schema';
import { TaskBoardView } from '@/crd/components/callout/task-board/TaskBoardView';
import { isTaskBoard, TASK_TAGSET_NAME } from '@/crd/components/callout/task-board/taskBoard';
import { cn } from '@/crd/lib/utils';
import { PostContributionAddConnector } from './PostContributionAddConnector';
import { applyMoveToCounts, contributionColumnTag, mapTaskBoardColumns } from './taskBoardMapper';

type TaskBoardConnectorProps = {
  calloutId: string;
  /** Fill the container height — set when rendered inside the board dialog. */
  fill?: boolean;
  /** Detect board-ness (fire `onBoardResolved`) but render nothing — for the
   *  deep-link view, which shows the board in a dialog rather than inline. */
  detectOnly?: boolean;
  /**
   * Fires once board detection resolves (true when the callout is a Tasks board).
   * Lets the consumer route "open the callout" to the board instead of the plain
   * post-detail dialog. Must be a stable callback.
   */
  onBoardResolved?: (isBoard: boolean) => void;
  /**
   * The normal POSTS contributions body. Rendered unchanged whenever this
   * callout is not a Tasks board (marker absent) or the board view is switched
   * off — so a non-board callout is byte-identical to before.
   */
  fallback: ReactNode;
  /** Opens the existing post detail dialog for a contribution. */
  onOpenTask?: (contributionId: string) => void;
};

/**
 * Decides whether a POSTS callout renders as a Tasks board. All task-board
 * GraphQL is isolated here; the shared callout model and its query are
 * untouched. When the callout is not a board, the provided fallback renders
 * verbatim. The board itself lives in an inner component so its hooks run
 * unconditionally regardless of the branch.
 */
export function TaskBoardConnector({
  calloutId,
  fill,
  detectOnly,
  onBoardResolved,
  fallback,
  onOpenTask,
}: TaskBoardConnectorProps) {
  const { data, loading } = useTaskBoardDataQuery({ variables: { calloutId } });

  const callout = data?.lookup.callout;
  const isBoard = Boolean(
    callout &&
      isTaskBoard({
        classification: { tagsets: callout.classification?.tagsets },
        allowedContributionTypes: callout.settings.contribution.allowedTypes.map(type => String(type)),
      })
  );

  // Report board-ness up so the consumer can open the callout to the board — but
  // only once the query has resolved. While loading, `callout` is undefined and
  // `isBoard` is a provisional `false`; reporting that would make the deep-link
  // view mount the post-detail dialog first and flash before swapping to the
  // board. The consumer keeps its "detection in flight" state until this fires.
  useEffect(() => {
    if (loading) return;
    onBoardResolved?.(isBoard);
  }, [loading, isBoard, onBoardResolved]);

  // Detection-only consumers (the deep-link view) render the board elsewhere.
  if (detectOnly) {
    return null;
  }

  if (!isBoard || !callout) {
    return <>{fallback}</>;
  }

  return <TaskBoardBody callout={callout} contributions={callout.contributions} fill={fill} onOpenTask={onOpenTask} />;
}

function TaskBoardBody({
  callout,
  contributions,
  fill,
  onOpenTask,
}: {
  callout: TaskBoardCalloutFragment;
  contributions: TaskBoardContributionFragment[];
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

  const privileges = callout.authorization?.myPrivileges ?? [];
  const canMove = privileges.includes(AuthorizationPrivilege.MoveTask);
  const canAdd = privileges.includes(AuthorizationPrivilege.Contribute);

  const columns = mapTaskBoardColumns(callout, contributions);

  // Persist a card order (every contribution id, in the board's new top-to-bottom
  // order). The board renders by sortOrder, so the optimistic response reassigns
  // sortOrder to that order (index-based) and the cards settle in place with no
  // refetch flicker; the server replaces the values with its own on completion,
  // preserving the same order. Shared by a within-column reorder and the
  // position half of a cross-column move.
  const persistOrder = (orderedCardIds: string[]) => {
    if (orderedCardIds.length === 0) return;
    void reorderTasks({
      variables: { calloutID: callout.id, contributionIds: orderedCardIds },
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
    const contribution = contributions.find(item => item.id === contributionId);
    const fromColumn = contribution ? contributionColumnTag(contribution) : undefined;

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
            id: contribution?.classification?.id ?? `${contributionId}-classification`,
            tagsets: [
              {
                __typename: 'Tagset',
                id: contribution?.classification?.tagsets?.[0]?.id ?? `${contributionId}-task`,
                name: TASK_TAGSET_NAME,
                tags: [toColumn],
              },
            ],
          },
          post: contribution?.post,
        },
      },
      update: cache => {
        // Patch the callout's authoritative counts so the header badges reflect
        // the move immediately; the server value replaces this on settle. The
        // stored entries carry a __typename that the helper preserves via spread.
        cache.modify<{ taskColumnCounts?: { column: string; count: number }[] }>({
          id: cache.identify({ __typename: 'Callout', id: callout.id }),
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
          calloutId={callout.id}
          taskColumn={addState.column}
          isTaskBoard={true}
          inlineTrigger={true}
          // The board can be fullscreen (a z-[100] portal), so the creation dialog
          // must stack above it — otherwise "Add task" opens behind the board and
          // appears to do nothing. z-[110] also sits safely above the feed.
          overlayClassName="z-[110]"
          contentClassName="z-[110]"
          open={true}
          onOpenChange={open => {
            if (!open) setAddState(undefined);
          }}
        />
      )}
    </div>
  );
}
