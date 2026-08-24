import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFullscreen } from '@/core/ui/fullscreen/useFullscreen';
import { CrdFullscreenButton } from '@/crd/components/common/CrdFullscreenButton';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/crd/primitives/dialog';
import { TaskBoardConnector } from './TaskBoardConnector';

type TaskBoardDialogProps = {
  calloutId: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Opens a task (post) on top of the board — the connector fires this per card. */
  onOpenTask?: (contributionId: string) => void;
};

/**
 * Opens a Tasks board in a callout dialog — the same shape as the whiteboard /
 * memo dialogs: a titled header with a fullscreen toggle and close on the right,
 * and the board filling the body. Fullscreen uses the DOM Fullscreen API (via
 * `CrdFullscreenButton`, document root) so the browser goes fullscreen exactly
 * like the whiteboard/memo experience; the shell also stretches to `inset-0`
 * while fullscreen so the board uses the whole viewport.
 */
export function TaskBoardDialog({ calloutId, title, open, onOpenChange, onOpenTask }: TaskBoardDialogProps) {
  const { t } = useTranslation('crd-common');
  const { fullscreen } = useFullscreen();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex flex-col p-0 gap-0 overflow-hidden bg-background',
          fullscreen
            ? 'max-w-none w-screen h-screen rounded-none border-none'
            : 'w-full sm:max-w-6xl h-[85vh] rounded-xl'
        )}
        aria-describedby="task-board-dialog-description"
      >
        <div className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-border">
          <DialogTitle className="min-w-0 truncate text-section-title text-foreground">{title}</DialogTitle>
          <DialogDescription id="task-board-dialog-description" className="sr-only">
            {title}
          </DialogDescription>
          <div className="flex items-center gap-1 shrink-0">
            <CrdFullscreenButton label={t('fullscreen')} forceExit={!open} />
            <DialogClose asChild={true}>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
                aria-label={t('close')}
              >
                <X className="size-5" aria-hidden="true" />
              </Button>
            </DialogClose>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden p-4">
          <TaskBoardConnector calloutId={calloutId} fill={true} onOpenTask={onOpenTask} fallback={null} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
