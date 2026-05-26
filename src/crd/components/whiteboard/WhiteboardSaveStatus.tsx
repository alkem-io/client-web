import { CloudCheck, CloudOff } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/crd/primitives/tooltip';

type WhiteboardSaveStatusProps = {
  /** Whether the last save succeeded — drives the icon and its colour. */
  saved: boolean;
  /** Status text for the hover tooltip and the dialog body (e.g. "Auto-saved last changes: 5 minutes ago"). */
  message: ReactNode;
  /**
   * Visible dialog title (e.g. the save-error "Warning"). When omitted the saved state shows no
   * visible title — only the close button — while still keeping an accessible (sr-only) title.
   */
  dialogTitle?: ReactNode;
  className?: string;
};

/**
 * Header save-status indicator for the whiteboard editor: a cloud icon (success/error) with a hover
 * tooltip and a click-to-open dialog showing the last-saved time or a save-error warning. The dialog
 * is the CRD `Dialog` primitive, so it ships a built-in close (X) button and dismisses on outside
 * click / Escape. All derived text (the elapsed-time message, the title) arrives as props.
 */
export function WhiteboardSaveStatus({ saved, message, dialogTitle, className }: WhiteboardSaveStatusProps) {
  const { t } = useTranslation('crd-whiteboard');
  const [open, setOpen] = useState(false);

  const Icon = saved ? CloudCheck : CloudOff;

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild={true}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(true)}
              aria-label={t('editor.saveStatus.label')}
              aria-haspopup="dialog"
              className={cn('size-8', className)}
            >
              <Icon className={cn('size-4', !saved && 'text-destructive')} aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">{message}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={open} onOpenChange={setOpen}>
        {/* `z-[70]` (content + overlay): this dialog opens on top of the whiteboard editor shell
            (`z-[60]`), so it must out-stack it — matching the TemplatePicker and readonly-reason dialogs. */}
        <DialogContent
          closeLabel={t('editor.saveStatus.close')}
          className="z-[70] sm:max-w-md"
          overlayClassName="z-[70]"
        >
          <DialogHeader>
            <DialogTitle className={cn(!dialogTitle && 'sr-only')}>
              {dialogTitle ?? t('editor.saveStatus.label')}
            </DialogTitle>
          </DialogHeader>
          <div className={cn('text-body text-foreground', saved && 'text-center')}>{message}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
