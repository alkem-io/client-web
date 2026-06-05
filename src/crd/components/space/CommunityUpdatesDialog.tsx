import type { Locale } from 'date-fns';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Dialog, DialogContent, DialogTitle } from '@/crd/primitives/dialog';

export type UpdateAuthor = {
  name: string;
  initials: string;
  avatarUrl?: string;
  href?: string;
};

export type CommunityUpdate = {
  id: string;
  author?: UpdateAuthor;
  date?: Date;
  body: string;
};

/** Author avatar + name + formatted date, shared by the sidebar widget and the dialog list. */
export function UpdateAuthorLine({
  author,
  date,
  locale,
  className,
}: {
  author?: UpdateAuthor;
  date?: Date;
  locale?: Locale;
  className?: string;
}) {
  const formattedDate = date ? format(date, 'PPp', { locale }) : undefined;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {author && (
        <Avatar className="w-7 h-7 shrink-0">
          {author.avatarUrl && <AvatarImage src={author.avatarUrl} alt={author.name} />}
          <AvatarFallback className="text-badge">{author.initials}</AvatarFallback>
        </Avatar>
      )}
      <div className="min-w-0">
        {author &&
          (author.href ? (
            <a
              href={author.href}
              className="text-body-emphasis text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {author.name}
            </a>
          ) : (
            <p className="text-body-emphasis text-foreground">{author.name}</p>
          ))}
        {formattedDate && <p className="text-caption text-muted-foreground">{formattedDate}</p>}
      </div>
    </div>
  );
}

type CommunityUpdatesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  updates: CommunityUpdate[];
  loading?: boolean;
  locale?: Locale;
};

export function CommunityUpdatesDialog({ open, onOpenChange, updates, loading, locale }: CommunityUpdatesDialogProps) {
  const { t } = useTranslation('crd-space');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogTitle className="shrink-0">{t('sidebar.updates')}</DialogTitle>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {loading ? (
            <output aria-label={t('sidebar.updatesLoading')} className="block h-24 animate-pulse bg-muted rounded" />
          ) : updates.length === 0 ? (
            <p className="text-body text-muted-foreground">{t('sidebar.updatesEmpty')}</p>
          ) : (
            <ul className="space-y-6">
              {updates.map(update => (
                <li key={update.id} className="space-y-2 pb-6 border-b border-border last:border-b-0 last:pb-0">
                  <UpdateAuthorLine author={update.author} date={update.date} locale={locale} />
                  <MarkdownContent content={update.body} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
