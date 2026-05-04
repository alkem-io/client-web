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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock aria-hidden="true" className="size-5 text-muted-foreground" />
            {title}
          </DialogTitle>
          <DialogDescription asChild={true}>
            <div className="text-body text-muted-foreground">{message}</div>
          </DialogDescription>
        </DialogHeader>
        {ancestorSlot && <div className="py-2">{ancestorSlot}</div>}
        <DialogFooter className="flex-row items-center justify-between gap-2 sm:justify-between">
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
