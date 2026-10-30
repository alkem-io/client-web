import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import commonEn from '@/crd/i18n/common/common.en.json';
import exploreSpacesEn from '@/crd/i18n/exploreSpaces/exploreSpaces.en.json';
import type { SpaceCardData } from './SpaceCard';
import { SpaceExplorer, type SpaceExplorerProps } from './SpaceExplorer';

const i18n = createInstance();

beforeAll(async () => {
  await i18n.init({
    lng: 'en',
    resources: { en: { 'crd-exploreSpaces': exploreSpacesEn, 'crd-common': commonEn } },
    interpolation: { escapeValue: false },
  });
});

const space = (id: string, isPrivate = false): SpaceCardData => ({
  id,
  name: `Space ${id}`,
  description: '',
  initials: 'S',
  avatarColor: '#000',
  isPrivate,
  tags: [],
  leads: [],
  href: `/${id}`,
});

const renderExplorer = (overrides: Partial<SpaceExplorerProps> = {}) => {
  const props: SpaceExplorerProps = {
    spaces: [space('a'), space('b', true)],
    loading: false,
    searchTerms: [],
    membershipFilter: 'all',
    authenticated: true,
    typeFilter: 'all',
    privacyFilter: 'all',
    onSearchTermsChange: vi.fn(),
    onMembershipFilterChange: vi.fn(),
    onTypeFilterChange: vi.fn(),
    onPrivacyFilterChange: vi.fn(),
    onLoadMore: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  const view = render(
    <I18nextProvider i18n={i18n}>
      <SpaceExplorer {...props} />
    </I18nextProvider>
  );
  return { ...view, props };
};

const openFilters = () => {
  fireEvent.click(screen.getByRole('button', { name: /filters/i }));
  return screen.getByRole('menu');
};

const options = (menu: HTMLElement) =>
  within(menu)
    .getAllByRole('menuitemcheckbox')
    .map(item => item.textContent);

describe('SpaceExplorer filters (spec 039 explore-filters-and-count)', () => {
  it('offers Public once, under Privacy', () => {
    renderExplorer();

    expect(options(openFilters())).toEqual([
      'All',
      'My Spaces',
      'All',
      'Public only',
      'Private only',
      'All types',
      'Spaces only',
      'Subspaces only',
    ]);
  });

  it('does not show the Membership section to guests', () => {
    renderExplorer({ authenticated: false });

    const menu = openFilters();
    expect(within(menu).queryByText('Membership')).not.toBeInTheDocument();
    expect(options(menu)).toEqual(['All', 'Public only', 'Private only', 'All types', 'Spaces only', 'Subspaces only']);
  });

  it('shows the Type it is given as active, and reports a new choice instead of filtering itself', () => {
    const { props } = renderExplorer({ typeFilter: 'spaces' });

    expect(screen.getByRole('button', { name: /spaces only/i })).toBeInTheDocument();
    const menu = openFilters();
    expect(within(menu).getByRole('menuitemcheckbox', { name: 'Spaces only' })).toBeChecked();

    fireEvent.click(within(menu).getByRole('menuitemcheckbox', { name: 'Subspaces only' }));
    expect(props.onTypeFilterChange).toHaveBeenCalledWith('subspaces');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('counts My Spaces like any other filter and shows a chip for it (#9493)', () => {
    const { props } = renderExplorer({ membershipFilter: 'member', typeFilter: 'spaces' });

    expect(screen.getByRole('button', { name: /filters/i })).toHaveTextContent('2');
    fireEvent.click(screen.getByRole('button', { name: /my spaces/i }));
    expect(props.onMembershipFilterChange).toHaveBeenCalledWith('all');
  });

  it('clears every filter to All', () => {
    const { props } = renderExplorer({ typeFilter: 'spaces', privacyFilter: 'private' });

    fireEvent.click(within(openFilters()).getByRole('button', { name: /clear all filters/i }));

    expect(props.onTypeFilterChange).toHaveBeenCalledWith('all');
    expect(props.onPrivacyFilterChange).toHaveBeenCalledWith('all');
    expect(props.onMembershipFilterChange).toHaveBeenCalledWith('all');
  });
});

describe('SpaceExplorer results line (spec 039 explore-filters-and-count)', () => {
  it('shows no count and no results line without a search term', () => {
    renderExplorer();

    expect(screen.queryByText(/showing/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/spaces matching/i)).not.toBeInTheDocument();
  });

  it('shows no count when only filters are applied', () => {
    renderExplorer({ spaces: [space('a')], privacyFilter: 'public' });

    // The Filters button's badge counts active filters; no element states how many spaces are listed.
    expect(screen.queryByText(/showing/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/spaces matching/i)).not.toBeInTheDocument();
  });

  it('names the search terms, without a number', () => {
    renderExplorer({ searchTerms: ['energie', 'water'] });

    expect(screen.getByText('Spaces matching “energie, water”')).toBeInTheDocument();
  });
});

describe('SpaceExplorer grid columns (spec 039 explore-filters-and-count FR-EX-7)', () => {
  it('reports how many cards its grid fits per row', () => {
    // jsdom has no layout or ResizeObserver: observe() reports at once, and the computed track list is stubbed.
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(private readonly callback: () => void) {}
        observe() {
          this.callback();
        }
        disconnect() {}
      }
    );
    const computed = vi
      .spyOn(window, 'getComputedStyle')
      .mockReturnValue({ gridTemplateColumns: '280px 280px 280px 280px 280px' } as CSSStyleDeclaration);
    const onColumnsChange = vi.fn();

    renderExplorer({ onColumnsChange });

    expect(onColumnsChange).toHaveBeenCalledWith(5);
    computed.mockRestore();
    vi.unstubAllGlobals();
  });
});

describe('SpaceExplorer Load more (spec 039 explore-filters-and-count FR-EX-7)', () => {
  it('keeps Load more instead of "No spaces found" while more may exist but nothing matched yet', () => {
    renderExplorer({ spaces: [], hasMore: true, privacyFilter: 'private' });

    expect(screen.getByRole('button', { name: /load more/i })).toBeInTheDocument();
    expect(screen.queryByText('No spaces found')).not.toBeInTheDocument();
  });

  it('shows "No spaces found" once nothing more can be loaded', () => {
    renderExplorer({ spaces: [], hasMore: false, privacyFilter: 'private' });

    expect(screen.getByText('No spaces found')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
  });

  it('stays, busy, while its own batch is loading', async () => {
    let finish: () => void = () => {};
    const onLoadMore = vi.fn(() => new Promise<void>(resolve => (finish = resolve)));
    const { rerender, props } = renderExplorer({ hasMore: true, onLoadMore });

    fireEvent.click(screen.getByRole('button', { name: /load more/i }));
    // The hook reports loading while it fetches pages for the batch.
    rerender(
      <I18nextProvider i18n={i18n}>
        <SpaceExplorer {...props} loading={true} />
      </I18nextProvider>
    );

    const button = screen.getByRole('button', { name: /load more/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    await act(async () => finish());
    rerender(
      <I18nextProvider i18n={i18n}>
        <SpaceExplorer {...props} />
      </I18nextProvider>
    );
    expect(screen.getByRole('button', { name: /load more/i })).not.toBeDisabled();
  });
});
