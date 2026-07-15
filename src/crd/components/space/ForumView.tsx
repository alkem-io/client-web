import { MessageSquare } from 'lucide-react';
import { SearchField } from '@/crd/forms/SearchField';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Skeleton } from '@/crd/primitives/skeleton';

export type ForumRow = {
  id: string;
  title: string;
  /** Not rendered — carried so the consumer can filter on it. */
  description?: string;
  authorName?: string;
  authorAvatarUrl?: string;
  timestamp?: string;
  commentCount: number;
};

export type ForumViewColumns = {
  title: string;
  author: string;
  date: string;
  comments: string;
};

type ForumViewProps = {
  rows: ForumRow[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onRowClick: (id: string) => void;
  loading?: boolean;
  searchPlaceholder: string;
  searchAriaLabel: string;
  columns: ForumViewColumns;
  emptyLabel: string;
  /** Accessible label for the list of rows. */
  listLabel: string;
  /** Accessible label for the comment count, e.g. "3 comments". */
  commentCountLabel: (count: number) => string;
};

// Shared 12-col grid: title grows, the rest are fixed-ish. Kept in one place so
// the header row and the data rows always line up.
const GRID = 'grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_10rem_7rem_5rem] gap-4 items-center';

/**
 * Forum layout for a flow state's callouts (POC): a compact, searchable table.
 * Purely presentational — the consumer supplies rows, owns the search value, and
 * decides what a row click does. Author name/date collapse away on small screens.
 */
export function ForumView({
  rows,
  searchValue,
  onSearchChange,
  onRowClick,
  loading,
  searchPlaceholder,
  searchAriaLabel,
  columns,
  emptyLabel,
  listLabel,
  commentCountLabel,
}: ForumViewProps) {
  return (
    <div className="space-y-4">
      <SearchField
        value={searchValue}
        onValueChange={onSearchChange}
        placeholder={searchPlaceholder}
        ariaLabel={searchAriaLabel}
      />

      <div className="border border-border rounded-lg overflow-hidden">
        {/* Column header */}
        <div
          className={cn(
            GRID,
            'px-4 py-2 border-b border-border bg-muted/40 text-label uppercase text-muted-foreground'
          )}
        >
          <span>{columns.title}</span>
          <span className="hidden sm:block">{columns.author}</span>
          <span className="hidden sm:block">{columns.date}</span>
          <span className="text-right">{columns.comments}</span>
        </div>

        {loading ? (
          <output aria-label={emptyLabel} className="block">
            {[0, 1, 2].map(i => (
              <div key={i} className={cn(GRID, 'px-4 py-3 border-b border-border last:border-b-0')}>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="hidden sm:block h-4 w-24" />
                <Skeleton className="hidden sm:block h-4 w-16" />
                <Skeleton className="h-4 w-8 justify-self-end" />
              </div>
            ))}
          </output>
        ) : rows.length === 0 ? (
          <p className="px-4 py-8 text-center text-body text-muted-foreground">{emptyLabel}</p>
        ) : (
          // biome-ignore lint/a11y/useSemanticElements: role="list" restores list semantics after the list-style reset
          // biome-ignore lint/a11y/noRedundantRoles: kept intentionally — Tailwind's list-style reset drops the implicit list role in Safari
          <ul role="list" aria-label={listLabel} className="divide-y divide-border">
            {rows.map(row => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => onRowClick(row.id)}
                  className={cn(
                    GRID,
                    'w-full px-4 py-3 text-left transition-colors hover:bg-muted/50',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
                  )}
                >
                  <span className="text-body-emphasis text-foreground truncate">{row.title}</span>

                  <span className="hidden sm:flex items-center gap-2 min-w-0">
                    {row.authorName && (
                      <>
                        <Avatar className="size-6">
                          {row.authorAvatarUrl && <AvatarImage src={row.authorAvatarUrl} alt={row.authorName} />}
                          <AvatarFallback className="text-badge">{row.authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-caption text-muted-foreground truncate">{row.authorName}</span>
                      </>
                    )}
                  </span>

                  <span className="hidden sm:block text-caption text-muted-foreground">{row.timestamp}</span>

                  <span className="flex items-center justify-end gap-1 text-caption text-muted-foreground">
                    <MessageSquare className="size-3.5 shrink-0" aria-hidden="true" />
                    <span aria-hidden="true">{row.commentCount}</span>
                    <span className="sr-only">{commentCountLabel(row.commentCount)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
