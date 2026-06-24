import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import type { SpaceCardData } from '@/crd/components/space/SpaceCard';
import { HubSpacesSection } from './HubSpacesSection';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

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

  test('a hub with exactly the batch size shows all cards and no Load more', () => {
    render(<HubSpacesSection spaces={makeSpaces(12)} hubName="VNG" />);
    expect(countCards()).toBe(12);
    expect(screen.queryByRole('button', { name: /loadMore/i })).not.toBeInTheDocument();
  });

  test('shows skeletons while loading with no spaces yet, and no search box', () => {
    render(<HubSpacesSection spaces={[]} hubName="VNG" spacesLoading={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(countCards()).toBe(0);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  test('empty hub shows the empty-hub message and no search box', () => {
    render(<HubSpacesSection spaces={[]} hubName="VNG" />);
    expect(screen.getByText('home.spacesSection.empty')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /loadMore/i })).not.toBeInTheDocument();
  });
});

describe('HubSpacesSection — search (US2)', () => {
  test('typing a term narrows the grid to matching Spaces', async () => {
    const user = userEvent.setup();
    const spaces = [
      makeSpace(1, { name: 'Climate Action' }),
      makeSpace(2, { name: 'Health Equity' }),
      makeSpace(3, { name: 'Climate Finance' }),
    ];
    render(<HubSpacesSection spaces={spaces} hubName="VNG" />);
    expect(countCards()).toBe(3);

    await user.type(screen.getByRole('textbox'), 'climate{enter}');
    expect(countCards()).toBe(2);
  });

  test('multi-term search is AND-combined across name/description/tags', async () => {
    const user = userEvent.setup();
    const spaces = [
      makeSpace(1, { name: 'Climate Action', tags: ['urban'] }),
      makeSpace(2, { name: 'Climate Finance', tags: ['rural'] }),
    ];
    render(<HubSpacesSection spaces={spaces} hubName="VNG" />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'climate{enter}');
    await user.type(input, 'urban{enter}');
    expect(countCards()).toBe(1);
    expect(screen.getByText('Climate Action')).toBeInTheDocument();
  });

  test('search resets the visible batch to the first batch', async () => {
    const user = userEvent.setup();
    // 20 spaces all match "space"; after loading more then searching, the count resets to 12.
    render(<HubSpacesSection spaces={makeSpaces(20)} hubName="VNG" />);
    await user.click(screen.getByRole('button', { name: /loadMore/i }));
    expect(countCards()).toBe(20);

    await user.type(screen.getByRole('textbox'), 'space{enter}');
    expect(countCards()).toBe(12);
    expect(screen.getByRole('button', { name: /loadMore/i })).toBeInTheDocument();
  });

  test('no-match search shows the no-results state with a Clear search button', async () => {
    const user = userEvent.setup();
    render(<HubSpacesSection spaces={makeSpaces(5)} hubName="VNG" />);

    await user.type(screen.getByRole('textbox'), 'zzz-nomatch{enter}');
    expect(countCards()).toBe(0);
    expect(screen.getByText('home.spacesSection.noResultsTitle')).toBeInTheDocument();
    const clear = screen.getByRole('button', { name: /clearSearch/i });
    expect(clear).toBeInTheDocument();

    await user.click(clear);
    expect(countCards()).toBe(5);
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
