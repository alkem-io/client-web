import { Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

type HomeSpacePlaceholderProps = {
  settingsHref: string;
  className?: string;
};

export function HomeSpacePlaceholder({ settingsHref, className }: HomeSpacePlaceholderProps) {
  const { t } = useTranslation('crd-dashboard');

  return (
    <a
      href={settingsHref}
      className={cn(
        // `min-w-0` (not a hard `min-w-[180px]`) so the placeholder respects
        // the grid cell width on narrow screens — otherwise it overruns its
        // cell and pushes the neighbour cards out of alignment.
        'flex min-w-0 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center hover:border-primary hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        className
      )}
    >
      <Home size={32} className="text-muted-foreground" aria-hidden="true" />
      <p className="text-card-title">{t('recentSpaces.homeSpacePlaceholder.title')}</p>
      <p className="text-caption text-muted-foreground">{t('recentSpaces.homeSpacePlaceholder.subtitle')}</p>
    </a>
  );
}
