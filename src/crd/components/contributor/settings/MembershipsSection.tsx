import { Folder, Search } from 'lucide-react';
import { StackedPersonAvatars } from '@/crd/components/common/StackedPersonAvatars';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Input } from '@/crd/primitives/input';
import type {
  MembershipFilter,
  MembershipRowData,
  MembershipsSectionLabels,
  MembershipsSectionProps,
} from './MembershipsSection.types';

const MAX_VISIBLE_LEADS = 3;

/**
 * Membership list shared by the user and organization Membership tabs: a
 * full-width search, a Spaces/Subspaces filter + summary row, then one row
 * per membership — space avatar, linked name, "Led by:" lead avatars, role
 * badge and a Leave button (spec 097 Session 2026-10-23). Label-free — every string arrives through
 * `labels`; the Leave confirmation dialog is owned by the consuming page.
 *
 * With no memberships at all the grid collapses to a single muted caption;
 * when filters match nothing it shows a dashed "Clear Filters" block.
 */
export function MembershipsSection({
  rows,
  totalShown,
  totalUnfiltered,
  search,
  filter,
  onSearchChange,
  onFilterChange,
  onClearFilters,
  onLeave,
  labels,
}: MembershipsSectionProps) {
  if (totalUnfiltered === 0) {
    return <p className="py-6 text-center text-body text-muted-foreground">{labels.emptyCaption}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="relative w-full">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={labels.searchPlaceholder}
            aria-label={labels.searchPlaceholder}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SegmentedFilter value={filter} onChange={onFilterChange} labels={labels} />
          <p className="text-caption text-muted-foreground">{labels.summary(totalShown, totalUnfiltered)}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <FilteredEmptyState onClear={onClearFilters} labels={labels} />
      ) : (
        <ul className="space-y-2">
          {rows.map(row => (
            <MembershipRow key={row.id} row={row} onLeave={() => onLeave(row)} labels={labels} />
          ))}
        </ul>
      )}
    </div>
  );
}

function SegmentedFilter({
  value,
  onChange,
  labels,
}: {
  value: MembershipFilter;
  onChange: (next: MembershipFilter) => void;
  labels: MembershipsSectionLabels;
}) {
  const options: Array<{ key: MembershipFilter; label: string }> = [
    { key: 'all', label: labels.filterAll },
    { key: 'spaces', label: labels.filterSpaces },
    { key: 'subspaces', label: labels.filterSubspaces },
  ];
  return (
    <div className="flex items-center rounded-md border bg-muted/20 p-1">
      {options.map(opt => (
        <button
          key={opt.key}
          type="button"
          aria-pressed={value === opt.key}
          onClick={() => onChange(opt.key)}
          className={cn(
            'rounded-sm px-3 py-1.5 text-control transition-all',
            value === opt.key
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function MembershipRow({
  row,
  onLeave,
  labels,
}: {
  row: MembershipRowData;
  onLeave: () => void;
  labels: MembershipsSectionLabels;
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border bg-muted/10 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-9 shrink-0 rounded-lg">
          {row.avatarUrl ? <AvatarImage src={row.avatarUrl} alt="" className="object-cover" /> : null}
          <AvatarFallback color={row.color} className="rounded-lg text-caption font-bold text-white">
            {row.displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          {row.spaceUrl ? (
            <a href={row.spaceUrl} className="block truncate text-body-emphasis transition-colors hover:text-primary">
              {row.displayName}
            </a>
          ) : (
            <p className="truncate text-body-emphasis">{row.displayName}</p>
          )}
          {row.leadUsers.length > 0 ? (
            <div className="mt-0.5 flex items-center gap-2 text-caption text-muted-foreground">
              <span>{labels.ledBy}</span>
              <StackedPersonAvatars
                people={row.leadUsers.map(lead => ({
                  id: lead.id,
                  name: lead.displayName,
                  avatarUrl: lead.avatarUrl,
                }))}
                maxVisible={MAX_VISIBLE_LEADS}
                sizeClass="5"
                groupAriaLabel={labels.ledByAria(row.leadUsers.length)}
                overflowTooltipLabel={
                  row.leadUsers.length > MAX_VISIBLE_LEADS
                    ? labels.leadsMore(row.leadUsers.length - MAX_VISIBLE_LEADS)
                    : undefined
                }
              />
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="secondary">{labels.roleLabel(row.role)}</Badge>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={onLeave}
          aria-label={labels.leaveAriaLabel(row.displayName)}
        >
          {labels.leave}
        </Button>
      </div>
    </li>
  );
}

function FilteredEmptyState({ onClear, labels }: { onClear: () => void; labels: MembershipsSectionLabels }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/10 py-16 text-center">
      <Folder aria-hidden="true" className="mb-3 size-10 text-muted-foreground/50" />
      <h3 className="text-subsection-title">{labels.filteredEmptyTitle}</h3>
      <p className="mb-4 text-body text-muted-foreground">{labels.filteredEmptyDescription}</p>
      <Button variant="outline" onClick={onClear}>
        {labels.clearFilters}
      </Button>
    </div>
  );
}
