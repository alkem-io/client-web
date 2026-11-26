import { Columns3 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/crd/primitives/button';
import { useCachedPost } from '@/domain/collaboration/callout/useCalloutDetails/useCalloutDetails';
import { TaskBoardColumnsConnector } from './TaskBoardColumnsConnector';

type TaskBoardManageColumnsButtonProps = {
  calloutId: string;
  /** Classes to match the surrounding header icon buttons (fullscreen / close). */
  className?: string;
};

/**
 * Header icon button that opens the Tasks board column-management dialog without
 * leaving the board view. Shown only to those who may manage the board's columns. It
 * complements the same action in the callout 3-dots settings menu, giving admins
 * a way to manage columns while the board is open in its dialog / expanded view.
 */
export function TaskBoardManageColumnsButton({ calloutId, className }: TaskBoardManageColumnsButtonProps) {
  const { t } = useTranslation('crd-taskBoard');
  // The board post is in the cache (its card or its URL load); managing its columns is its `can.manageColumns`.
  const canEditColumns = useCachedPost(calloutId)?.can.manageColumns ?? false;
  const [open, setOpen] = useState(false);

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
