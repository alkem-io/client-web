import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  useCreateTaskColumnOnCalloutMutation,
  useDeleteTaskColumnOnCalloutMutation,
  useUpdateTaskColumnOnCalloutMutation,
  useUpdateTaskColumnsSortOrderOnCalloutMutation,
} from '@/core/apollo/generated/apollo-hooks';
import type { PostBodyFragment } from '@/core/apollo/generated-v2/graphql-schema';
import { TaskBoardColumnsDialog } from '@/crd/components/callout/task-board/TaskBoardColumnsDialog';
import { useCachedPost } from '@/domain/collaboration/callout/useCalloutDetails/useCalloutDetails';

type TaskBoardContent = Extract<NonNullable<PostBodyFragment['content']>, { __typename: 'TaskBoardContent' }>;

type TaskBoardColumnsConnectorProps = {
  calloutId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Owns the column-management dialog for a Tasks board, mounted from the
 * callout's 3-dots settings menu (`CalloutSettingsConnector`) rather than the
 * board content. Reads the board's columns and runs the four column mutations.
 */
export function TaskBoardColumnsConnector({ calloutId, open, onOpenChange }: TaskBoardColumnsConnectorProps) {
  const { t } = useTranslation('crd-taskBoard');
  // 021 H19: the board's columns are its TaskBoardContent, already in the cache with its card; no request.
  const board = useCachedPost(calloutId);
  const content = board?.contentKind === 'task_board' ? (board.content as TaskBoardContent | null) : undefined;
  const [createColumn] = useCreateTaskColumnOnCalloutMutation();
  const [renameColumn] = useUpdateTaskColumnOnCalloutMutation();
  const [deleteColumn] = useDeleteTaskColumnOnCalloutMutation();
  const [reorderColumns] = useUpdateTaskColumnsSortOrderOnCalloutMutation();

  const columnNames = [...(content?.columns ?? [])]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(column => column.name);

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

  return (
    <TaskBoardColumnsDialog
      open={open}
      onOpenChange={onOpenChange}
      columns={columnNames.map(name => ({ name }))}
      onAddColumn={name =>
        runColumnMutation(() => createColumn({ variables: { columnData: { calloutID: calloutId, name } } }))
      }
      onRenameColumn={(currentName, nextName) =>
        runColumnMutation(() =>
          renameColumn({ variables: { columnData: { calloutID: calloutId, currentName, newName: nextName } } })
        )
      }
      onReorderColumns={orderedNames =>
        runColumnMutation(() =>
          reorderColumns({ variables: { sortOrderData: { calloutID: calloutId, columnNames: orderedNames } } })
        )
      }
      onDeleteColumn={name =>
        runColumnMutation(() => deleteColumn({ variables: { columnData: { calloutID: calloutId, name } } }))
      }
      // The dialog fires deletes only during its Save sweep (alongside
      // creates/renames/reorder), never on the trash click — so a delete's
      // refetch never reseeds and discards the admin's other queued edits.
    />
  );
}
