import { AlertCircle, Check, Search, X } from 'lucide-react';
import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { getInitials } from '@/crd/lib/getInitials';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Input } from '@/crd/primitives/input';

/**
 * Stable keys for the depth markers — two is the whole range (L1, L2). Named
 * rather than indexed so the list carries no array-index keys.
 */
const DEPTH_MARKER_KEYS = ['depth-1', 'depth-2'] as const;

/** How the path sub-line joins ancestor names, as the design draws it. */
const PATH_JOINER = ' › ';

export type SpaceSelectorItem = {
  id: string;
  displayName: string;
  /** Translated level label ("Space" / "Subspace" / "Sub-subspace") — consumer-supplied. */
  levelLabel: string;
  /**
   * How deep this space sits: 0 = Space, 1 = Subspace, 2 = Sub-subspace. The
   * TRUE level, deliberately NOT `ancestorPath.length`.
   *
   * The two differ, and that is why this is its own field. The ancestor chain is
   * the READABLE one — it stops at the innermost ancestor this editor may see
   * and never substitutes a placeholder, because a placeholder would itself
   * disclose that a hidden ancestor exists (contract S3). So a sub-subspace
   * beneath a private level-zero space has a ONE-element chain. The depth
   * markers are an absolute claim about level and must agree with `levelLabel`,
   * which comes from the true level too; deriving them from the chain would
   * render a single dash beside the words "Sub-subspace".
   */
  depth: 0 | 1 | 2;
  /**
   * Display names of the READABLE ancestors, outermost first. Already truncated
   * to the readable prefix by the consumer: an ancestor this editor cannot read
   * is absent, never a placeholder.
   */
  ancestorPath: string[];
  /**
   * The space the callout is hosted on. Listed, badged for orientation, and
   * SELECTABLE like any other candidate (operator request, 2026-10-15): a
   * collection that means "our related initiatives" may legitimately include
   * the space you are standing in. The server already accepted this id — the
   * write guard scopes to the host's ACCOUNT, and a space belongs to its own
   * account — so this was only ever a client-side gate.
   */
  isHost: boolean;
  /** A descendant of the host space — drives the "in this space" badge. */
  inHostTree: boolean;
  /** Another candidate shares this display name — drives the chip's parent context. */
  hasNameClash: boolean;
};

export type SpaceSelectorProps = {
  /**
   * The whole candidate set, already ordered by ancestor path then name. An
   * empty query lists it in exactly this order; the component never re-sorts.
   */
  items: SpaceSelectorItem[];
  /** The current selection, in selection order. Ids with no item render unnamed. */
  selectedIds: string[];
  /** Toggle one candidate in or out of the selection. Also removes a chip. */
  onToggle: (id: string) => void;
  onClearSelection: () => void;

  loading?: boolean;
  /** The candidate set failed to load — distinct from "this account has no spaces". */
  loadFailed?: boolean;

  /** All visible strings — passed in, because the form has no `t()`. */
  searchPlaceholder: string;
  searchAriaLabel: string;
  clearSearchAriaLabel: string;
  loadingLabel: string;
  /** No candidate matches the query. */
  noMatchesLabel: string;
  /** The account holds no space other than the host. */
  accountEmptyLabel: string;
  /** The candidate set could not be loaded. */
  loadFailedLabel: string;
  /** Shown instead of the chips when nothing is selected. */
  chipsEmptyLabel: string;
  /** Chip label for a selected id with no candidate entry. Never the raw id. */
  unresolvedLabel: string;
  /** Chip suffix, rendered only when the name clashes with another candidate. */
  chipContextLabel: (parentName: string) => string;
  inThisSpaceLabel: string;
  calloutIsHereLabel: string;
  /** Row sub-line for a candidate that has readable ancestors. */
  pathLabel: (level: string, path: string) => string;
  removeAriaLabel: (name: string) => string;
  /** Footer count — the consumer supplies the plural and the none form. */
  selectedCountLabel: (count: number) => string;
  clearSelectionLabel: string;

  className?: string;
};

