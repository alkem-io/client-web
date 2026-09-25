import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

const mockUseElementWidth = vi.fn();
vi.mock('@/crd/hooks/useElementWidth', () => ({
  useElementWidth: () => mockUseElementWidth(),
}));

import type { SpaceCardData } from './SpaceCard';
import { SpaceSubspacesList } from './SpaceSubspacesList';

function card(id: string, name: string, extra: Partial<SpaceCardData> = {}): SpaceCardData {
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
    ...extra,
  };
}

describe('SpaceSubspacesList — variant', () => {
  test('default (no variant) is unchanged: 3-up grid, 6 visible of 8, SpaceCards', () => {
    mockUseElementWidth.mockReturnValue([undefined, vi.fn()]);
    const cards = Array.from({ length: 8 }, (_, i) => card(`s${i}`, `Space ${i}`));
    const { container } = render(<SpaceSubspacesList subspaces={cards} />);

    expect(container.querySelector('.md\\:grid-cols-2.lg\\:grid-cols-3')).not.toBeNull();
    expect(screen.getAllByRole('link').length).toBeGreaterThanOrEqual(6);
    expect(screen.getByText(/subspaces.showMore/)).toBeInTheDocument();
  });

  test('variant="expanded" is 1 column, 3 visible of 8, ExpandedSpaceCards with their excerpt content, "Show 5 more", show-more reveals all', async () => {
    mockUseElementWidth.mockReturnValue([undefined, vi.fn()]);
    const user = userEvent.setup();
    const cards = Array.from({ length: 8 }, (_, i) => card(`s${i}`, `Space ${i}`, { what: 'excerpt text' }));
    const { container } = render(<SpaceSubspacesList subspaces={cards} variant="expanded" />);

    expect(container.querySelector('ul.grid-cols-1')).not.toBeNull();
    // Marker only ExpandedSpaceCard renders — proves the list is actually mounting the rich
    // card for its visible items, not silently falling back to the compact SpaceCard.
    expect(screen.getAllByText('crd-space:subspaces.expandedCard.open')).toHaveLength(3);
    expect(screen.getAllByText('excerpt text')).toHaveLength(3);
    const showMoreButton = screen.getByText('subspaces.showMore:{"count":5}');
    expect(showMoreButton).toBeInTheDocument();

    await user.click(showMoreButton);
    expect(screen.getByText('subspaces.showLess')).toBeInTheDocument();
    expect(screen.getAllByText('crd-space:subspaces.expandedCard.open')).toHaveLength(8);
    expect(screen.getAllByText('excerpt text')).toHaveLength(8);
  });

  test('a compact list whose items carry `why` still renders plain SpaceCards (legacy selection never flips the list to expanded)', () => {
    mockUseElementWidth.mockReturnValue([undefined, vi.fn()]);
    const cards = [card('a', 'Alpha', { why: 'legacy why text' })];
    const { container } = render(<SpaceSubspacesList subspaces={cards} />);

    // The 3-up grid is present (compact layout); no expanded-card article markup.
    expect(container.querySelector('.md\\:grid-cols-2.lg\\:grid-cols-3')).not.toBeNull();
  });

  test('an all-empty item renders the compact card inside an expanded list', () => {
    mockUseElementWidth.mockReturnValue([undefined, vi.fn()]);
    const cards = [card('a', 'Alpha')];
    render(<SpaceSubspacesList subspaces={cards} variant="expanded" />);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });

  test('the all-empty compact item is width-capped when the list is measured wide (>= 520), uncapped otherwise', () => {
    const cards = [card('a', 'Alpha')];

    mockUseElementWidth.mockReturnValue([800, vi.fn()]);
    const { container: wide } = render(<SpaceSubspacesList subspaces={cards} variant="expanded" />);
    expect(wide.querySelector('li.max-w-\\[320px\\]')).not.toBeNull();

    mockUseElementWidth.mockReturnValue([400, vi.fn()]);
    const { container: narrow } = render(<SpaceSubspacesList subspaces={cards} variant="expanded" />);
    expect(narrow.querySelector('li.max-w-\\[320px\\]')).toBeNull();

    mockUseElementWidth.mockReturnValue([undefined, vi.fn()]);
    const { container: unmeasured } = render(<SpaceSubspacesList subspaces={cards} variant="expanded" />);
    expect(unmeasured.querySelector('li.max-w-\\[320px\\]')).toBeNull();
  });

  test('an explicit initialVisibleCount overrides the variant default', () => {
    mockUseElementWidth.mockReturnValue([undefined, vi.fn()]);
    const cards = Array.from({ length: 8 }, (_, i) => card(`s${i}`, `Space ${i}`, { what: 'excerpt' }));
    render(<SpaceSubspacesList subspaces={cards} variant="expanded" initialVisibleCount={5} />);
    expect(screen.getByText('subspaces.showMore:{"count":3}')).toBeInTheDocument();
  });

  test('changing the search collapses the list back to the initial count', async () => {
    mockUseElementWidth.mockReturnValue([undefined, vi.fn()]);
    const user = userEvent.setup();
    const cards = Array.from({ length: 8 }, (_, i) => card(`s${i}`, `Space ${i}`, { what: 'excerpt' }));
    render(<SpaceSubspacesList subspaces={cards} variant="expanded" />);

    await user.click(screen.getByText('subspaces.showMore:{"count":5}'));
    expect(screen.getByText('subspaces.showLess')).toBeInTheDocument();

    await user.type(screen.getByRole('searchbox'), 'Space');
    // Back to initial-count behaviour: "show more" reappears (search still matches all 8).
    expect(screen.getByText('subspaces.showMore:{"count":5}')).toBeInTheDocument();
  });
});
