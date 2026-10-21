import { AlertCircle, Check, Mail, Plus, Search, X } from 'lucide-react';
import { type KeyboardEvent, useEffect, useRef } from 'react';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';

export type ContributorSelectorUserResult = {
  /**
   * The entity's id — a user, organization or virtual-contributor id
   * depending on the consumer. (The field is named `userId` for historical
   * reasons; renaming it is deferred as a standalone refactor.)
   */
  userId: string;
  displayName: string;
  avatarUrl?: string;
  location?: string;
  /**
   * Optional type indication (e.g. People / Organizations), rendered as the
   * caption beneath the name; omitted by the invite, chat and Spaces consumers.
   */
  typeLabel?: string;
};

/**
 * A selected entry in the picker — supports users (existing invite flow),
 * organizations and virtual contributors. Entries that are no longer eligible
 * (e.g. a member who left) carry `eligible: false` so the consumer can display
 * a "no longer available" chip state and omit them on save.
 *
 * The `subspace` kind feature 025 added was deleted by 084: the Spaces
 * collection's picker is `@/crd/forms/callout/SpaceSelector`, which owns the
 * path sub-lines, badges and disabled host row that this selector has no shape
 * for.
 */
export type ContributorSelectorInvitee =
  | { kind: 'user'; userId: string; displayName: string; avatarUrl?: string; location?: string; eligible?: boolean }
  | { kind: 'organization'; id: string; displayName: string; avatarUrl?: string; eligible?: boolean }
  | { kind: 'virtualContributor'; id: string; displayName: string; avatarUrl?: string; eligible?: boolean }
  | { kind: 'email'; email: string; validationError?: 'invalid' | 'duplicate' };

type ValidationErrorKind = 'invalid' | 'duplicate';

export type ContributorSelectorProps = {
  selectedContributors: ContributorSelectorInvitee[];
  searchResults: ContributorSelectorUserResult[];

  searchQuery: string;
  onSearchChange: (next: string) => void;

  onSelectUser: (userId: string) => void;
  onAddEmails?: (rawText: string) => void;
  onRemoveContributor: (index: number) => void;

  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;

  /** When false (default true): the email-paste path is hidden — Enter is a no-op. */
  allowEmailInvites?: boolean;

  /** All visible labels — passed by the consumer because the form has no t(). */
  placeholder: string;
  searchAriaLabel: string;
  noResultsLabel: string;
  loadingLabel: string;
  loadMoreLabel: string;
  removeAriaLabel: (label: string) => string;
  validationErrorLabel: (kind: ValidationErrorKind) => string;
  /**
   * Label shown in the tooltip on entries with `eligible: false`
   * (feature 025 — e.g. a member who left). Only required when the component
   * is used as a collection selection picker (not the invite flow).
   */
  ineligibleLabel?: string;

  /**
   * Aria-label for the clear-search "✕" button. The button is shown (for the
   * collection selection picker — `allowEmailInvites=false`) whenever there is a
   * query; provide this label to enable it.
   */
  clearSearchAriaLabel?: string;

  /**
   * Where the selected-entry chips render relative to the search input.
   * `'below'` (default) keeps the invite-flow layout; `'above'` places the chips
   * on top so the search-results dropdown (which drops below the input) never
   * covers them — used by the feature-025 collection selection picker.
   */
  chipsPosition?: 'above' | 'below';

  /**
   * What clicking a result row means.
   *
   * `'add'` (default) — the invite flow: the row adds the entry, then drops out
   * of the results and the query clears.
   * `'toggle'` — the collection selection picker (feature 088): the row is a
   * two-state toggle carrying `aria-pressed` and a check box, it keeps its place
   * once selected, and the query survives the click so the ticked row stays on
   * screen to be untoggled. `onSelectUser` is then "toggle this id" and the
   * consumer owns both directions.
   */
  rowSelection?: 'add' | 'toggle';

  className?: string;
};

function getInitials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Sibling of @/crd/forms/UserSelector that takes a User|Email discriminated
 * union. Pure UI: the consumer passes an Invitee[] (chips) and onAddEmails
 * is only honoured when `allowEmailInvites` is true. Pressing Enter on the
 * input dispatches the raw text to `onAddEmails` so the consumer's parser
 * (e.g. emailParser) decides what becomes a chip and what's a validation
 * error.
 */
