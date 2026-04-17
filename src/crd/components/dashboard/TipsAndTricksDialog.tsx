import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';

type TipItemData = {
  id: string;
  title: string;
  description: string;
  href?: string;
  imageUrl?: string;
};

type TipsAndTricksDialogProps = {
  open: boolean;
  onClose: () => void;
  tips: TipItemData[];
  findMoreHref: string;
  findMoreLabel: string;
};

export function TipsAndTricksDialog({ open, onClose, tips, findMoreHref, findMoreLabel }: TipsAndTricksDialogProps) {
  const { t } = useTranslation('crd-dashboard');

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg flex flex-col max-h-[85vh]">
        <DialogHeader className="shrink-0">
          <DialogTitle>{t('dialogs.tipsAndTricks')}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto py-1">
          <ul className="space-y-2">
            {tips.map(tip => {
              const content = (
                <div className="flex items-center gap-3 p-3">
                  <Avatar className="size-10 shrink-0 rounded-lg">
                    {tip.imageUrl ? (
                      <AvatarImage src={tip.imageUrl} alt="" className="rounded-lg object-cover" />
                    ) : null}
                    <AvatarFallback className="rounded-lg text-body-emphasis">{tip.title.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-card-title leading-tight">{tip.title}</p>
                    <p className="text-caption text-muted-foreground mt-0.5">{tip.description}</p>
                  </div>
                  {tip.href && <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
                </div>
              );

              return (
                <li key={tip.id}>
                  {tip.href ? (
                    <a
                      href={tip.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg border border-border bg-card transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="rounded-lg border border-border bg-card">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <DialogFooter className="shrink-0 sm:justify-start border-t border-border pt-4">
          <a
            href={findMoreHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-body text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
          >
            {findMoreLabel}
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { TipItemData, TipsAndTricksDialogProps };
