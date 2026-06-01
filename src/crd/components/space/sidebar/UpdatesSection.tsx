import type { Locale } from 'date-fns';
import { Megaphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { InlineMarkdown } from '@/crd/components/common/InlineMarkdown';
import { type CommunityUpdate, UpdateAuthorLine } from '@/crd/components/space/CommunityUpdatesDialog';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type UpdatesSectionProps = {
  /** The most recent update from the community lead. When absent the section is hidden. */
  latest?: CommunityUpdate;
  /** Total number of updates — gates the "see all" affordance. */
  total: number;
  onSeeAll?: () => void;
  /** date-fns Locale for date formatting; resolved by the consumer. */
  locale?: Locale;
  className?: string;
};

export function UpdatesSection({ latest, total, onSeeAll, locale, className }: UpdatesSectionProps) {
  const { t } = useTranslation('crd-space');

  if (!latest) return null;

  return (
    <div className={cn('bg-card border border-border rounded-lg p-4', className)}>
      <div className="flex items-center gap-1.5 mb-3">
        <Megaphone className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
        <h3 className="uppercase text-label text-muted-foreground">{t('sidebar.updates')}</h3>
      </div>

      <UpdateAuthorLine author={latest.author} date={latest.date} locale={locale} />

      <InlineMarkdown content={latest.body} clampLines={3} className="mt-2 text-body text-muted-foreground" />

      {onSeeAll && total > 1 && (
        <Button variant="link" className="px-0 h-auto mt-2" onClick={onSeeAll}>
          {t('sidebar.updatesSeeAll')}
        </Button>
      )}
    </div>
  );
}
