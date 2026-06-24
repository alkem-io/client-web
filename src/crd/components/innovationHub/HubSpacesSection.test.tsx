import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { SpaceCardData } from '@/crd/components/space/SpaceCard';
import { snapToFullRows } from '@/crd/hooks/useGridColumnCount';
import { HubSpacesSection } from './HubSpacesSection';

// Force a specific grid column count for tests that exercise full-row snapping.
// Defaults to 1 (matching jsdom, where ResizeObserver is unavailable), so the
// existing batch tests behave as before. The real `snapToFullRows` is preserved.
let mockColumnCount = 1;
vi.mock('@/crd/hooks/useGridColumnCount', async importActual => {
  const actual = await importActual<typeof import('@/crd/hooks/useGridColumnCount')>();
  return { ...actual, useGridColumnCount: () => [mockColumnCount, () => {}] };
});
afterEach(() => {
  mockColumnCount = 1;
});

// The real `t` interpolates {{visible}}/{{total}} into the showingCount string.
// We can't see the translated copy here, so the mock appends the interpolation
// values to the key, letting tests assert on the actual numbers the component
// passed (e.g. "home.spacesSection.showingCount visible=12 total=25").
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (!options) return key;
      const params = Object.entries(options)
        .map(([name, value]) => `${name}=${String(value)}`)
        .join(' ');
      return params ? `${key} ${params}` : key;
    },
  }),
}));

// Reads the "Showing X of Y" results counter and returns [visible, total].
const showingCount = (): [number, number] => {
  const node = screen.getByText(/home\.spacesSection\.showingCount/);
  const text = node.textContent ?? '';
  const visible = Number(/visible=(\d+)/.exec(text)?.[1]);
  const total = Number(/total=(\d+)/.exec(text)?.[1]);
  return [visible, total];
};

const makeSpace = (n: number, overrides: Partial<SpaceCardData> = {}): SpaceCardData => ({
  id: `space-${n}`,
  name: `Space ${n}`,
  description: `Description ${n}`,
  initials: `S${n}`,
  avatarColor: '#42a5f5',
  isPrivate: false,
  tags: [],
  leads: [],
  href: `/space-${n}`,
  ...overrides,
});

const makeSpaces = (count: number) => Array.from({ length: count }, (_, i) => makeSpace(i + 1));

// The cards grid is the `<ul>` labelled with the spaces label. Scope counting to
// its direct `<li>` children so nested tag `<li>`s inside SpaceCard are excluded.
const countCards = () => {
  const grid = screen.queryByRole('list', { name: 'home.spacesSection.spacesLabel' });
  if (!grid) return 0;
  return Array.from(grid.children).filter(child => child.tagName === 'LI').length;
};

