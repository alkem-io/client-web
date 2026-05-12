import { Plus, Search, UserMinus } from 'lucide-react';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Card, CardContent, CardHeader } from '@/crd/primitives/card';
import { Input } from '@/crd/primitives/input';
import { Skeleton } from '@/crd/primitives/skeleton';

export type RoleAssignmentPerson = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  /** Optional secondary line shown beneath the name (e.g., email or location). */
  subtitle?: string;
  /** Deterministic accent colour from `pickColorFromId` for the avatar fallback. */
  color: string;
};

export type RoleAssignmentLabels = {
  /** Pre-localized heading for the LEFT column (e.g., "Current Associates"). */
  currentTitle: string;
  /** Pre-localized heading for the RIGHT column (e.g., "Available Users"). */
  availableTitle: string;
  /** Search input placeholder. */
  searchPlaceholder: string;
  /** Aria-label for the per-row × Remove icon button. Passed `{name}`. */
  removeAriaLabel: string;
  /** Aria-label for the per-row + Add icon button. Passed `{name}`. */
  addAriaLabel: string;
  /** "Load more" button label. */
  loadMoreLabel: string;
  /** Caption shown when the LEFT column has no current members. */
  emptyCurrentLabel: string;
  /** Caption shown when the RIGHT column returns zero matches. */
  emptyAvailableLabel: string;
};

export type RoleAssignmentViewProps = {
  /** Current members holding the role (left column). */
  current: RoleAssignmentPerson[];
  /** Available users not yet holding the role (right column). */
  available: RoleAssignmentPerson[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  /** Add fires immediately on click — no confirmation (FR-110 / parity with MUI). */
  onAdd: (id: string) => void;
  /**
   * Remove opens the parent's destructive `ConfirmationDialog` (Rule #9 /
   * FR-112 / FR-121). The view never fires the mutation directly.
   */
  onRequestRemove: (id: string) => void;
  /** Load-more pagination on the available column (parity with MUI). */
  onLoadMore: () => void;
  hasMore: boolean;
  loadingCurrent: boolean;
  loadingAvailable: boolean;
  /** True while any add / remove mutation is in flight — disables both columns. */
  updating: boolean;
  labels: RoleAssignmentLabels;
};

/**
 * Shared role-assignment view (Decision #5 / research §5). Two-column
 * `+`/`×` role manager consumed by:
 *
 * - **Org Community** (US10) — the `Associate` role.
 * - **Org Authorization** (US11) — the `Admin` and `Owner` sub-tabs.
 *
 * Pure presentational. The parent supplies all i18n strings as a `labels`
 * prop so the component remains namespace-agnostic. Add fires immediately
 * via `onAdd(id)`; Remove opens the parent's `ConfirmationDialog` via
 * `onRequestRemove(id)` (Rule #9). Empty states render a single muted
 * caption per FR-018.
 */
export function RoleAssignmentView(props: RoleAssignmentViewProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <CurrentColumn
        people={props.current}
        loading={props.loadingCurrent}
        updating={props.updating}
        onRequestRemove={props.onRequestRemove}
        labels={props.labels}
      />
      <AvailableColumn
        people={props.available}
        searchTerm={props.searchTerm}
        onSearchChange={props.onSearchChange}
        onAdd={props.onAdd}
        onLoadMore={props.onLoadMore}
        hasMore={props.hasMore}
        loading={props.loadingAvailable}
        updating={props.updating}
        labels={props.labels}
      />
    </div>
  );
}

// ─── Current column (left) ───────────────────────────────────────────────

function CurrentColumn({
  people,
  loading,
  updating,
  onRequestRemove,
  labels,
}: {
  people: RoleAssignmentPerson[];
  loading: boolean;
  updating: boolean;
  onRequestRemove: (id: string) => void;
  labels: RoleAssignmentLabels;
}) {
  return (
    <Card>
      <CardHeader className="border-b py-3">
        <h3 className="text-section-title">{labels.currentTitle}</h3>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <ColumnSkeleton />
        ) : people.length === 0 ? (
          <p className="py-6 text-center text-body text-muted-foreground">{labels.emptyCurrentLabel}</p>
        ) : (
          <ul className="divide-y">
            {people.map(person => (
              <PersonRow
                key={person.id}
                person={person}
                action="remove"
                disabled={updating}
                onClick={() => onRequestRemove(person.id)}
                ariaLabel={labels.removeAriaLabel.replace('{name}', person.displayName)}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Available column (right) ────────────────────────────────────────────

function AvailableColumn({
  people,
  searchTerm,
  onSearchChange,
  onAdd,
  onLoadMore,
  hasMore,
  loading,
  updating,
  labels,
}: {
  people: RoleAssignmentPerson[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAdd: (id: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  updating: boolean;
  labels: RoleAssignmentLabels;
}) {
  return (
    <Card>
      <CardHeader className="space-y-3 border-b py-3">
        <h3 className="text-section-title">{labels.availableTitle}</h3>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={labels.searchPlaceholder}
            aria-label={labels.searchPlaceholder}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading && people.length === 0 ? (
          <ColumnSkeleton />
        ) : people.length === 0 ? (
          <p className="py-6 text-center text-body text-muted-foreground">{labels.emptyAvailableLabel}</p>
        ) : (
          <ul className="divide-y">
            {people.map(person => (
              <PersonRow
                key={person.id}
                person={person}
                action="add"
                disabled={updating}
                onClick={() => onAdd(person.id)}
                ariaLabel={labels.addAriaLabel.replace('{name}', person.displayName)}
              />
            ))}
          </ul>
        )}
        {hasMore ? (
          <div className="flex justify-center border-t p-3">
            <Button variant="ghost" size="sm" onClick={onLoadMore} disabled={loading || updating}>
              {labels.loadMoreLabel}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

// ─── Person row ──────────────────────────────────────────────────────────

function PersonRow({
  person,
  action,
  disabled,
  onClick,
  ariaLabel,
}: {
  person: RoleAssignmentPerson;
  action: 'add' | 'remove';
  disabled: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  const initials = person.displayName.slice(0, 2).toUpperCase();
  const Icon = action === 'add' ? Plus : UserMinus;

  return (
    <li className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30">
      <Avatar className="size-9 shrink-0">
        {person.avatarUrl ? <AvatarImage src={person.avatarUrl} alt={person.displayName} /> : null}
        <AvatarFallback color={person.color} className="text-white text-caption">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-body-emphasis">{person.displayName}</p>
        {person.subtitle ? <p className="truncate text-caption text-muted-foreground">{person.subtitle}</p> : null}
      </div>
      <Button
        type="button"
        variant={action === 'remove' ? 'ghost' : 'ghost'}
        size="icon"
        className={cn('size-8 shrink-0', action === 'remove' && 'text-destructive hover:text-destructive')}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        <Icon aria-hidden="true" className="size-4" />
      </Button>
    </li>
  );
}

function ColumnSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 3 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders are interchangeable
        <Skeleton key={i} className="h-12 w-full rounded-md" />
      ))}
    </div>
  );
}
