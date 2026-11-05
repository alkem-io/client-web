import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { StoreEntityList } from '../StoreEntityList';
import type { AdminStoreEntityRow } from '../storeEntityRow';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

const rows: AdminStoreEntityRow[] = [
  { id: 'p1', name: 'Pack One', url: '/p1', listedInStore: true, searchVisibility: 'public', accountOwner: 'Owner 1' },
  {
    id: 'p2',
    name: 'Pack Two',
    url: '/p2',
    listedInStore: false,
    searchVisibility: 'internal',
    accountOwner: 'Owner 2',
  },
];

describe('StoreEntityList', () => {
  test('renders the Listed / Visibility / Owner columns', () => {
    render(<StoreEntityList rows={rows} loading={false} />);
    expect(screen.getByRole('link', { name: 'Pack One' })).toBeInTheDocument();
    expect(screen.getByText('columns.listed')).toBeInTheDocument();
    expect(screen.getByText('columns.notListed')).toBeInTheDocument();
    expect(screen.getByText('columns.public')).toBeInTheDocument();
    expect(screen.getByText('columns.internal')).toBeInTheDocument();
    expect(screen.getByText('Owner 1')).toBeInTheDocument();
  });

  test('search filters rows client-side', async () => {
    render(<StoreEntityList rows={rows} loading={false} />);
    await userEvent.type(screen.getByRole('searchbox'), 'two');
    expect(screen.queryByRole('link', { name: 'Pack One' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Pack Two' })).toBeInTheDocument();
  });

  test('delete (when provided) confirms then fires onDelete', async () => {
    const onDelete = vi.fn();
    render(<StoreEntityList rows={rows} loading={false} onDelete={onDelete} />);
    await userEvent.click(screen.getAllByRole('button', { name: 'table.delete' })[0]);
    const dialog = screen.getByRole('alertdialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'table.delete' }));
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'p1' }));
  });

  // 027 R-F.2 follow-up (2026-09-16, sandbox walk): Platform Support reads
  // the pack/hub lists but holds neither DELETE nor PLATFORM_CONTENT_FULL_ACCESS
  // on a pack, so the server refuses `deleteInnovationPack` — the button must
  // not be offered on such a row (F9's defect shape: an action that can only
  // fail). Rows that say nothing keep the action.
  test('a row with canDelete=false renders no delete action; canDelete=true and undefined keep it', () => {
    const gated: AdminStoreEntityRow[] = [
      { ...rows[0], canDelete: false },
      { ...rows[1], canDelete: true },
      { id: 'p3', name: 'Pack Three', url: '/p3', listedInStore: true, searchVisibility: 'public', accountOwner: 'O' },
    ];
    render(<StoreEntityList rows={gated} loading={false} onDelete={vi.fn()} />);
    const one = screen.getByRole('link', { name: 'Pack One' }).closest('tr')!;
    const two = screen.getByRole('link', { name: 'Pack Two' }).closest('tr')!;
    const three = screen.getByRole('link', { name: 'Pack Three' }).closest('tr')!;
    expect(within(one).queryByRole('button', { name: 'table.delete' })).toBeNull();
    expect(within(two).getByRole('button', { name: 'table.delete' })).toBeInTheDocument();
    expect(within(three).getByRole('button', { name: 'table.delete' })).toBeInTheDocument();
  });

  test('read-only lists (no onDelete) render no delete action', () => {
    render(<StoreEntityList rows={rows} loading={false} />);
    expect(screen.queryByRole('button', { name: 'table.delete' })).toBeNull();
  });

  describe('Promote column', () => {
    const promoteLabel = (name: string) => `columns.promoteOf:${JSON.stringify({ name })}`;
    const promoted: AdminStoreEntityRow[] = [
      { ...rows[0], promote: true },
      { ...rows[1], promote: false },
    ];

    test('without onPromoteChange there is no Promote column, even when rows carry a value', () => {
      render(<StoreEntityList rows={promoted} loading={false} />);
      expect(screen.queryByRole('columnheader', { name: 'columns.promoteHeader' })).toBeNull();
      expect(screen.queryByRole('checkbox')).toBeNull();
    });

    test('with onPromoteChange and a non-null row it is the last header before Actions', () => {
      render(<StoreEntityList rows={promoted} loading={false} onPromoteChange={vi.fn()} />);
      const headers = screen.getAllByRole('columnheader').map(header => header.textContent);
      expect(headers.slice(-3)).toEqual(['columns.ownerHeader', 'columns.promoteHeader', 'table.actions']);
      expect(screen.getByRole('checkbox', { name: promoteLabel('Pack One') })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: promoteLabel('Pack Two') })).not.toBeChecked();
    });

    test('clicking a box calls onPromoteChange with the row and the next value', async () => {
      const onPromoteChange = vi.fn();
      render(<StoreEntityList rows={promoted} loading={false} onPromoteChange={onPromoteChange} />);
      await userEvent.click(screen.getByRole('checkbox', { name: promoteLabel('Pack Two') }));
      expect(onPromoteChange).toHaveBeenCalledWith(expect.objectContaining({ id: 'p2' }), true);
    });

    test('with onPromoteChange but all-null rows there is no Promote column', () => {
      const hidden = rows.map(row => ({ ...row, promote: null }));
      render(<StoreEntityList rows={hidden} loading={false} onPromoteChange={vi.fn()} />);
      expect(screen.queryByRole('columnheader', { name: 'columns.promoteHeader' })).toBeNull();
    });

    test('boxes are disabled while promoteSaving', () => {
      render(<StoreEntityList rows={promoted} loading={false} onPromoteChange={vi.fn()} promoteSaving={true} />);
      expect(screen.getByRole('checkbox', { name: promoteLabel('Pack One') })).toBeDisabled();
    });
  });
});