/** Wraps the matched substring of a name so a search hit is visible (US3-AS1). */
function HighlightedName({ name, query }: { name: string; query: string }) {
  const index = query ? name.toLowerCase().indexOf(query) : -1;
  if (index < 0) return <>{name}</>;
  return (
    <>
      {name.slice(0, index)}
      <mark className="rounded-sm bg-primary/15 text-inherit">{name.slice(index, index + query.length)}</mark>
      {name.slice(index + query.length)}
    </>
  );
}

/**
 * Multi-select picker for the spaces shown in a Spaces-collection callout
 * (feature 084). The multi-select sibling of `SpaceTargetPicker`: one search
 * input over an always-visible, client-filtered flat list, where an EMPTY query
 * lists the whole candidate set in the order it arrives (FR-024).
 *
 * Pure CRD: fetches nothing, derives nothing about spaces, and holds only its
 * own query state. `inHostTree`, `hasNameClash` and the readable `ancestorPath`
 * are all computed by the consumer's hook and arrive as plain values.
 */
export function SpaceSelector({
  items,
  selectedIds,
  onToggle,
  onClearSelection,
  loading = false,
  loadFailed = false,
  searchPlaceholder,
  searchAriaLabel,
  clearSearchAriaLabel,
  loadingLabel,
  noMatchesLabel,
  accountEmptyLabel,
  loadFailedLabel,
  chipsEmptyLabel,
  unresolvedLabel,
  chipContextLabel,
  inThisSpaceLabel,
  calloutIsHereLabel,
  pathLabel,
  removeAriaLabel,
  selectedCountLabel,
  clearSelectionLabel,
  className,
}: SpaceSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const chipsRef = useRef<HTMLUListElement>(null);
  // Index of the chip whose remove button was just pressed. The chip is gone by
  // the time the selection prop comes back, so the focus move happens after it.
  const removedChipIndex = useRef<number | null>(null);

  const query = searchQuery.trim().toLowerCase();
  const byId = new Map(items.map(item => [item.id, item]));
  // No candidate has arrived yet, so no selected id is KNOWN to be unresolved.
  const candidatesPending = loading && items.length === 0;
  // Every candidate is selectable, the host included, so "this account has no
  // other spaces" is now simply an empty candidate set.
  const visible = query ? items.filter(item => item.displayName.toLowerCase().includes(query)) : items;

  useEffect(() => {
    const index = removedChipIndex.current;
    if (index === null) return;
    removedChipIndex.current = null;
    const removeButtons = chipsRef.current?.querySelectorAll<HTMLButtonElement>('button[data-chip-remove]');
    if (removeButtons && removeButtons.length > 0) {
      removeButtons[Math.min(index, removeButtons.length - 1)]?.focus();
    } else {
      inputRef.current?.focus();
    }
  }, [selectedIds]);

  const handleChipRemove = (id: string, index: number) => {
    removedChipIndex.current = index;
    onToggle(id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape' && searchQuery.length > 0) {
      // stopPropagation is load-bearing, not defensive: Radix's dismiss handler
      // listens on `document`, so preventDefault on the React bubble path does
      // not suppress it. Without this, clearing the query also closed the
      // callout editor and raised "Discard your changes?" over an unsaved
      // selection. Found by the 084 acceptance walk. Escape on an EMPTY query
      // still falls through to the dialog, which is the expected gesture.
      event.preventDefault();
      event.stopPropagation();
      setSearchQuery('');
    }
  };

  const message = (text: string) => <p className="px-3 py-3 text-caption text-muted-foreground">{text}</p>;

  let listBody: ReactNode;
  if (loadFailed) {
    listBody = message(loadFailedLabel);
  } else if (loading && items.length === 0) {
    listBody = (
      <output aria-label={loadingLabel} className="block px-3 py-3 text-caption text-muted-foreground">
        {loadingLabel}
      </output>
    );
  } else if (items.length === 0) {
    listBody = message(accountEmptyLabel);
  } else if (visible.length === 0) {
    listBody = message(noMatchesLabel);
  } else {
    listBody = (
      // biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style
      // biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset
      <ul role="list" className="list-none py-1">
        {visible.map(item => {
          const selected = selectedIds.includes(item.id);
          const subLine = item.ancestorPath.length
            ? pathLabel(item.levelLabel, item.ancestorPath.join(PATH_JOINER))
            : item.levelLabel;

          return (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onToggle(item.id)}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2 text-left outline-none',
                  'hover:bg-accent focus-visible:bg-accent'
                )}
              >
                {item.depth > 0 && (
                  // aria-hidden: depth is already stated in words on the
                  // sub-line ("Sub-subspace in A › B"), which is what a screen
                  // reader should get. Reading out "dash dash" would be noise.
                  <span aria-hidden="true" className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                    {DEPTH_MARKER_KEYS.slice(0, item.depth).map(key => (
                      <span key={key} className="text-caption leading-none">
                        &ndash;
                      </span>
                    ))}
                  </span>
                )}
                <Avatar className="size-6">
                  <AvatarFallback className="text-badge">{getInitials(item.displayName)}</AvatarFallback>
                </Avatar>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-control">
                    <HighlightedName name={item.displayName} query={query} />
                  </span>
                  <span className="truncate text-caption text-muted-foreground">{subLine}</span>
                </span>
                {item.isHost && (
                  <Badge variant="secondary" className="shrink-0 rounded-full">
                    {calloutIsHereLabel}
                  </Badge>
                )}
                {item.inHostTree && (
                  <Badge variant="outline" className="shrink-0 rounded-full border-primary/40 text-primary">
                    {inThisSpaceLabel}
                  </Badge>
                )}
                <span
                  aria-hidden="true"
                  className={cn(
                    'inline-grid size-[18px] shrink-0 place-items-center rounded border border-border',
                    selected && 'border-primary bg-primary text-primary-foreground'
                  )}
                >
                  {selected && <Check className="size-3" />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {selectedIds.length === 0 ? (
        <p className="text-caption text-muted-foreground">{chipsEmptyLabel}</p>
      ) : candidatesPending ? (
        // Naming every selected id "no longer available" for the length of a
        // plain candidate round trip reports a lost selection that is not lost
        // (FR-026). Until the set arrives the chips say only that they are
        // loading; the footer still counts the selection.
        <output aria-label={loadingLabel} className="block text-caption text-muted-foreground">
          {loadingLabel}
        </output>
      ) : (
        // biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style
        // biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset
        <ul ref={chipsRef} role="list" className="flex list-none flex-wrap gap-2">
          {selectedIds.map((id, index) => {
            const item = byId.get(id);
            // An id with no candidate entry is unnamed — the raw uuid says
            // nothing and the admin removes it explicitly (FR-014).
            const label = item ? item.displayName : unresolvedLabel;
            const parentName = item?.hasNameClash ? item.ancestorPath[item.ancestorPath.length - 1] : undefined;

            return (
              <li key={id}>
                <span
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border bg-input-background py-1 pr-1 pl-1',
                    item ? 'border-border' : 'border-destructive'
                  )}
                >
                  {item ? (
                    <Avatar className="size-6">
                      <AvatarFallback className="text-badge">{getInitials(label)}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <span
                      aria-hidden="true"
                      className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-destructive"
                    >
                      <AlertCircle className="size-3.5" />
                    </span>
                  )}
                  <span
                    className={cn('max-w-[14rem] truncate text-control', !item && 'text-muted-foreground')}
                    title={label}
                  >
                    {label}
                  </span>
                  {parentName && (
                    <span className="max-w-[10rem] truncate text-caption text-muted-foreground">
                      {chipContextLabel(parentName)}
                    </span>
                  )}
                  <button
                    type="button"
                    data-chip-remove={id}
                    onClick={() => handleChipRemove(id, index)}
                    aria-label={removeAriaLabel(label)}
                    className="rounded-full p-0.5 hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={event => setSearchQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={searchPlaceholder}
          aria-label={searchAriaLabel}
          autoComplete="off"
          className={cn('pl-9', searchQuery.length > 0 && 'pr-9')}
        />
        {searchQuery.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              inputRef.current?.focus();
            }}
            aria-label={clearSearchAriaLabel}
            className="absolute top-1/2 right-1 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:outline-none"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto rounded-lg border border-border bg-background">{listBody}</div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-caption text-muted-foreground">
        <span aria-live="polite">{selectedCountLabel(selectedIds.length)}</span>
        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={() => {
              // No chip survives, so the effect lands focus on the input.
              removedChipIndex.current = 0;
              onClearSelection();
            }}
            className="text-control text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {clearSelectionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
