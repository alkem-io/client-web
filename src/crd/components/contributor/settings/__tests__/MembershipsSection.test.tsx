import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MembershipsSection } from '../MembershipsSection';
import type { MembershipRowData, MembershipsSectionLabels } from '../MembershipsSection.types';

const buildLabels = (owner: 'user' | 'organisation'): MembershipsSectionLabels => ({
  searchPlaceholder: `${owner}: search`,
  filterAll: 'All',
  filterSpaces: 'Spaces',
  filterSubspaces: 'Subspaces',
  summary: (shown, total) => `${owner}: showing ${shown} of ${total}`,
  filteredEmptyTitle: `${owner}: nothing found`,
  filteredEmptyDescription: `${owner}: adjust filters`,
  clearFilters: 'Clear Filters',
  emptyCaption: `${owner}: no memberships yet`,
  roleLabel: role => `${owner} role ${role}`,
  leave: 'Leave',
  leaveAriaLabel: name => `${owner}: leave ${name}`,
  ledBy: 'Led by:',
  ledByAria: count => `${count} leads`,
  leadsMore: count => `and ${count} more`,
});

const ROWS: MembershipRowData[] = [
  {
    id: 'space-1',
    displayName: 'Garden Space',
    avatarUrl: 'https://cdn/garden.jpg',
    color: '#42a5f5',
    type: 'Space',
    role: 'Member',
    spaceUrl: '/garden',
    leadUsers: [
      { id: 'u1', displayName: 'Ada' },
      { id: 'u2', displayName: 'Grace' },
    ],
  },
  {
    id: 'sub-1',
    displayName: 'Garden Patch',
    color: '#66bb6a',
    type: 'Subspace',
    role: 'Lead',
    spaceUrl: '/garden/patch',
    leadUsers: [],
  },
];

const renderSection = (overrides: Partial<Parameters<typeof MembershipsSection>[0]> = {}) => {
  const props = {
    rows: ROWS,
    totalShown: ROWS.length,
    totalUnfiltered: ROWS.length,
    search: '',
    filter: 'all' as const,
    onSearchChange: vi.fn(),
    onFilterChange: vi.fn(),
    onClearFilters: vi.fn(),
    onLeave: vi.fn(),
    labels: buildLabels('organisation'),
    ...overrides,
  };
  render(<MembershipsSection {...props} />);
  return props;
};

describe('MembershipsSection', () => {
  it.each(['user', 'organisation'] as const)('renders every row with its role label (%s labels)', owner => {
    renderSection({ labels: buildLabels(owner) });

    expect(screen.getByText('Garden Space')).toBeInTheDocument();
    expect(screen.getByText('Garden Patch')).toBeInTheDocument();
    expect(screen.getByText(`${owner} role Member`)).toBeInTheDocument();
    expect(screen.getByText(`${owner} role Lead`)).toBeInTheDocument();
    expect(screen.getByText(`${owner}: showing 2 of 2`)).toBeInTheDocument();
  });

  it('names each Leave button after the row it acts on and links the name to the space', () => {
    renderSection();
    expect(screen.getByRole('button', { name: 'organisation: leave Garden Space' })).toHaveTextContent('Leave');
    expect(screen.getByRole('button', { name: 'organisation: leave Garden Patch' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Garden Patch' })).toHaveAttribute('href', '/garden/patch');
  });

  it('exposes the pressed state on the filter segments and reports a segment click', () => {
    const props = renderSection({ filter: 'spaces' });

    expect(screen.getByRole('button', { name: 'Spaces' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Subspaces' })).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(screen.getByRole('button', { name: 'Subspaces' }));
    expect(props.onFilterChange).toHaveBeenCalledWith('subspaces');
  });

  it('calls onLeave with the exact row from its Leave button and nothing else', async () => {
    const user = userEvent.setup();
    const props = renderSection();

    await user.click(screen.getByRole('button', { name: 'organisation: leave Garden Patch' }));

    expect(props.onLeave).toHaveBeenCalledTimes(1);
    expect(props.onLeave).toHaveBeenCalledWith(ROWS[1]);
    expect(props.onFilterChange).not.toHaveBeenCalled();
    expect(props.onSearchChange).not.toHaveBeenCalled();
    expect(props.onClearFilters).not.toHaveBeenCalled();
  });

  it('renders only the muted caption when there are no memberships at all', () => {
    renderSection({ rows: [], totalShown: 0, totalUnfiltered: 0 });

    expect(screen.getByText('organisation: no memberships yet')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByText(/showing/)).not.toBeInTheDocument();
    expect(screen.queryByText('Clear Filters')).not.toBeInTheDocument();
  });

  it('renders the filtered-empty block when filters match nothing, and its action clears them', () => {
    const props = renderSection({ rows: [], totalShown: 0, totalUnfiltered: 2 });

    expect(screen.getByText('organisation: nothing found')).toBeInTheDocument();
    expect(screen.queryByText('organisation: no memberships yet')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear Filters' }));
    expect(props.onClearFilters).toHaveBeenCalledTimes(1);
  });

  it('labels the "Led by" avatar group, and shows it only for rows with leads', () => {
    renderSection();

    expect(screen.getByRole('group', { name: '2 leads' })).toBeInTheDocument();
    expect(screen.getAllByText('Led by:')).toHaveLength(1);
  });

  it('reports search input changes', () => {
    const props = renderSection();
    fireEvent.change(screen.getByRole('textbox', { name: 'organisation: search' }), { target: { value: 'patch' } });
    expect(props.onSearchChange).toHaveBeenCalledWith('patch');
  });
});
