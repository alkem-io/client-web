import { Trash2 } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '@/crd/components/dialogs/ConfirmationDialog';
import { SearchField } from '@/crd/forms/SearchField';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Skeleton } from '@/crd/primitives/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/crd/primitives/table';

export type AdminTableRow = {
  id: string;
  /** Name-column text. */
  name: string;
  /** Name-column link target. */
  url: string;
};

export type AdminTableColumn<Row extends AdminTableRow> = {
  /** Translated header label. */
  header: string;
  render: (row: Row) => ReactNode;
  /** Optional Tailwind width hint for the column cells. */
  widthClassName?: string;
};

type AdminSearchableTableProps<Row extends AdminTableRow> = {
  rows: Row[];
  columns: AdminTableColumn<Row>[];

  loading: boolean;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;

  /** Total server count (server mode) — omit for pure client lists. */
  totalCount?: number;

  /**
   * - `client`: show `firstPageSize` then +`pageSize` on "show more" over the
   *   full `rows` set (Spaces, Packs, Hubs, VCs).
   * - `server`: consumer supplies `fetchMore` / `hasMore` (Users, Orgs).
   */
  paginationMode: 'client' | 'server';
  pageSize: number;
  firstPageSize?: number;
  hasMore?: boolean;
  fetchMore?: () => void;

  /** Per-row extra actions (settings, verify, change-email, …). */
  rowActions?: (row: Row) => ReactNode;

  /**
   * When provided, a Delete row action renders and fires `ConfirmationDialog`
   * (destructive) BEFORE calling `onDelete`. Omit for read-only lists.
   */
  onDelete?: (row: Row) => void;
  /** Per-row gate for the delete action (e.g. `Space.canUpdate`). */
  canDelete?: (row: Row) => boolean;

  /** Optional empty-state override; defaults to the shared `table.empty` label. */
  emptyLabel?: string;
  className?: string;
};

/**
 * Generic searchable / paginated admin table — the CRD twin of the MUI
 * `AdminSearchableTable`. Backs every admin list section: Name + link column,
 * custom columns, per-row actions, client or server pagination, and
 * delete-with-confirmation. Pure presentation — search, pagination, and
 * delete all surface through callbacks; the consumer owns the data.
 */
export function AdminSearchableTable<Row extends AdminTableRow>({
  rows,
  columns,
  loading,
  searchTerm,
  onSearchTermChange,
  totalCount,
  paginationMode,
  pageSize,
  firstPageSize = pageSize,
  hasMore = false,
  fetchMore,
  rowActions,
  onDelete,
  canDelete,
  emptyLabel,
  className,
}: AdminSearchableTableProps<Row>) {
  const { t } = useTranslation('crd-admin');
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);

  // Client-side "show more" state — reset whenever the dataset or query changes.
  const [displayedCount, setDisplayedCount] = useState(firstPageSize);
  useEffect(() => {
    if (paginationMode === 'client') setDisplayedCount(firstPageSize);
  }, [paginationMode, firstPageSize, searchTerm, rows]);

  const visibleRows = paginationMode === 'client' ? rows.slice(0, displayedCount) : rows;
  const canLoadMore = paginationMode === 'client' ? displayedCount < rows.length : hasMore;

  const handleLoadMore = () => {
    if (paginationMode === 'client') {
      setDisplayedCount(prev => Math.min(prev + pageSize, rows.length));
    } else {
      fetchMore?.();
    }
  };

  const showInitialSkeleton = loading && visibleRows.length === 0;
  const columnCount = columns.length + 2; // Name + custom columns + Actions

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <SearchField value={searchTerm} onValueChange={onSearchTermChange} placeholder={t('table.searchPlaceholder')} />

      <output className="text-caption text-muted-foreground" aria-live="polite">
        {t('table.showing', { count: visibleRows.length, total: totalCount ?? rows.length })}
      </output>

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.name')}</TableHead>
              {columns.map(column => (
                <TableHead key={column.header} className={column.widthClassName}>
                  {column.header}
                </TableHead>
              ))}
              <TableHead className="text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showInitialSkeleton
              ? Array.from({ length: firstPageSize }).map((_, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
                  <TableRow key={`skeleton-${index}`}>
                    {Array.from({ length: columnCount }).map((__, cellIndex) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton cells
                      <TableCell key={`skeleton-cell-${cellIndex}`}>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : visibleRows.map(row => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      <a href={row.url} className="text-primary hover:underline break-words">
                        {row.name}
                      </a>
                    </TableCell>
                    {columns.map(column => (
                      <TableCell key={column.header} className={column.widthClassName}>
                        {column.render(row)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        {rowActions?.(row)}
                        {onDelete && (!canDelete || canDelete(row)) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            aria-label={t('table.delete')}
                            onClick={() => setPendingDelete(row)}
                          >
                            <Trash2 aria-hidden="true" className="size-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            {!showInitialSkeleton && visibleRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columnCount} className="text-center text-muted-foreground py-8">
                  {emptyLabel ?? t('table.empty')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {canLoadMore && (
        <div className="flex justify-center">
          <Button type="button" variant="outline" onClick={handleLoadMore} disabled={loading} aria-busy={loading}>
            {t('table.loadMore')}
          </Button>
        </div>
      )}

      <ConfirmationDialog
        open={Boolean(pendingDelete)}
        onOpenChange={open => {
          if (!open) setPendingDelete(null);
        }}
        variant="destructive"
        title={t('table.deleteTitle', { name: pendingDelete?.name ?? '' })}
        description={t('table.deleteDescription')}
        confirmLabel={t('table.delete')}
        onConfirm={() => {
          if (pendingDelete) onDelete?.(pendingDelete);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
