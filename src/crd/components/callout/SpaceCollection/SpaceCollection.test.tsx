import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import type { SpaceCardData } from '@/crd/components/space/SpaceCard';
import { SpaceCollection } from './SpaceCollection';

// The reused SpaceSubspacesList (+ its children) resolve strings via
// useTranslation('crd-space'); echo the key so search/empty-state UI is testable.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

function card(id: string, name: string): SpaceCardData {
  return {
    id,
    name,
    description: '',
    initials: name.slice(0, 2),
    avatarColor: '#000000',
    isPrivate: false,
    tags: [],
    leads: [],
    href: `/s/${id}`,
  };
}

describe('SpaceCollection (feature 013 renderer)', () => {
  test('renders each subspace as a card (reuses SpaceCard, unchanged)', () => {
    render(<SpaceCollection subspaces={[card('a', 'Alpha'), card('b', 'Beta')]} />);

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  test('filters cards on name search (client-side, over the fetched set)', async () => {
    const user = userEvent.setup();
    render(<SpaceCollection subspaces={[card('a', 'Alpha'), card('b', 'Beta')]} />);

    const search = screen.getByRole('searchbox');
    await user.type(search, 'Alph');

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.queryByText('Beta')).not.toBeInTheDocument();
  });

  test('shows an empty state (not an error) when there are no subspaces', () => {
    render(<SpaceCollection subspaces={[]} />);

    // SpaceSubspacesList's EmptyState renders the `subspaces.empty.*` keys.
    expect(screen.getByText('subspaces.empty.title')).toBeInTheDocument();
  });

  test('invokes onSubspaceClick when a card is activated', async () => {
    const user = userEvent.setup();
    const onSubspaceClick = vi.fn();
    render(<SpaceCollection subspaces={[card('a', 'Alpha')]} onSubspaceClick={onSubspaceClick} />);

    await user.click(screen.getByText('Alpha'));

    expect(onSubspaceClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'a' }));
  });
});
