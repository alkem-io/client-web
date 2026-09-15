import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

type LoadingSpinnerProps = {
  /** Optional caption under the spinner (e.g. "Loading whiteboard…"). Doubles as the accessible name. */
  text?: string;
  className?: string;
};

/**
 * The one loading indicator. Every block-level "loading" state — route Suspense
 * fallbacks, page gates, dialog bodies — renders this exact spinner so a page that
 * passes through several loading phases shows one consistent indicator instead of
 * a parade of different ones (issue #10043). `Loading` is the fill-parent variant.
 */
export function LoadingSpinner({ text, className }: LoadingSpinnerProps) {
  const { t } = useTranslation('crd-common');
  return (
    <output
      className={cn('flex flex-col items-center justify-center gap-3 py-12', className)}
      aria-label={text ?? t('loading')}
    >
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
      {text && <span className="text-caption text-muted-foreground">{text}</span>}
    </output>
  );
}
