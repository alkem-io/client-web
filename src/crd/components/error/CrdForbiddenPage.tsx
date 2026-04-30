import { ShieldAlert } from 'lucide-react';

import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

export type CrdForbiddenPageProps = {
  title: string;
  description: string;
  goHomeLabel: string;
  goBackLabel: string;
  onGoHome: () => void;
  onGoBack?: () => void;
  showGoBack?: boolean;
  className?: string;
};

export function CrdForbiddenPage({
  title,
  description,
  goHomeLabel,
  goBackLabel,
  onGoHome,
  onGoBack,
  showGoBack,
  className,
}: CrdForbiddenPageProps) {
  const renderGoBack = showGoBack === true && onGoBack !== undefined;

  return (
    <div className={cn('flex min-h-[60vh] w-full items-center justify-center px-4 py-12', className)}>
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-lg border bg-card p-8 text-center shadow-sm">
        <ShieldAlert aria-hidden="true" className="size-12 text-muted-foreground" />
        <h1 className="text-page-title text-foreground">{title}</h1>
        <p className="text-body text-muted-foreground">{description}</p>
        <div className="flex w-full flex-col gap-2">
          <Button autoFocus={true} type="button" onClick={onGoHome}>
            {goHomeLabel}
          </Button>
          {renderGoBack && (
            <Button type="button" variant="secondary" onClick={onGoBack}>
              {goBackLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
