import type { LucideIcon } from 'lucide-react';
import { cn } from '@/crd/lib/utils';

type ContributionAddCardProps = {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export function ContributionAddCard({ label, icon: Icon, onClick, disabled, className }: ContributionAddCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group border-2 border-dashed border-muted-foreground/20 rounded-xl overflow-hidden',
        'hover:border-primary/50 hover:bg-muted/5 transition-all cursor-pointer',
        'flex flex-col items-center justify-center gap-2',
        'text-muted-foreground hover:text-primary min-h-[180px]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-muted-foreground/20 disabled:hover:bg-transparent disabled:hover:text-muted-foreground',
        className
      )}
    >
      <div className="size-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <span className="text-body-emphasis">{label}</span>
    </button>
  );
}
