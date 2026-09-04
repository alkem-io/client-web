import { cn } from '@/crd/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';

type LoadingProps = {
  text?: string;
  className?: string;
};

/** Fill-parent variant of `LoadingSpinner` — same indicator, centered in the available area. */
export function Loading({ text, className }: LoadingProps) {
  return <LoadingSpinner text={text} className={cn('flex-1 h-full min-h-[120px]', className)} />;
}
