import { Plus } from 'lucide-react';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type ContributionCreateButtonProps = {
  label: string;
  onClick: () => void;
  className?: string;
};

export function ContributionCreateButton({ label, onClick, className }: ContributionCreateButtonProps) {
  return (
    <Button variant="outline" size="sm" className={cn('gap-2', className)} onClick={onClick}>
      <Plus className="w-4 h-4" aria-hidden="true" />
      {label}
    </Button>
  );
}
