import { Check, ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveDateFnsLocale } from '@/crd/lib/dateFnsLocale';
import { formatAbsoluteDateTime, formatRelativeFromNow } from '@/crd/lib/dateTimeFormat';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/crd/primitives/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';

export type PendingMembershipType = 'application' | 'invitation' | 'platformInvitation';
export type PendingMembershipContributorType = 'user' | 'organization' | 'virtualContributor';
export type PendingMembershipState = 'new' | 'approved' | 'rejected' | 'invited' | 'accepted';

export type PendingMembership = {
  id: string;
  type: PendingMembershipType;
  state: PendingMembershipState;
  contributorType: PendingMembershipContributorType;
  displayName: string;
  email?: string;
  url?: string;
  /** Raw ISO date string. The table formats both the display value and the tooltip timestamp. */
  createdDate: string;
  canApprove: boolean;
  canReject: boolean;
  canDelete: boolean;
};

export type PendingMembershipsTableProps = {
  items: PendingMembership[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
};

type StatusId =
  | 'applicationReceived'
  | 'applicationApproved'
  | 'applicationRejected'
  | 'invited'
  | 'invitationAccepted'
  | 'invitationRejected'
  | 'invitedExternal';

type SortColumn = 'name' | 'email' | 'date' | 'status' | 'type';
type SortDirection = 'asc' | 'desc';

const PAGE_SIZE = 5;

/** Display order of the status filter chips. */
const ALL_STATUS_IDS: StatusId[] = [
  'applicationReceived',
  'applicationApproved',
  'applicationRejected',
  'invited',
  'invitationAccepted',
  'invitationRejected',
  'invitedExternal',
];

/** Approved and rejected applications are hidden until the admin opts in. */
const DEFAULT_HIDDEN_STATUSES: StatusId[] = ['applicationApproved', 'applicationRejected'];
const DEFAULT_ACTIVE_STATUSES: StatusId[] = ALL_STATUS_IDS.filter(id => !DEFAULT_HIDDEN_STATUSES.includes(id));

function statusId(type: PendingMembershipType, state: PendingMembershipState): StatusId {
  if (type === 'application') {
    if (state === 'approved') return 'applicationApproved';
    if (state === 'rejected') return 'applicationRejected';
    return 'applicationReceived';
  }
  if (type === 'invitation') {
    if (state === 'accepted') return 'invitationAccepted';
    if (state === 'rejected') return 'invitationRejected';
    return 'invited';
  }
  return 'invitedExternal';
}

function statusVariantClass(id: StatusId): string {
  switch (id) {
    case 'applicationReceived':
      return 'bg-primary/10 text-primary border-primary/20 font-bold';
    case 'applicationApproved':
    case 'invitationAccepted':
      return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
    case 'applicationRejected':
    case 'invitationRejected':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    default:
      return 'bg-primary/10 text-primary border-primary/20';
  }
}

export function PendingMembershipsTable({
  items,
  onApprove,
  onReject,
  onDelete,
  className,
}: PendingMembershipsTableProps) {
  const { t, i18n } = useTranslation('crd-spaceSettings');
  const locale = resolveDateFnsLocale(i18n.language);

  const [activeStatuses, setActiveStatuses] = useState<StatusId[]>(DEFAULT_ACTIVE_STATUSES);
  const [sort, setSort] = useState<{ column: SortColumn; direction: SortDirection }>({
    column: 'date',
    direction: 'desc',
  });
  const [page, setPage] = useState(1);

  const statusLabel = (id: StatusId) => t(`community.pendingMemberships.status.${id}`);
  const typeLabel = (row: PendingMembership) =>
    t(`community.pendingMemberships.contributorType.${row.contributorType}`, { defaultValue: row.contributorType });

  const toggleStatus = (id: StatusId) => {
    setActiveStatuses(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
    setPage(1);
  };

  const toggleSort = (column: SortColumn) => {
    setSort(prev =>
      prev.column === column
        ? { column, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { column, direction: 'asc' }
    );
  };

  const statusCounts = items.reduce<Record<StatusId, number>>(
    (acc, row) => {
      const id = statusId(row.type, row.state);
      acc[id] = (acc[id] ?? 0) + 1;
      return acc;
    },
    {} as Record<StatusId, number>
  );

  const visible = items.filter(row => activeStatuses.includes(statusId(row.type, row.state)));

  const sorted = [...visible].sort((a, b) => {
    const dir = sort.direction === 'asc' ? 1 : -1;
    switch (sort.column) {
      case 'name':
        return a.displayName.localeCompare(b.displayName, i18n.language) * dir;
      case 'email':
        return (a.email ?? '').localeCompare(b.email ?? '', i18n.language) * dir;
      case 'date': {
        const ta = a.createdDate ? new Date(a.createdDate).getTime() : 0;
        const tb = b.createdDate ? new Date(b.createdDate).getTime() : 0;
        return (ta - tb) * dir;
      }
      case 'status':
        return (
          statusLabel(statusId(a.type, a.state)).localeCompare(statusLabel(statusId(b.type, b.state)), i18n.language) *
          dir
        );
      case 'type':
        return typeLabel(a).localeCompare(typeLabel(b), i18n.language) * dir;
      default:
        return 0;
    }
  });

  const headProps = (column: SortColumn, label: string) => ({
    column,
    label,
    ariaLabel: t('community.pendingMemberships.sortBy', { column: label }),
    sort,
    onSort: toggleSort,
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, sorted.length);
  const paginated = sorted.slice(pageStart, pageEnd);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center gap-2">
        <h3 className="text-subsection-title">{t('community.pendingMemberships.title')}</h3>
        <Badge variant="secondary" className="rounded-full">
          {sorted.length}
        </Badge>
      </div>

      <fieldset className="m-0 flex flex-wrap gap-2 border-0 p-0">
        <legend className="sr-only">{t('community.pendingMemberships.filterLabel')}</legend>
        {ALL_STATUS_IDS.map(id => {
          const active = activeStatuses.includes(id);
          const count = statusCounts[id] ?? 0;
          const emphasize = id === 'applicationReceived' && count > 0;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => toggleStatus(id)}
              className={cn(
                'rounded-md border border-border px-2 py-0.5 text-caption font-medium whitespace-nowrap text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                active ? 'bg-muted' : 'bg-white hover:bg-muted/50',
                emphasize && 'font-bold text-foreground'
              )}
            >
              {statusLabel(id)} ({count})
            </button>
          );
        })}
      </fieldset>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead {...headProps('name', t('community.pendingMemberships.name'))} className="w-[280px]" />
              <SortableHead {...headProps('email', t('community.pendingMemberships.email'))} />
              <SortableHead {...headProps('date', t('community.pendingMemberships.date'))} />
              <SortableHead {...headProps('status', t('community.pendingMemberships.status.column'))} />
              <SortableHead {...headProps('type', t('community.pendingMemberships.type'))} />
              <TableHead className="w-[160px] text-right">{t('community.pendingMemberships.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                  {items.length === 0
                    ? t('community.pendingMemberships.empty')
                    : t('community.pendingMemberships.noMatch')}
                </TableCell>
              </TableRow>
            )}
            {paginated.map((row, index) => {
              const id = statusId(row.type, row.state);
              const dateDisplay = formatRelativeFromNow(row.createdDate, locale);
              const dateTooltip = formatAbsoluteDateTime(row.createdDate, locale);
              return (
                <TableRow key={`${row.type}-${row.id}`} className={cn(index % 2 === 1 && 'bg-muted/30')}>
                  <TableCell>
                    {row.type === 'platformInvitation' ? (
                      <span className="text-muted-foreground">—</span>
                    ) : row.url ? (
                      <a href={row.url} target="_blank" rel="noreferrer" className="text-body-emphasis hover:underline">
                        {row.displayName}
                      </a>
                    ) : (
                      <span className="text-body-emphasis">{row.displayName}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-body text-muted-foreground">{row.email || '—'}</TableCell>
                  <TableCell className="text-caption text-muted-foreground">
                    {dateDisplay && dateTooltip ? (
                      <Tooltip>
                        <TooltipTrigger className="cursor-help border-0 bg-transparent p-0 text-caption text-muted-foreground">
                          {dateDisplay}
                        </TooltipTrigger>
                        <TooltipContent>{dateTooltip}</TooltipContent>
                      </Tooltip>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('text-badge', statusVariantClass(id))}>
                      {statusLabel(id)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-body-emphasis">{typeLabel(row)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {row.canApprove && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-8 text-primary border-primary/30 hover:bg-primary/10"
                          onClick={() => onApprove(row.id)}
                          aria-label={t('community.pendingMemberships.approve')}
                        >
                          <Check aria-hidden="true" className="size-4" />
                        </Button>
                      )}
                      {row.canReject && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-8 text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => onReject(row.id)}
                          aria-label={t('community.pendingMemberships.reject')}
                        >
                          <X aria-hidden="true" className="size-4" />
                        </Button>
                      )}
                      {row.canDelete && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => onDelete(row.id)}
                          aria-label={t('community.pendingMemberships.delete')}
                        >
                          <Trash2 aria-hidden="true" className="size-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {sorted.length > PAGE_SIZE && (
        <div className="flex items-center justify-between py-2">
          <p className="text-caption text-muted-foreground">
            {t('community.pendingMemberships.pagination.showing', {
              from: pageStart + 1,
              to: pageEnd,
              total: sorted.length,
            })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              aria-label={t('community.pendingMemberships.pagination.previous')}
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
            </Button>
            <span className="text-caption text-body-emphasis">
              {t('community.pendingMemberships.pagination.page', { page: safePage, total: totalPages })}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              aria-label={t('community.pendingMemberships.pagination.next')}
            >
              <ChevronRight aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SortableHead({
  column,
  label,
  ariaLabel,
  sort,
  onSort,
  className,
}: {
  column: SortColumn;
  label: string;
  ariaLabel: string;
  sort: { column: SortColumn; direction: SortDirection };
  onSort: (column: SortColumn) => void;
  className?: string;
}) {
  const active = sort.column === column;
  const ariaSort = active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none';
  return (
    <TableHead className={className} aria-sort={ariaSort}>
      <button
        type="button"
        onClick={() => onSort(column)}
        aria-label={ariaLabel}
        className="inline-flex items-center gap-1 rounded hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {label}
        {active ? (
          sort.direction === 'asc' ? (
            <ChevronUp aria-hidden="true" className="size-3.5" />
          ) : (
            <ChevronDown aria-hidden="true" className="size-3.5" />
          )
        ) : (
          <ChevronsUpDown aria-hidden="true" className="size-3.5 opacity-50" />
        )}
      </button>
    </TableHead>
  );
}