describe('HubSpacesSection — smaller cards + lazy load (US1)', () => {
  test('renders only the first batch (12) and a Load more control for a 25-Space hub', () => {
    render(<HubSpacesSection spaces={makeSpaces(25)} hubName="VNG" />);
    expect(countCards()).toBe(12);
    expect(screen.getByRole('button', { name: /loadMore/i })).toBeInTheDocument();
  });

  test('Load more appends the next batch, then hides when exhausted', async () => {
    const user = userEvent.setup();
    render(<HubSpacesSection spaces={makeSpaces(25)} hubName="VNG" />);

    await user.click(screen.getByRole('button', { name: /loadMore/i }));
    expect(countCards()).toBe(24);

    await user.click(screen.getByRole('button', { name: /loadMore/i }));
    expect(countCards()).toBe(25);
    expect(screen.queryByRole('button', { name: /loadMore/i })).not.toBeInTheDocument();
  });

  test('Load more reveals a new full row even when the grid is wider than a batch', async () => {
    // columnCount (13) > BATCH_SIZE (12): the first batch snaps to one full row
    // (13). A naive `+ BATCH_SIZE` would snap back to 13, revealing nothing — the
    // fix advances past the current row, so each click must grow the visible set.
    mockColumnCount = 13;
    const user = userEvent.setup();
    render(<HubSpacesSection spaces={makeSpaces(40)} hubName="VNG" />);

    expect(countCards()).toBe(13);
    await user.click(screen.getByRole('button', { name: /loadMore/i }));
    expect(countCards()).toBeGreaterThan(13);
  });

  test('the results counter shows the visible batch out of the filtered total', () => {
    render(<HubSpacesSection spaces={makeSpaces(25)} hubName="VNG" />);
    // 12 rendered out of 25 filtered → "Showing 12 of 25".
    expect(countCards()).toBe(12);
    expect(showingCount()).toEqual([12, 25]);
  });

  test('after loading everything the counter shows total of total', async () => {
    const user = userEvent.setup();
    render(<HubSpacesSection spaces={makeSpaces(25)} hubName="VNG" />);
    expect(showingCount()).toEqual([12, 25]);

    await user.click(screen.getByRole('button', { name: /loadMore/i }));
    await user.click(screen.getByRole('button', { name: /loadMore/i }));

    expect(countCards()).toBe(25);
    expect(showingCount()).toEqual([25, 25]);
  });

  test('a hub with exactly the batch size shows all cards and no Load more', () => {
    render(<HubSpacesSection spaces={makeSpaces(12)} hubName="VNG" />);
    expect(countCards()).toBe(12);
    expect(screen.queryByRole('button', { name: /loadMore/i })).not.toBeInTheDocument();
  });

  test('shows skeletons while loading with no spaces yet, and no search box', () => {
    render(<HubSpacesSection spaces={[]} hubName="VNG" spacesLoading={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(countCards()).toBe(0);
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  test('empty hub shows the empty-hub message and no search box', () => {
    render(<HubSpacesSection spaces={[]} hubName="VNG" />);
    expect(screen.getByText('home.spacesSection.empty')).toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /loadMore/i })).not.toBeInTheDocument();
  });
});

describe('HubSpacesSection — search (US2)', () => {
  test('typing a term filters the grid live, without needing Enter', async () => {
    const user = userEvent.setup();
    const spaces = [
      makeSpace(1, { name: 'Climate Action' }),
      makeSpace(2, { name: 'Health Equity' }),
      makeSpace(3, { name: 'Climate Finance' }),
    ];
    render(<HubSpacesSection spaces={spaces} hubName="VNG" />);
    expect(countCards()).toBe(3);

    // No {enter} — filtering must recompute on each keystroke.
    await user.type(screen.getByRole('searchbox'), 'climate');
    expect(countCards()).toBe(2);
  });

  test('search matches across name, description, and tags', async () => {
    const user = userEvent.setup();
    const spaces = [
      makeSpace(1, { name: 'Climate Action', tags: ['urban'] }),
      makeSpace(2, { name: 'Climate Finance', tags: ['rural'] }),
    ];
    render(<HubSpacesSection spaces={spaces} hubName="VNG" />);

    await user.type(screen.getByRole('searchbox'), 'urban');
    expect(countCards()).toBe(1);
    expect(screen.getByText('Climate Action')).toBeInTheDocument();
  });

  test('search resets the visible batch to the first batch', async () => {
    const user = userEvent.setup();
    // 20 spaces all match "space"; after loading more then searching, the count resets to 12.
    render(<HubSpacesSection spaces={makeSpaces(20)} hubName="VNG" />);
    await user.click(screen.getByRole('button', { name: /loadMore/i }));
    expect(countCards()).toBe(20);

    await user.type(screen.getByRole('searchbox'), 'space');
    expect(countCards()).toBe(12);
    expect(screen.getByRole('button', { name: /loadMore/i })).toBeInTheDocument();
  });

  test('no-match search shows the no-results state with a Clear search button', async () => {
    const user = userEvent.setup();
    render(<HubSpacesSection spaces={makeSpaces(5)} hubName="VNG" />);

    await user.type(screen.getByRole('searchbox'), 'zzz-nomatch');
    expect(countCards()).toBe(0);
    expect(screen.getByText('home.spacesSection.noResultsTitle')).toBeInTheDocument();
    // Both the inline (input) clear button and the no-results clear button share
    // the same label; the empty-state one is the second.
    const clearButtons = screen.getAllByRole('button', { name: /clearSearch/i });
    expect(clearButtons.length).toBeGreaterThanOrEqual(1);

    await user.click(clearButtons[clearButtons.length - 1]);
    expect(countCards()).toBe(5);
  });

  test('the results counter total reflects the filtered set, not the hub total', async () => {
    const user = userEvent.setup();
    // 25 spaces; "Space 1" matches Space 1 plus Space 10-19 → 11 of 11 filtered.
    render(<HubSpacesSection spaces={makeSpaces(25)} hubName="VNG" />);
    expect(showingCount()).toEqual([12, 25]);

    await user.type(screen.getByRole('searchbox'), 'Space 1');
    expect(countCards()).toBe(11);
    // Total is the filtered count (11), not the hub total (25).
    expect(showingCount()).toEqual([11, 11]);
  });

  test('the inline clear button empties the query and restores all Spaces', async () => {
    const user = userEvent.setup();
    render(<HubSpacesSection spaces={makeSpaces(5)} hubName="VNG" />);

    await user.type(screen.getByRole('searchbox'), 'Space 1');
    expect(countCards()).toBe(1);

    await user.click(screen.getByRole('button', { name: /clearSearch/i }));
    expect(countCards()).toBe(5);
    expect(screen.getByRole('searchbox')).toHaveValue('');
  });
});

describe('HubSpacesSection — privacy filter (Public / Private)', () => {
  const openFilters = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('button', { name: 'home.spacesSection.filters' }));
  };

  const selectOption = async (user: ReturnType<typeof userEvent.setup>, name: string) => {
    await user.click(await screen.findByRole('menuitemcheckbox', { name }));
  };

  test('selecting "Public only" shows only public spaces', async () => {
    const user = userEvent.setup();
    const spaces = [
      makeSpace(1, { isPrivate: false }),
      makeSpace(2, { isPrivate: true }),
      makeSpace(3, { isPrivate: false }),
    ];
    render(<HubSpacesSection spaces={spaces} hubName="VNG" />);
    expect(countCards()).toBe(3);

    await openFilters(user);
    await selectOption(user, 'home.spacesSection.filterPublicOnly');
    expect(countCards()).toBe(2);
  });

  test('selecting "Private only" shows only private spaces', async () => {
    const user = userEvent.setup();
    const spaces = [
      makeSpace(1, { isPrivate: false }),
      makeSpace(2, { isPrivate: true }),
      makeSpace(3, { isPrivate: false }),
    ];
    render(<HubSpacesSection spaces={spaces} hubName="VNG" />);

    await openFilters(user);
    await selectOption(user, 'home.spacesSection.filterPrivateOnly');
    expect(countCards()).toBe(1);
  });

  test('clearing the filter chip restores all spaces', async () => {
    const user = userEvent.setup();
    const spaces = [makeSpace(1, { isPrivate: false }), makeSpace(2, { isPrivate: true })];
    render(<HubSpacesSection spaces={spaces} hubName="VNG" />);

    await openFilters(user);
    await selectOption(user, 'home.spacesSection.filterPrivateOnly');
    expect(countCards()).toBe(1);

    // The removable filter chip carries the sr-only "remove filter" text.
    await user.click(screen.getByRole('button', { name: /removeFilter/i }));
    expect(countCards()).toBe(2);
  });

  test('privacy filter and search combine', async () => {
    const user = userEvent.setup();
    const spaces = [
      makeSpace(1, { name: 'Climate Action', isPrivate: false }),
      makeSpace(2, { name: 'Climate Finance', isPrivate: true }),
      makeSpace(3, { name: 'Health Equity', isPrivate: false }),
    ];
    render(<HubSpacesSection spaces={spaces} hubName="VNG" />);

    await user.type(screen.getByRole('searchbox'), 'climate');
    expect(countCards()).toBe(2);

    await openFilters(user);
    await selectOption(user, 'home.spacesSection.filterPublicOnly');
    // Only "Climate Action" is both public AND matches "climate".
    expect(countCards()).toBe(1);
    expect(screen.getByText('Climate Action')).toBeInTheDocument();
  });

  test('changing the filter resets the visible batch to the first batch', async () => {
    const user = userEvent.setup();
    // 20 public spaces; load more then apply a (matching) public filter → resets to 12.
    render(<HubSpacesSection spaces={makeSpaces(20)} hubName="VNG" />);
    await user.click(screen.getByRole('button', { name: /loadMore/i }));
    expect(countCards()).toBe(20);

    await openFilters(user);
    await selectOption(user, 'home.spacesSection.filterPublicOnly');
    expect(countCards()).toBe(12);
    expect(screen.getByRole('button', { name: /loadMore/i })).toBeInTheDocument();
  });

  test('no-match privacy filter shows the no-results state, and Clear resets it', async () => {
    const user = userEvent.setup();
    // All public; filtering to Private yields nothing.
    render(<HubSpacesSection spaces={makeSpaces(5)} hubName="VNG" />);

    await openFilters(user);
    await selectOption(user, 'home.spacesSection.filterPrivateOnly');
    expect(countCards()).toBe(0);
    expect(screen.getByText('home.spacesSection.noResultsTitle')).toBeInTheDocument();

    // The no-results reset clears all filters (here a privacy filter, no search),
    // so it must use the "clear all filters" label — not the search-only one.
    await user.click(screen.getByRole('button', { name: /clearFilters/i }));
    expect(countCards()).toBe(5);
  });
});

