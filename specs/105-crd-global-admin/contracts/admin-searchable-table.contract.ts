/**
 * Contract: generic CRD searchable/paginated admin table.
 *
 * Presentational component in `src/crd/components/admin/AdminSearchableTable.tsx`.
 * CRD twin of MUI `src/domain/platformAdmin/components/AdminSearchableTable.tsx`.
 * Backs all six list sections (Spaces, Users, Organizations, Innovation Packs,
 * Innovation Hubs, Virtual Contributors) — DRY/SRP.
 *
 * Pure: no MUI/Apollo. Delete routes through ConfirmationDialog (destructive).
 */
import type { ReactNode } from 'react';

export type AdminTableRow = {
  id: string;
  name: string; // Name-column text
  url: string; // Name-column link target
};

export type AdminTableColumn<Row extends AdminTableRow> = {
  /** Translated header label. */
  header: string;
  /** Cell renderer for this column. */
  render: (row: Row) => ReactNode;
  /** Optional flex/min-width hints (Tailwind-friendly). */
  widthClassName?: string;
};

export type AdminSearchableTableProps<Row extends AdminTableRow> = {
  rows: Row[];
  columns: AdminTableColumn<Row>[];

  loading: boolean;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;

  /** Total server count (server mode) or omitted for pure client lists. */
  totalCount?: number;

  /**
   * Pagination mode:
   *  - 'client'  → component shows `firstPageSize` then +`pageSize` on "show more"
   *               over the full `rows` set (Spaces, Packs, Hubs, VCs).
   *  - 'server'  → consumer supplies `fetchMore`/`hasMore` (Users, Orgs).
   */
  paginationMode: 'client' | 'server';
  pageSize: number;
  firstPageSize?: number;
  hasMore?: boolean; // server mode
  fetchMore?: () => void; // server mode

  /** Per-row extra actions (settings, verify, change-email, …). */
  rowActions?: (row: Row) => ReactNode;

  /**
   * Delete handler. When provided, a Delete row action renders and fires
   * ConfirmationDialog (variant="destructive") BEFORE calling onDelete.
   * Omit for read-only lists (Virtual Contributors).
   */
  onDelete?: (row: Row) => void;
  /** Per-row gate for the delete action (e.g. Space.canUpdate). */
  canDelete?: (row: Row) => boolean;

  /** Translated empty-state message. Falls back to `table.empty` when omitted. */
  emptyLabel?: string;
  className?: string;
};
