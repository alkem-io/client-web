import { Columns3 } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  useCreateTaskColumnOnCalloutMutation,
  useDeleteTaskColumnOnCalloutMutation,
  useMoveTaskToColumnMutation,
  useTaskBoardDataQuery,
  useUpdateContributionsSortOrderMutation,
  useUpdateTaskColumnOnCalloutMutation,
  useUpdateTaskColumnsSortOrderOnCalloutMutation,
} from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  type TaskBoardCalloutFragment,
  type TaskBoardContributionFragment,
} from '@/core/apollo/generated/graphql-schema';
import { TaskBoardColumnsDialog } from '@/crd/components/callout/task-board/TaskBoardColumnsDialog';
import { TaskBoardView } from '@/crd/components/callout/task-board/TaskBoardView';
import { getBoardColumns, isTaskBoard, TASK_TAGSET_NAME } from '@/crd/components/callout/task-board/taskBoard';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
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
  const { data } = useTaskBoardDataQuery({ variables: { calloutId } });

  const callout = data?.lookup.callout;
  const isBoard = Boolean(
    callout &&
      isTaskBoard({
        classification: { tagsets: callout.classification?.tagsets },
        allowedContributionTypes: callout.settings.contribution.allowedTypes.map(type => String(type)),
      })
  );

  // Report board-ness up so the consumer can open the callout to the board.
  useEffect(() => {
    onBoardResolved?.(isBoard);
  }, [isBoard, onBoardResolved]);

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
  const [createColumn] = useCreateTaskColumnOnCalloutMutation();
  const [renameColumn] = useUpdateTaskColumnOnCalloutMutation();
  const [deleteColumn] = useDeleteTaskColumnOnCalloutMutation();
  const [reorderColumns] = useUpdateTaskColumnsSortOrderOnCalloutMutation();
  // Creation dialog state: closed when undefined. When open, `column` is the
  // per-column add's pre-targeted column. Using an explicit open flag keeps an
  // add with no column distinct from the closed state.
  const [addState, setAddState] = useState<{ column?: string } | undefined>();
  const [columnsOpen, setColumnsOpen] = useState(false);

  const privileges = callout.authorization?.myPrivileges ?? [];
  const canMove = privileges.includes(AuthorizationPrivilege.MoveTask);
  const canAdd = privileges.includes(AuthorizationPrivilege.Contribute);
  const canEditColumns = privileges.includes(AuthorizationPrivilege.Update);

  const columns = mapTaskBoardColumns(callout, contributions);
  const columnNames = getBoardColumns({ classification: { tagsets: callout.classification?.tagsets } });

  // Surface a toast for a failed column mutation and re-throw so the dialog's
  // save sweep aborts and keeps itself open. Column edits run in their own
  // server transactions under a template-row lock, so the sweep must sequence
  // creates/renames before the reorder (a reorder naming a not-yet-committed
  // column fails the server's permutation check).
  const runColumnMutation = async (mutate: () => Promise<unknown>): Promise<void> => {
    try {
      await mutate();
    } catch (error) {
      toast.error(t('columns.saveError'));
      throw error;
    }
  };

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
      {canEditColumns && (
        <div className="mb-2 flex justify-end">
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setColumnsOpen(true)}>
            <Columns3 aria-hidden="true" className="size-4" />
            {t('columns.manage')}
          </Button>
        </div>
      )}
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
      {canEditColumns && (
        <TaskBoardColumnsDialog
          open={columnsOpen}
          onOpenChange={setColumnsOpen}
          columns={columnNames.map(name => ({ name }))}
          onAddColumn={name =>
            runColumnMutation(() => createColumn({ variables: { columnData: { calloutID: callout.id, name } } }))
          }
          onRenameColumn={(currentName, nextName) =>
            runColumnMutation(() =>
              renameColumn({ variables: { columnData: { calloutID: callout.id, currentName, newName: nextName } } })
            )
          }
          onReorderColumns={orderedNames =>
            runColumnMutation(() =>
              reorderColumns({ variables: { sortOrderData: { calloutID: callout.id, columnNames: orderedNames } } })
            )
          }
          onDeleteColumn={name =>
            runColumnMutation(() => deleteColumn({ variables: { columnData: { calloutID: callout.id, name } } }))
          }
          // The dialog fires deletes only during its Save sweep (alongside
          // creates/renames/reorder), never on the trash click — so a delete's
          // refetch never reseeds and discards the admin's other queued edits.
        />
      )}
      {addState !== undefined && (
        // Reuse the existing post creation dialog, pre-targeted at the picked
        // column. The refetch of TaskBoardData (inside the dialog) surfaces the
        // new card under its column with updated counts.
        <PostContributionAddConnector
          calloutId={callout.id}
          taskColumn={addState.column}
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