describe('snapToFullRows — largest multiple ≤ visibleCount', () => {
  test('snaps to whole rows while more cards remain to load', () => {
    // 5 columns, want 12 visible, 25 total → largest multiple of 5 ≤ 12 = 10.
    expect(snapToFullRows(12, 25, 5)).toBe(10);
    // 3 columns, want 12, 25 total → 12 is already a multiple of 3.
    expect(snapToFullRows(12, 25, 3)).toBe(12);
    // 4 columns, want 14, 25 total → largest multiple of 4 ≤ 14 = 12.
    expect(snapToFullRows(14, 25, 4)).toBe(12);
  });

  test('shows everything (incl. the final partial row) once it all fits', () => {
    // 5 columns, want 24 visible, only 22 total → all 22, partial last row allowed.
    expect(snapToFullRows(24, 22, 5)).toBe(22);
    expect(snapToFullRows(100, 7, 4)).toBe(7);
  });

  test('never collapses below one full row when that many cards exist', () => {
    // 5 columns, want 4 visible, 25 total → still show one full row of 5.
    expect(snapToFullRows(4, 25, 5)).toBe(5);
    // Fewer cards than a row → show them all.
    expect(snapToFullRows(4, 3, 5)).toBe(3);
  });

  test('single column is a passthrough (no snapping possible)', () => {
    expect(snapToFullRows(7, 25, 1)).toBe(7);
    expect(snapToFullRows(30, 25, 1)).toBe(25);
  });
});

describe('HubSpacesSection — curation & order preserved (US3)', () => {
  test('renders Spaces in input order and never surfaces a Space outside the input set', () => {
    const spaces = [makeSpace(3), makeSpace(1), makeSpace(2)];
    render(<HubSpacesSection spaces={spaces} hubName="VNG" />);
    const grid = screen.getByRole('list', { name: 'home.spacesSection.spacesLabel' });
    const items = Array.from(grid.children).filter(child => child.tagName === 'LI') as HTMLElement[];
    expect(items).toHaveLength(3);
    const heading = (li: HTMLElement) => within(li).getByText(/^Space \d$/).textContent;
    expect([heading(items[0]), heading(items[1]), heading(items[2])]).toEqual(['Space 3', 'Space 1', 'Space 2']);
  });
});
