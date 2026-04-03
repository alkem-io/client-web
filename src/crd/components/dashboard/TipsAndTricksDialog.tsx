import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/crd/primitives/dialog';

type TipItemData = {
  id: string;
  title: string;
  description: string;
  href?: string;
  iconUrl?: string;
};

type TipsAndTricksDialogProps = {
  open: boolean;
  onClose: () => void;
  tips: TipItemData[];
  forumHref: string;
};

export function TipsAndTricksDialog({ open, onClose, tips, forumHref }: TipsAndTricksDialogProps) {
  const { t } = useTranslation('crd-dashboard');

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('dialogs.tipsAndTricks')}</DialogTitle>
        </DialogHeader>

        <ul className="space-y-4">
          {tips.map(tip => (
            <li key={tip.id} className="flex items-start gap-3">
              {tip.iconUrl && (
                <img
                  src={tip.iconUrl}
                  alt=""
                  aria-hidden="true"
                  className="size-8 shrink-0 rounded-full object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{tip.title}</p>
                <p className="text-sm text-muted-foreground">{tip.description}</p>
                {tip.href && (
                  <a
                    href={tip.href}
                    className="text-sm text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tip.title}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>

        <DialogFooter className="sm:justify-start">
          <a
            href={forumHref}
            className="text-sm text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('dialogs.findMore')}
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { TipItemData, TipsAndTricksDialogProps };