export function ContributorSelector({
  selectedContributors,
  searchResults,
  searchQuery,
  onSearchChange,
  onSelectUser,
  onAddEmails,
  onRemoveContributor,
  loading = false,
  hasMore = false,
  onLoadMore,
  allowEmailInvites = true,
  placeholder,
  searchAriaLabel,
  noResultsLabel,
  loadingLabel,
  loadMoreLabel,
  removeAriaLabel,
  validationErrorLabel,
  ineligibleLabel,
  clearSearchAriaLabel,
  chipsPosition = 'below',
  rowSelection = 'add',
  className,
}: ContributorSelectorProps) {
  const toggleRows = rowSelection === 'toggle';
  const trimmedQuery = searchQuery.trim();
  const showResults = trimmedQuery.length > 0;
  // A clear "✕" button for the collection picker (the invite flow keeps its "Add"
  // button in that corner instead). Enabled once a clear-label is supplied.
  const showClear = !allowEmailInvites && trimmedQuery.length > 0 && Boolean(clearSearchAriaLabel);
  // Exclude users already selected — covers user/org/vc picks that
  // overlap with the userId-keyed result set.
  const selectedUserIds = new Set(
    selectedContributors.filter(c => c.kind === 'user').map(c => (c as { kind: 'user'; userId: string }).userId)
  );
  // An add-mode row vanishes once picked: its only gesture is "add", so a
  // selected row has nothing left to do. A toggle row stays listed — the ticked
  // row IS the selected state, and filtering it out would make that state
  // unreachable (feature 088, superseding 084 FR-006).
  const visibleResults = toggleRows ? searchResults : searchResults.filter(user => !selectedUserIds.has(user.userId));
  // Ids of the selected non-email entries, keyed the way a result row is — the
  // result's `userId` carries a user, organization or virtual-contributor id.
  // Only toggle rows read it; an add-mode row is never drawn as selected.
  const selectedEntityIds = new Set(
    selectedContributors.flatMap(c => (c.kind === 'email' ? [] : [c.kind === 'user' ? c.userId : c.id]))
  );
  const showLoadMore = hasMore && !loading && visibleResults.length > 0 && onLoadMore;

  const sentinelRef = useRef<HTMLLIElement | null>(null);
  // Auto-fire onLoadMore when the bottom sentinel scrolls into view. This is
  // the simplest pagination pattern that doesn't require the consumer to
  // wire scroll events themselves.
  useEffect(() => {
    if (!showLoadMore || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) onLoadMore?.();
      },
      { threshold: 0.5 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [showLoadMore, onLoadMore]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && allowEmailInvites && onAddEmails) {
      event.preventDefault();
      if (trimmedQuery.length === 0) return;
      onAddEmails(searchQuery);
    }
  };

  const handleAddClick = () => {
    if (!allowEmailInvites || !onAddEmails) return;
    if (trimmedQuery.length === 0) return;
    onAddEmails(searchQuery);
  };

  const handleClear = () => onSearchChange('');

  // Selecting a result clears the query so the next search starts fresh and a
  // fully-picked set doesn't leave a stale "no matching results" dropdown open.
  // A toggle row keeps the query instead: the ticked row has to stay on screen
  // for a second click to untoggle it.
  const handleResultSelect = (userId: string) => {
    onSelectUser(userId);
    if (!toggleRows) onSearchChange('');
  };

  const chipsBlock =
    selectedContributors.length > 0 ? (
      <ul className="flex flex-wrap gap-2">
        {selectedContributors.map((contributor, index) => {
          // Resolve display text and validation state per kind.
          let labelText: string;
          let validationError: 'invalid' | 'duplicate' | undefined;
          let avatarUrl: string | undefined;
          let chipKey: string;
          let ineligible = false;

          if (contributor.kind === 'user') {
            labelText = contributor.displayName;
            avatarUrl = contributor.avatarUrl;
            chipKey = `user-${contributor.userId}`;
            ineligible = contributor.eligible === false;
          } else if (contributor.kind === 'organization') {
            labelText = contributor.displayName;
            avatarUrl = contributor.avatarUrl;
            chipKey = `org-${contributor.id}`;
            ineligible = contributor.eligible === false;
          } else if (contributor.kind === 'virtualContributor') {
            labelText = contributor.displayName;
            avatarUrl = contributor.avatarUrl;
            chipKey = `vc-${contributor.id}`;
            ineligible = contributor.eligible === false;
          } else {
            // email
            labelText = contributor.email;
            validationError = contributor.validationError;
            chipKey = `email-${contributor.email}-${validationError ?? 'ok'}-${index}`;
          }

          const hasAvatarBased = contributor.kind !== 'email';
          const isError = !!validationError || ineligible;

          return (
            <li key={chipKey}>
              <span
                className={cn(
                  'inline-flex items-center gap-2 pr-1 pl-1 py-1 rounded-full border bg-input-background',
                  isError ? 'border-destructive' : 'border-border'
                )}
              >
                {hasAvatarBased ? (
                  <Avatar className="size-6">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
                    <AvatarFallback className="text-badge">{getInitials(labelText)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <span
                    className={cn(
                      'inline-flex size-6 items-center justify-center rounded-full',
                      validationError ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                    )}
                    aria-hidden="true"
                  >
                    <Mail className="size-3.5" />
                  </span>
                )}
                <span
                  className={cn(
                    'text-control max-w-[14rem] truncate',
                    ineligible && 'text-muted-foreground line-through'
                  )}
                  title={labelText}
                >
                  {labelText}
                </span>
                {(validationError || ineligible) && (
                  <Tooltip>
                    <TooltipTrigger asChild={true}>
                      <span
                        role="img"
                        aria-label={validationError ? validationErrorLabel(validationError) : (ineligibleLabel ?? '')}
                        className="inline-flex size-5 items-center justify-center text-destructive"
                      >
                        <AlertCircle className="size-4" aria-hidden="true" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {validationError ? validationErrorLabel(validationError) : (ineligibleLabel ?? '')}
                    </TooltipContent>
                  </Tooltip>
                )}
                <button
                  type="button"
                  onClick={() => onRemoveContributor(index)}
                  className="rounded-full p-0.5 hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                  aria-label={removeAriaLabel(labelText)}
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              </span>
            </li>
          );
        })}
      </ul>
    ) : null;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {chipsPosition === 'above' && chipsBlock}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <Input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={searchAriaLabel}
          className={cn('pl-9', allowEmailInvites && trimmedQuery.length > 0 && 'pr-20', showClear && 'pr-9')}
          autoComplete="off"
        />

        {allowEmailInvites && trimmedQuery.length > 0 && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 gap-1"
            onClick={handleAddClick}
          >
            <Plus className="size-4" aria-hidden="true" />
            <span className="text-control">Add</span>
          </Button>
        )}

        {showClear && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:outline-none"
            aria-label={clearSearchAriaLabel}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}

        {showResults && (
          <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-md border border-border bg-popover shadow-md max-h-60 overflow-y-auto">
            {loading && visibleResults.length === 0 ? (
              <output className="block p-3 text-control text-muted-foreground" aria-label={loadingLabel}>
                {loadingLabel}
              </output>
            ) : visibleResults.length === 0 ? (
              <p className="p-3 text-control text-muted-foreground">{noResultsLabel}</p>
            ) : (
              <ul className="py-1">
                {visibleResults.map(user => {
                  const selected = toggleRows && selectedEntityIds.has(user.userId);
                  // ONE caption line beneath the name, never two stacked muted
                  // lines. `location` and `typeLabel` are disjoint in practice —
                  // the invite consumers supply a location, the contributors
                  // collection picker supplies a type label — so when a consumer
                  // supplies both, the location wins.
                  const caption = user.location ?? user.typeLabel;

                  return (
                    <li key={user.userId}>
                      <button
                        type="button"
                        aria-pressed={toggleRows ? selected : undefined}
                        onClick={() => handleResultSelect(user.userId)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                      >
                        <Avatar className="size-8">
                          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
                          <AvatarFallback className="text-badge">{getInitials(user.displayName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-control truncate">{user.displayName}</span>
                          {caption && <span className="text-caption text-muted-foreground truncate">{caption}</span>}
                        </div>
                        {toggleRows && (
                          <span
                            aria-hidden="true"
                            className={cn(
                              'inline-grid size-[18px] shrink-0 place-items-center rounded border border-border',
                              selected && 'border-primary bg-primary text-primary-foreground'
                            )}
                          >
                            {selected && <Check className="size-3" />}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
                {showLoadMore && (
                  <li ref={sentinelRef} className="p-2 text-center text-caption text-muted-foreground">
                    {loadMoreLabel}
                  </li>
                )}
              </ul>
            )}
          </div>
        )}
      </div>
      {chipsPosition === 'below' && chipsBlock}
    </div>
  );
}
