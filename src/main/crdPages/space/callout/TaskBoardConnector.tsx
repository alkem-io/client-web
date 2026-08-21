import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useTaskBoardDataQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { TaskBoardView } from '@/crd/components/callout/task-board/TaskBoardView';
import { isTaskBoard } from '@/crd/components/callout/task-board/taskBoard';
import { mapTaskBoardColumns } from './taskBoardMapper';

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
 * Decides whether a POSTS callout renders as a Tasks board and, if so, maps the
 * board query into the presentational view. All task-board GraphQL is isolated
 * here; the shared callout model and its query are untouched. When the callout
 * is not a board, the connector renders the provided fallback verbatim.
 */
export function TaskBoardConnector({ calloutId, fallback, onAddTask, onOpenTask }: TaskBoardConnectorProps) {
  const { t } = useTranslation('crd-taskBoard');
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

  const privileges = callout.authorization?.myPrivileges ?? [];
  const canAdd = privileges.includes(AuthorizationPrivilege.Contribute);

  const columns = mapTaskBoardColumns(callout, callout.contributions);

  return (
    <TaskBoardView
      columns={columns}
      canAdd={canAdd}
      addLabel={t('addTask')}
      emptyLabel={t('emptyColumn')}
      onAddTask={onAddTask}
      onOpenTask={onOpenTask}
    />
  );
}
