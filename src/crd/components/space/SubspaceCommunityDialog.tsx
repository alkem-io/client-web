import { Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';

export type SubspaceCommunityDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  closeLabel?: string;
  children: ReactNode;
};

export function SubspaceCommunityDialog({
  open,
  onOpenChange,
  title,
  description,
  closeLabel,
  children,
}: SubspaceCommunityDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-none sm:max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
        closeLabel={closeLabel}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" aria-hidden="true" />
            {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="mt-2 flex-1 min-h-0 overflow-y-auto">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
