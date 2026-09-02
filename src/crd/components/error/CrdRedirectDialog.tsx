import { Lock } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/crd/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/crd/primitives/dialog';

export type CrdRedirectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: ReactNode;
  countdownLabel?: string;
  cancelCountdownLabel?: string;
  goNowLabel: string;
  cancelled: boolean;
  onCancelCountdown: () => void;
  onGoNow: () => void;
  ancestorSlot?: ReactNode;
};

export function CrdRedirectDialog({
  open,
  onOpenChange,
  title,
  message,
  countdownLabel,
  cancelCountdownLabel,
  goNowLabel,
  cancelled,
  onCancelCountdown,
  onGoNow,
  ancestorSlot,
}: CrdRedirectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Lock aria-hidden="true" className="size-5 text-muted-foreground" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
          <DialogDescription asChild={true}>
            <div className="text-body text-muted-foreground">{message}</div>
          </DialogDescription>
          {ancestorSlot && <div className="py-2">{ancestorSlot}</div>}
        </div>
        <DialogFooter className="shrink-0 flex-row items-center justify-between gap-2 sm:justify-between">
          <span className="text-caption text-muted-foreground">
            {!cancelled && countdownLabel && (
              <>
                {countdownLabel}
                {cancelCountdownLabel && (
                  <button
                    type="button"
                    onClick={onCancelCountdown}
                    className="ml-1 cursor-pointer text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {cancelCountdownLabel}
                  </button>
                )}
              </>
            )}
          </span>
          <Button type="button" onClick={onGoNow}>
            {goNowLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
