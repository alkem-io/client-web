import { Search } from 'lucide-react';
import { type KeyboardEvent, useEffect, useState } from 'react';
import { cn } from '@/crd/lib/utils';

type FlowStateSearchFieldProps = {
  /** The committed term — keeps the field in sync when the consumer clears it. */
  defaultValue: string;
  /** Fired ONLY on Enter (FR-010) — never on every keystroke. */
  onSubmit: (term: string) => void;
  placeholder: string;
  /** Accessible label — falls back to `placeholder` when omitted. */
  ariaLabel?: string;
  className?: string;
};

/**
 * Search input for the per-flow-state scoped search. Submits the term on
 * pressing Enter (FR-010), mirroring the global-search interaction — there is
 * no live-keystroke submission. Local draft state is held internally; the
 * committed value flows in via `defaultValue` so the consumer can reset it
 * (e.g. "clear filters"). Clearing the input to empty and pressing Enter
 * commits an empty term (returns the tab to browse mode).
 */
export function FlowStateSearchField({
  defaultValue,
  onSubmit,
  placeholder,
  ariaLabel,
  className,
}: FlowStateSearchFieldProps) {
  const [draft, setDraft] = useState(defaultValue);

  // Re-sync the draft when the committed value changes from the outside
  // (e.g. the consumer's "clear filters" resets it to '').
  useEffect(() => {
    setDraft(defaultValue);
  }, [defaultValue]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSubmit(draft.trim());
    }
  };

  return (
    <div className={cn('relative', className)}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        value={draft}
        onChange={event => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="w-full h-10 pl-9 pr-4 border border-border bg-background rounded-lg text-body text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary"
      />
    </div>
  );
}
