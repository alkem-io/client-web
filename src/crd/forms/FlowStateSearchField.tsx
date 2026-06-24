import { Search, Tag, X } from 'lucide-react';
import { type KeyboardEvent, useState } from 'react';
import { cn } from '@/crd/lib/utils';

type FlowStateSearchFieldProps = {
  /** The committed search terms — each is rendered as a removable pill. */
  terms: string[];
  /** Fired on Enter when the draft is non-empty — appends a new term pill (FR-010). */
  onTermAdd: (term: string) => void;
  /** Removes the pill at the given index. */
  onTermRemove: (index: number) => void;
  placeholder: string;
  /** Accessible label for the input — falls back to `placeholder` when omitted. */
  ariaLabel?: string;
  /** Accessible label for a pill's remove button (consumer i18n's the term). */
  removeTermAriaLabel: (term: string) => string;
  /**
   * Active tag filters — rendered as removable pills in the same row as the
   * term pills, so the field is the single home for everything the search is
   * scoped by. Tag pills carry a tag icon to set them apart from free-text terms.
   */
  tags?: string[];
  /** Removes a tag filter (de-selects it in the consumer's tag source). */
  onTagRemove?: (tag: string) => void;
  /** Accessible label for a tag pill's remove button (consumer i18n's the tag). */
  removeTagAriaLabel?: (tag: string) => string;
  /** Minimum draft length before a pill can form. Defaults to 1. */
  minLength?: number;
  className?: string;
};

/**
 * Search input for the per-flow-state scoped search. Pressing Enter turns the
 * typed text into a term "pill" (FR-010) — mirroring the global-search
 * interaction — rather than committing a single free-text string. Terms
 * accumulate as removable pills; clearing all pills returns the tab to browse
 * mode. The committed `terms` are owned by the consumer; only the in-progress
 * draft is held internally (visual state only).
 */
export function FlowStateSearchField({
  terms,
  onTermAdd,
  onTermRemove,
  placeholder,
  ariaLabel,
  removeTermAriaLabel,
  tags = [],
  onTagRemove,
  removeTagAriaLabel,
  minLength = 1,
  className,
}: FlowStateSearchFieldProps) {
  const [draft, setDraft] = useState('');

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const trimmed = draft.trim();
      if (trimmed.length >= minLength) {
        onTermAdd(trimmed);
        setDraft('');
      }
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative">
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

      {(terms.length > 0 || tags.length > 0) && (
        <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
          {terms.map((term, index) => (
            <li
              key={`term-${term}-${index}`}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-control bg-primary text-primary-foreground"
            >
              {term}
              <button
                type="button"
                onClick={() => onTermRemove(index)}
                aria-label={removeTermAriaLabel(term)}
                className="rounded-full p-0.5 hover:opacity-70 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X aria-hidden="true" className="size-3" />
              </button>
            </li>
          ))}
          {tags.map(tag => (
            <li
              key={`tag-${tag}`}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-control border border-primary bg-primary/10 text-primary"
            >
              <Tag aria-hidden="true" className="size-3" />
              {tag}
              <button
                type="button"
                onClick={() => onTagRemove?.(tag)}
                aria-label={removeTagAriaLabel?.(tag) ?? tag}
                className="rounded-full p-0.5 hover:opacity-70 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X aria-hidden="true" className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
