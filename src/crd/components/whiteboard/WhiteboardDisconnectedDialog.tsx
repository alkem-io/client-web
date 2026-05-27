import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';

type WhiteboardDisconnectedDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Dialog heading (resolved by the consumer — feature text). */
  title: ReactNode;
  /** Body message (online vs offline variant chosen by the consumer). */
  message: ReactNode;
  /** Optional "last saved …" line; omit to hide it. */
  lastSavedText?: ReactNode;
  /** Online enables the Reconnect button; offline disables it. */
  canReconnect: boolean;
  /** A reconnect attempt is in flight → spinner + busy state. */
  reconnecting?: boolean;
  /** Seconds until auto-reconnect; appended to the Reconnect label as "(Xs)" when > 0. */
  countdownSeconds?: number | null;
  onReconnect: () => void;
  className?: string;
};

/**
 * CRD "whiteboard disconnected / collaboration stopped" dialog — the CRD replacement for the MUI notice
 * in `CollaborativeExcalidrawWrapper`. Dismissal is handled by the CRD `Dialog` primitive (built-in
 * close X + outside-click / Escape), so there is no "Ok" button — only the Reconnect action, which keeps
 * the live auto-reconnect countdown. Feature text (title, message, last-saved) arrives as props; the
 * component owns only its action labels via `crd-whiteboard`.
 */
export function WhiteboardDisconnectedDialog({
  open,
  onClose,
  title,
  message,
  lastSavedText,
  canReconnect,
  reconnecting,
  countdownSeconds,
  onReconnect,
  className,
}: WhiteboardDisconnectedDialogProps) {
  const { t } = useTranslation('crd-whiteboard');
  const showCountdown = !reconnecting && typeof countdownSeconds === 'number' && countdownSeconds > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={isOpen => {
        if (!isOpen) onClose();
      }}
    >
      {/* `z-[70]` (content + overlay): opened on top of the whiteboard editor shell (`z-[60]`),
          so it must out-stack it — matching the TemplatePicker and readonly-reason dialogs. */}
      <DialogContent
        className={cn('z-[70] sm:max-w-md', className)}
        overlayClassName="z-[70]"
        closeLabel={t('disconnected.close')}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        {lastSavedText && <p className="text-caption text-muted-foreground">{lastSavedText}</p>}

        <div className="flex justify-end">
          <Button onClick={onReconnect} disabled={!canReconnect || reconnecting} aria-busy={reconnecting}>
            {reconnecting && <Loader2 className="size-4 mr-1 animate-spin" aria-hidden="true" />}
            {t('disconnected.reconnect')}
            {showCountdown && (
              <span className="ml-1 font-normal">{t('disconnected.countdown', { seconds: countdownSeconds })}</span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
