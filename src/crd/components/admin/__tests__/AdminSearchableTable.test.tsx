import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { AdminSearchableTable, type AdminTableColumn, type AdminTableRow } from '../AdminSearchableTable';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

type Row = AdminTableRow & { owner: string };

const columns: AdminTableColumn<Row>[] = [{ header: 'Owner', render: row => <span>{row.owner}</span> }];

const makeRows = (n: number): Row[] =>
  Array.from({ length: n }, (_, i) => ({ id: `${i}`, name: `Row ${i}`, url: `/row/${i}`, owner: `Owner ${i}` }));

const baseProps = {
  columns,
  loading: false,
  searchTerm: '',
  onSearchTermChange: vi.fn(),
  pageSize: 2,
} as const;

describe('AdminSearchableTable', () => {
  test('renders rows with a linked Name column and custom columns', () => {
    render(<AdminSearchableTable<Row> {...baseProps} rows={makeRows(2)} paginationMode="server" />);
    expect(screen.getByRole('link', { name: 'Row 0' })).toHaveAttribute('href', '/row/0');
    expect(screen.getByText('Owner 1')).toBeInTheDocument();
  });

  test('search input changes fire onSearchTermChange', async () => {
    const onSearchTermChange = vi.fn();
    render(
      <AdminSearchableTable<Row>
        {...baseProps}
        onSearchTermChange={onSearchTermChange}
        rows={makeRows(1)}
        paginationMode="server"
      />
    );
    await userEvent.type(screen.getByRole('searchbox'), 'a');
    expect(onSearchTermChange).toHaveBeenCalledWith('a');
  });

  test('client pagination shows firstPageSize rows then reveals more on "show more"', async () => {
    render(<AdminSearchableTable<Row> {...baseProps} rows={makeRows(5)} paginationMode="client" firstPageSize={2} />);
    expect(screen.getAllByRole('row')).toHaveLength(1 + 2); // header + 2 body rows
    await userEvent.click(screen.getByRole('button', { name: 'table.loadMore' }));
    expect(screen.getAllByRole('row')).toHaveLength(1 + 4);
  });

  test('server pagination delegates "show more" to fetchMore', async () => {
    const fetchMore = vi.fn();
    render(
      <AdminSearchableTable<Row>
        {...baseProps}
        rows={makeRows(2)}
        paginationMode="server"
        hasMore={true}
        fetchMore={fetchMore}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'table.loadMore' }));
    expect(fetchMore).toHaveBeenCalledOnce();
  });

  test('delete requires confirmation and only fires onDelete on confirm', async () => {
    const onDelete = vi.fn();
    render(<AdminSearchableTable<Row> {...baseProps} rows={makeRows(1)} paginationMode="server" onDelete={onDelete} />);
    await userEvent.click(screen.getByRole('button', { name: 'table.delete' }));
    expect(onDelete).not.toHaveBeenCalled();
    const dialog = screen.getByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'table.delete' }));
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: '0' }));
  });

  test('canDelete gates the delete action per row', () => {
    render(
      <AdminSearchableTable<Row>
        {...baseProps}
        rows={makeRows(1)}
        paginationMode="server"
        onDelete={vi.fn()}
        canDelete={() => false}
      />
    );
    expect(screen.queryByRole('button', { name: 'table.delete' })).toBeNull();
  });

  test('read-only lists (no onDelete) render no delete action', () => {
    render(<AdminSearchableTable<Row> {...baseProps} rows={makeRows(1)} paginationMode="server" />);
    expect(screen.queryByRole('button', { name: 'table.delete' })).toBeNull();
  });

  test('renders an empty state when there are no rows', () => {
    render(<AdminSearchableTable<Row> {...baseProps} rows={[]} paginationMode="server" />);
    expect(screen.getByText('table.empty')).toBeInTheDocument();
  });
});
