import { ExternalLink, Folder, LogOut, MoreVertical, Search } from 'lucide-react';
import { StackedPersonAvatars } from '@/crd/components/common/StackedPersonAvatars';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/crd/primitives/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/crd/primitives/dropdown-menu';
import { Input } from '@/crd/primitives/input';
import type {
  MembershipFilter,
  MembershipRowData,
  MembershipsSectionLabels,
  MembershipsSectionProps,
} from './MembershipsSection.types';

const MAX_VISIBLE_LEADS = 3;

/**
 * Membership card grid shared by the user and organization Membership tabs:
 * search input + Spaces/Subspaces filter + responsive card grid with a
 * per-card kebab (View + Leave). Label-free — every string arrives through
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
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-96">
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
        <SegmentedFilter value={filter} onChange={onFilterChange} labels={labels} />
      </div>

      <p className="text-caption text-muted-foreground">{labels.summary(totalShown, totalUnfiltered)}</p>

      {rows.length === 0 ? (
        <FilteredEmptyState onClear={onClearFilters} labels={labels} />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rows.map(row => (
            <MembershipCard key={row.id} row={row} onLeave={() => onLeave(row)} labels={labels} />
          ))}
        </div>
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

function MembershipCard({
  row,
  onLeave,
  labels,
}: {
  row: MembershipRowData;
  onLeave: () => void;
  labels: MembershipsSectionLabels;
}) {
  const typeLabel = row.type === 'Space' ? labels.typeSpace : labels.typeSubspace;
  const viewLabel = labels.viewLabel(typeLabel);
  const leaveLabel = labels.leaveLabel(typeLabel);
  const showRowLink = row.spaceUrl.length > 0;

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-border transition-colors hover:border-primary/50">
      {/* Banner area is a plain div (no whole-card link) — navigation is via the kebab's "View Details" item, matching the prototype. */}
      <div
        className="relative aspect-video overflow-hidden bg-muted"
        style={
          row.bannerUrl
            ? undefined
            : { background: `linear-gradient(135deg, ${row.color}, color-mix(in srgb, ${row.color} 70%, black))` }
        }
      >
        {row.bannerUrl ? (
          <img
            src={row.bannerUrl}
            alt={row.displayName}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="border-0 bg-background/80 text-foreground backdrop-blur-md">
            {typeLabel}
          </Badge>
        </div>
        <div className="absolute right-3 top-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild={true}>
              <Button
                variant="secondary"
                size="icon"
                className="size-8 rounded-full bg-background/90 shadow-sm backdrop-blur-sm"
                aria-label={labels.menuTriggerAriaLabel}
              >
                <MoreVertical aria-hidden="true" className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {showRowLink ? (
                <DropdownMenuItem asChild={true}>
                  <a href={row.spaceUrl}>
                    <ExternalLink aria-hidden="true" className="mr-2 size-4" />
                    {viewLabel}
                  </a>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem variant="destructive" onClick={onLeave}>
                <LogOut aria-hidden="true" className="mr-2 size-4" />
                {leaveLabel}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          {showRowLink ? (
            <a
              href={row.spaceUrl}
              className="line-clamp-1 text-subsection-title leading-tight transition-colors hover:text-primary group-hover:text-primary"
            >
              {row.displayName}
            </a>
          ) : (
            <h3 className="line-clamp-1 text-subsection-title leading-tight">{row.displayName}</h3>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Badge
            variant="outline"
            className="h-5 border-primary/20 bg-primary/5 px-1.5 py-0 font-normal text-badge text-primary"
          >
            {labels.roleLabel(row.role)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4 pt-2">
        {row.tagline ? <p className="line-clamp-2 text-body text-muted-foreground">{row.tagline}</p> : null}
      </CardContent>
      {row.leadUsers.length > 0 ? (
        <CardFooter className="mt-auto flex items-center justify-between gap-3 border-t bg-muted/30 p-4 text-caption text-muted-foreground">
          <span>{labels.ledBy}</span>
          <StackedPersonAvatars
            people={row.leadUsers.map(lead => ({
              id: lead.id,
              name: lead.displayName,
              avatarUrl: lead.avatarUrl,
            }))}
            maxVisible={MAX_VISIBLE_LEADS}
            sizeClass="6"
            groupAriaLabel={labels.ledByAria(row.leadUsers.length)}
            overflowTooltipLabel={
              row.leadUsers.length > MAX_VISIBLE_LEADS
                ? labels.leadsMore(row.leadUsers.length - MAX_VISIBLE_LEADS)
                : undefined
            }
          />
        </CardFooter>
      ) : null}
    </Card>
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
