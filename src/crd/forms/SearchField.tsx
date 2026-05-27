import { Search } from 'lucide-react';
import { cn } from '@/crd/lib/utils';

type SearchFieldProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  /** Accessible label — falls back to `placeholder` when omitted. */
  ariaLabel?: string;
  className?: string;
};

/**
 * Shared search input for space content tabs (Knowledge Base, Subspaces).
 * One component so every tab's search looks and behaves identically.
 */
export function SearchField({ value, onValueChange, placeholder, ariaLabel, className }: SearchFieldProps) {
  return (
    <div className={cn('relative', className)}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={event => onValueChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="w-full h-10 pl-9 pr-4 border border-border bg-background rounded-lg text-body text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary"
      />
    </div>
  );
}
