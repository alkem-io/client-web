import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type WhiteboardErrorStateProps = {
  title: string;
  message: string;
  onRetry?: () => void;
  className?: string;
};

export function WhiteboardErrorState({ title, message, onRetry, className }: WhiteboardErrorStateProps) {
  const { t } = useTranslation('crd-whiteboard');

  return (
    <div className={cn('flex flex-col items-center justify-center min-h-screen p-6 text-center', className)}>
      <AlertCircle className="size-16 text-destructive mb-4" aria-hidden="true" />
      <h1 className="text-page-title mb-2">{title}</h1>
      <p className="text-muted-foreground max-w-[600px] mb-6">{message}</p>
      {onRetry && (
        <Button variant="default" onClick={onRetry}>
          {t('error.retry')}
        </Button>
      )}
    </div>
  );
}
