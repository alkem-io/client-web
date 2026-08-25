import { Columns3 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTaskBoardDataQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { Button } from '@/crd/primitives/button';
import { TaskBoardColumnsConnector } from './TaskBoardColumnsConnector';

type TaskBoardManageColumnsButtonProps = {
  calloutId: string;
  /** Classes to match the surrounding header icon buttons (fullscreen / close). */
  className?: string;
};

/**
 * Header icon button that opens the Tasks board column-management dialog without
 * leaving the board view. Shown only to callout admins (UPDATE privilege). It
 * complements the same action in the callout 3-dots settings menu, giving admins
 * a way to manage columns while the board is open in its dialog / expanded view.
 * The `TaskBoardData` query is deduped by Apollo, so it adds no extra network cost.
 */
export function TaskBoardManageColumnsButton({ calloutId, className }: TaskBoardManageColumnsButtonProps) {
  const { t } = useTranslation('crd-taskBoard');
  const { data } = useTaskBoardDataQuery({ variables: { calloutId } });
  const [open, setOpen] = useState(false);

  const canEditColumns = (data?.lookup.callout?.authorization?.myPrivileges ?? []).includes(
    AuthorizationPrivilege.Update
  );
  if (!canEditColumns) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={className}
        aria-label={t('columns.manage')}
        onClick={() => setOpen(true)}
      >
        <Columns3 className="size-5" aria-hidden="true" />
      </Button>
      <TaskBoardColumnsConnector calloutId={calloutId} open={open} onOpenChange={setOpen} />
    </>
  );
}
