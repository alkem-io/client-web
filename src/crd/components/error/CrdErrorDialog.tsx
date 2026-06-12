import { TriangleAlert } from 'lucide-react';
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

export type CrdErrorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: ReactNode;
  reloadLabel: string;
  onReload: () => void;
};

/**
 * Presentational CRD error dialog (e.g. for a failed lazy chunk load). Props-only,
 * Tailwind + CRD primitives, no MUI / business logic / router. Mirrors
 * `CrdRedirectDialog`.
 */
export function CrdErrorDialog({ open, onOpenChange, title, message, reloadLabel, onReload }: CrdErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TriangleAlert aria-hidden="true" className="size-5 text-muted-foreground" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription asChild={true}>
          <div className="text-body text-muted-foreground">{message}</div>
        </DialogDescription>
        <DialogFooter>
          <Button type="button" onClick={onReload}>
            {reloadLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
