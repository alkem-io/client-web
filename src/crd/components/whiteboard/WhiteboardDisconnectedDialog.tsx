import { Loader2, RotateCcw } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';

/**
 * How long the modal may sit in a stuck state — the Reconnect button disabled (`!canReconnect`) or a
 * reconnect attempt busy (`reconnecting`) — before the "Reload page" escape hatch appears. On a
 * network switch `navigator.onLine` can stay stale for seconds to tens of seconds, during which
 * `canReconnect` is false, so the modal looks frozen with no user-actionable escape. This threshold
 * keeps the button off the fast, provider-owned self-healing reconnect path.
 */
const STUCK_RELOAD_THRESHOLD_MS = 6000;

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
  /** Optional caller-supplied retry countdown; appended to Reconnect as "(Xs)" when > 0. */
  countdownSeconds?: number | null;
  onReconnect: () => void;
  /** Hide the reconnect action for a terminal unavailable/access verdict. */
  showReconnect?: boolean;
  /**
   * Full page reload escape hatch. When provided, a "Reload page" button appears — always clickable,
   * independent of `canReconnect` / `reconnecting` — once the modal has been stuck past a short
   * timeout (or immediately when `hasError` is set), giving the user a guaranteed way to recover.
   */
  onReloadPage?: () => void;
  /** An error has been received → show the "Reload page" escape hatch immediately, no timeout wait. */
  hasError?: boolean;
  className?: string;
};

/**
 * CRD "whiteboard disconnected / collaboration stopped" dialog — the CRD replacement for the MUI notice
 * in `CollaborativeExcalidrawWrapper`. Dismissal is handled by the CRD `Dialog` primitive (built-in
 * close X + outside-click / Escape), so there is no "Ok" button — only the Reconnect action and a
 * "Reload page" escape hatch that surfaces when the modal gets stuck. Feature text (title, message,
 * last-saved) arrives as props; the component owns only its action labels via `crd-whiteboard`.
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
  showReconnect = true,
  onReloadPage,
  hasError,
  className,
}: WhiteboardDisconnectedDialogProps) {
  const { t } = useTranslation('crd-whiteboard');
  const showCountdown = !reconnecting && typeof countdownSeconds === 'number' && countdownSeconds > 0;

  // The modal is "stuck" whenever the Reconnect button offers no immediate action: it is disabled
  // (offline / `!canReconnect`) or busy (`reconnecting`). We reveal the reload escape hatch only after
  // that state has persisted past a short threshold, so it stays out of the normal fast-reconnect path.
  const isStuck = showReconnect && (!canReconnect || Boolean(reconnecting));
  const [stuckElapsed, setStuckElapsed] = useState(false);

  useEffect(() => {
    if (!open || !isStuck) {
      setStuckElapsed(false);
      return;
    }
    const timer = window.setTimeout(() => setStuckElapsed(true), STUCK_RELOAD_THRESHOLD_MS);
    return () => window.clearTimeout(timer);
  }, [open, isStuck]);

  const showReload = Boolean(onReloadPage) && (Boolean(hasError) || stuckElapsed);

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
        className={cn('z-[70] sm:max-w-md max-h-[90vh] flex flex-col overflow-hidden', className)}
        overlayClassName="z-[70]"
        closeLabel={t('disconnected.close')}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
          <DialogDescription>{message}</DialogDescription>
          {lastSavedText && <p className="text-caption text-muted-foreground">{lastSavedText}</p>}
        </div>

        <div className="flex justify-end gap-2 shrink-0">
          {showReload && (
            <Button variant="outline" onClick={onReloadPage}>
              <RotateCcw className="size-4 mr-1" aria-hidden="true" />
              {t('disconnected.reloadPage')}
            </Button>
          )}
          {showReconnect && (
            <Button onClick={onReconnect} disabled={!canReconnect || reconnecting} aria-busy={reconnecting}>
              {reconnecting && <Loader2 className="size-4 mr-1 animate-spin" aria-hidden="true" />}
              {t('disconnected.reconnect')}
              {showCountdown && (
                <span className="ml-1 font-normal">{t('disconnected.countdown', { seconds: countdownSeconds })}</span>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
