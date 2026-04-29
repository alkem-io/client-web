import { ShieldAlert } from 'lucide-react';

import { Button } from '@/crd/primitives/button';

export type CrdForbiddenPageProps = {
  title: string;
  description: string;
  goHomeLabel: string;
  goBackLabel: string;
  onGoHome: () => void;
  onGoBack?: () => void;
  showGoBack?: boolean;
};

export function CrdForbiddenPage({
  title,
  description,
  goHomeLabel,
  goBackLabel,
  onGoHome,
  onGoBack,
  showGoBack,
}: CrdForbiddenPageProps) {
  const renderGoBack = showGoBack === true && onGoBack !== undefined;

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-lg border bg-card p-8 text-center shadow-sm">
        <ShieldAlert aria-hidden="true" className="size-12 text-muted-foreground" />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
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
