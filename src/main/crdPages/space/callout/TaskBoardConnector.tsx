import { Columns3 } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  useCreateTaskColumnOnCalloutMutation,
  useDeleteTaskColumnOnCalloutMutation,
  useMoveTaskToColumnMutation,
  useTaskBoardDataQuery,
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
import { Button } from '@/crd/primitives/button';
import { PostContributionAddConnector } from './PostContributionAddConnector';
import { applyMoveToCounts, contributionColumnTag, mapTaskBoardColumns } from './taskBoardMapper';

type TaskBoardConnectorProps = {
  calloutId: string;
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
export function TaskBoardConnector({ calloutId, fallback, onOpenTask }: TaskBoardConnectorProps) {
  const { data } = useTaskBoardDataQuery({ variables: { calloutId } });

  const callout = data?.lookup.callout;
  if (
    !callout ||
    !isTaskBoard({
      classification: { tagsets: callout.classification?.tagsets },
      allowedContributionTypes: callout.settings.contribution.allowedTypes.map(type => String(type)),
    })
  ) {
    return <>{fallback}</>;
  }

  return <TaskBoardBody callout={callout} contributions={callout.contributions} onOpenTask={onOpenTask} />;
}

function TaskBoardBody({
  callout,
  contributions,
  onOpenTask,
}: {
  callout: TaskBoardCalloutFragment;
  contributions: TaskBoardContributionFragment[];
  onOpenTask?: (contributionId: string) => void;
}) {
  const { t } = useTranslation('crd-taskBoard');
  const [moveTask] = useMoveTaskToColumnMutation();
  const [createColumn] = useCreateTaskColumnOnCalloutMutation();
  const [renameColumn] = useUpdateTaskColumnOnCalloutMutation();
  const [deleteColumn] = useDeleteTaskColumnOnCalloutMutation();
  const [reorderColumns] = useUpdateTaskColumnsSortOrderOnCalloutMutation();
  // Creation dialog state: `undefined` closed; a string opens the existing post
  // creation flow pre-targeted at that column.
  const [addColumn, setAddColumn] = useState<string | undefined>();
  const [columnsOpen, setColumnsOpen] = useState(false);

  const privileges = callout.authorization?.myPrivileges ?? [];
  const canMove = privileges.includes(AuthorizationPrivilege.MoveTask);
  const canAdd = privileges.includes(AuthorizationPrivilege.Contribute);
  const canEditColumns = privileges.includes(AuthorizationPrivilege.Update);

  const columns = mapTaskBoardColumns(callout, contributions);
  const columnNames = getBoardColumns({ classification: { tagsets: callout.classification?.tagsets } });

  const handleMoveTask = (contributionId: string, toColumn: string) => {
    const contribution = contributions.find(item => item.id === contributionId);
    const fromColumn = contribution ? contributionColumnTag(contribution) : undefined;

    void moveTask({
      variables: { moveData: { contributionID: contributionId, column: toColumn } },
      optimisticResponse: {
        moveTaskToColumn: {
          __typename: 'CalloutContribution',
          id: contributionId,
          sortOrder: contribution?.sortOrder ?? 0,
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
    });
  };

  return (
    <>
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
        canAdd={canAdd}
        canMove={canMove}
        addLabel={t('addTask')}
        emptyLabel={t('emptyColumn')}
        onAddTask={canAdd ? column => setAddColumn(column) : undefined}
        onOpenTask={onOpenTask}
        onMoveTask={handleMoveTask}
      />
      {canEditColumns && (
        <TaskBoardColumnsDialog
          open={columnsOpen}
          onOpenChange={setColumnsOpen}
          columns={columnNames.map(name => ({ name }))}
          onAddColumn={name => {
            void createColumn({ variables: { columnData: { calloutID: callout.id, name } } });
          }}
          onRenameColumn={(currentName, nextName) => {
            void renameColumn({ variables: { columnData: { calloutID: callout.id, currentName, newName: nextName } } });
          }}
          onReorderColumns={orderedNames => {
            void reorderColumns({
              variables: { sortOrderData: { calloutID: callout.id, columnNames: orderedNames } },
            });
          }}
          onDeleteColumn={name => {
            void deleteColumn({ variables: { columnData: { calloutID: callout.id, name } } });
          }}
        />
      )}
      {addColumn !== undefined && (
        // Reuse the existing post creation dialog, pre-targeted at the picked
        // column. The refetch of TaskBoardData (inside the dialog) surfaces the
        // new card under its column with updated counts.
        <PostContributionAddConnector
          calloutId={callout.id}
          taskColumn={addColumn}
          inlineTrigger={true}
          open={addColumn !== undefined}
          onOpenChange={open => {
            if (!open) setAddColumn(undefined);
          }}
        />
      )}
    </>
  );
}
