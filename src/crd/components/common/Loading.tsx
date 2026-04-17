import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

type LoadingProps = {
  text?: string;
  className?: string;
};

export function Loading({ text, className }: LoadingProps) {
  const { t } = useTranslation('crd-common');
  const label = text ?? t('loading');

  return (
    <output
      className={cn('flex flex-1 items-center justify-center gap-2 h-full min-h-[120px]', className)}
      aria-label={label}
    >
      <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
      <span className="text-sm font-medium uppercase text-primary">{label}</span>
    </output>
  );
}
