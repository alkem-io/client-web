import { Loader2 } from 'lucide-react';
import { cn } from '@/crd/lib/utils';

type LoadingSpinnerProps = {
  className?: string;
};

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <output className={cn('flex items-center justify-center py-12', className)} aria-label="Loading">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" aria-hidden="true" />
    </output>
  );
}
