import { ArrowRight, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type ReleaseNotesBannerProps = {
  title: string;
  content: string;
  href?: string;
  onDismiss: () => void;
  className?: string;
};

export function ReleaseNotesBanner({ title, content, href, onDismiss, className }: ReleaseNotesBannerProps) {
  const { t } = useTranslation('crd-dashboard');

  return (
    <aside aria-label={title} className={cn('rounded-lg border border-border bg-card p-4 relative', className)}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={onDismiss}
        aria-label={t('releaseNotes.dismiss')}
      >
        <X size={16} aria-hidden="true" />
      </Button>
      <h3 className="font-semibold pr-8">{title}</h3>
      <p className="text-body text-muted-foreground mt-1">{content}</p>
      {href && (
        <a
          href={href}
          className="text-body-emphasis text-primary hover:underline mt-2 inline-flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
        >
          {t('releaseNotes.readMore')}
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      )}
    </aside>
  );
}
