import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useMoveTaskToColumnMutation, useTaskBoardDataQuery } from '@/core/apollo/generated/apollo-hooks';
import {
  AuthorizationPrivilege,
  type TaskBoardCalloutFragment,
  type TaskBoardContributionFragment,
} from '@/core/apollo/generated/graphql-schema';
import { TaskBoardView } from '@/crd/components/callout/task-board/TaskBoardView';
import { isTaskBoard, TASK_TAGSET_NAME } from '@/crd/components/callout/task-board/taskBoard';
import { applyMoveToCounts, contributionColumnTag, mapTaskBoardColumns } from './taskBoardMapper';

type TaskBoardConnectorProps = {
  calloutId: string;
  /**
   * The normal POSTS contributions body. Rendered unchanged whenever this
   * callout is not a Tasks board (marker absent) or the board view is switched
   * off — so a non-board callout is byte-identical to before.
   */
  fallback: ReactNode;
  /** Opens the existing post creation dialog pre-targeted at a column. */
  onAddTask?: (column: string) => void;
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
export function TaskBoardConnector({ calloutId, fallback, onAddTask, onOpenTask }: TaskBoardConnectorProps) {
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

  return (
    <TaskBoardBody
      callout={callout}
      contributions={callout.contributions}
      onAddTask={onAddTask}
      onOpenTask={onOpenTask}
    />
  );
}

function TaskBoardBody({
  callout,
  contributions,
  onAddTask,
  onOpenTask,
}: {
  callout: TaskBoardCalloutFragment;
  contributions: TaskBoardContributionFragment[];
  onAddTask?: (column: string) => void;
  onOpenTask?: (contributionId: string) => void;
}) {
  const { t } = useTranslation('crd-taskBoard');
  const [moveTask] = useMoveTaskToColumnMutation();

  const privileges = callout.authorization?.myPrivileges ?? [];
  const canMove = privileges.includes(AuthorizationPrivilege.MoveTask);
  const canAdd = privileges.includes(AuthorizationPrivilege.Contribute);

  const columns = mapTaskBoardColumns(callout, contributions);

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
    <TaskBoardView
      columns={columns}
      canAdd={canAdd}
      canMove={canMove}
      addLabel={t('addTask')}
      emptyLabel={t('emptyColumn')}
      onAddTask={onAddTask}
      onOpenTask={onOpenTask}
      onMoveTask={handleMoveTask}
    />
  );
}
