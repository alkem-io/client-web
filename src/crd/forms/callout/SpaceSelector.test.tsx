import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { SpaceSelector, type SpaceSelectorItem } from './SpaceSelector';

/**
 * The structural claims a screenshot cannot make (feature 084, T108): what each
 * row's sub-line says, which badge sits on which row, that the host row is
 * present but unpickable, that an id with no candidate entry is named rather
 * than printed as a uuid, and — the assertion that is RED against any
 * implementation still waiting for a query — that the list is complete and
 * path-ordered the moment the picker opens (ruling D2 / DEV-3).
 *
 * The component derives nothing about spaces: `inHostTree`, `hasNameClash` and
 * the readable `ancestorPath` arrive as plain values from the consumer's hook
 * (spec FR-012b), so the tests feed them in directly.
 */

const copy = {
  searchPlaceholder: 'Search spaces in this account…',
  searchAriaLabel: 'Search spaces in this account',
  clearSearchAriaLabel: 'Clear search',
  loadingLabel: 'Loading…',
  noMatchesLabel: 'No spaces in this account match your search.',
  accountEmptyLabel: 'This account has no other spaces yet.',
  loadFailedLabel: 'The list of spaces could not be loaded.',
  chipsEmptyLabel: 'No spaces picked yet.',
  unresolvedLabel: 'No longer available',
  chipContextLabel: (parentName: string) => `in ${parentName}`,
  inThisSpaceLabel: 'In this space',
  calloutIsHereLabel: 'Callout is here',
  pathLabel: (level: string, path: string) => `${level} in ${path}`,
  removeAriaLabel: (name: string) => `Remove ${name}`,
  selectedCountLabel: (count: number) => (count === 0 ? 'No spaces selected' : `${count} spaces selected`),
  clearSelectionLabel: 'Clear selection',
};

/**
 * One account, in the order the hook hands it over (ancestor path, then name).
 * `cop-bikes` models the hidden-ancestor case: its own L0 is unreadable, so the
 * chain stops at the innermost readable ancestor and carries no placeholder.
 */
const items: SpaceSelectorItem[] = [
  {
    id: 'energy',
    depth: 0,
    displayName: 'Energy Transition',
    levelLabel: 'Space',
    ancestorPath: [],
    isHost: true,
    inHostTree: false,
    hasNameClash: false,
  },
  {
    id: 'heat',
    depth: 1,
    displayName: 'Heat networks',
    levelLabel: 'Subspace',
    ancestorPath: ['Energy Transition'],
    isHost: false,
    inHostTree: true,
    hasNameClash: false,
  },
  {
    id: 'cop-heat',
    depth: 2,
    displayName: 'Community of practice',
    levelLabel: 'Sub-subspace',
    ancestorPath: ['Energy Transition', 'Heat networks'],
    isHost: false,
    inHostTree: true,
    hasNameClash: true,
  },
  {
    id: 'mobility',
    depth: 0,
    displayName: 'Mobility Lab',
    levelLabel: 'Space',
    ancestorPath: [],
    isHost: false,
    inHostTree: false,
    hasNameClash: false,
  },
  {
    id: 'cop-bikes',
    depth: 2,
    displayName: 'Community of practice',
    levelLabel: 'Sub-subspace',
    ancestorPath: ['Shared bikes'],
    isHost: false,
    inHostTree: false,
    hasNameClash: true,
  },
];

const renderPicker = (overrides: Partial<React.ComponentProps<typeof SpaceSelector>> = {}) =>
  render(
    <SpaceSelector
      items={items}
      selectedIds={[]}
      onToggle={vi.fn()}
      onClearSelection={vi.fn()}
      {...copy}
      {...overrides}
    />
  );

/** The list rows, in DOM order — a chip's remove button is not one. */
const rows = () =>
  screen
    .getAllByRole('button')
    .filter(button => button.querySelector('[data-slot="avatar"]') && !button.hasAttribute('data-chip-remove'));

const rowNames = () => rows().map(button => button.textContent ?? '');

/** The one row carrying `text` as a whole line (a name also appears on a chip). */
const row = (text: string) => {
  const match = rows().filter(button =>
    Array.from(button.querySelectorAll('span')).some(element => element.textContent === text)
  );
  expect(match).toHaveLength(1);
  return match[0];
};

describe('SpaceSelector — the list', () => {
  test('lists the WHOLE candidate set, in the given path order, with no query typed', () => {
    renderPicker();

    // RED against any implementation that waits for a search term (ruling D2 /
    // DEV-3 — the replacement for the cut browse mode), and against one that
    // re-sorts: the hook's path ordering is the only ordering authority.
    const names = rowNames();
    expect(names).toHaveLength(items.length);
    expect(names[0]).toContain('Energy Transition');
    expect(names[1]).toContain('Heat networks');
    expect(names[2]).toContain('Sub-subspace in Energy Transition › Heat networks');
    expect(names[3]).toContain('Mobility Lab');
    expect(names[4]).toContain('Sub-subspace in Shared bikes');

    // Nothing is highlighted while there is no query, so no rendered row's name
    // is wrapped in a mark.
    expect(document.querySelectorAll('mark')).toHaveLength(0);
  });

  // Depth markers: one dash per level below the top, so a row states its own
  // level even when no ancestor of it is on screen — the case a search for
  // sub-subspaces produces, where indentation would say nothing (or, normalised
  // against the shallowest visible row, would imply a parent that is not there).
  test('marks depth with one dash per level below the top, and none on a Space', () => {
    renderPicker();

    const dashes = (name: string) => row(name).querySelectorAll('[aria-hidden="true"] span').length;

    expect(dashes('Energy Transition')).toBe(0);
    expect(dashes('Heat networks')).toBe(1);
    expect(dashes('Sub-subspace in Energy Transition › Heat networks')).toBe(2);
    expect(dashes('Mobility Lab')).toBe(0);
  });

  // The discriminating case for depth being its own field. `cop-bikes` is a
  // Sub-subspace whose level-zero ancestor is unreadable, so its readable chain
  // has ONE element. Deriving the markers from `ancestorPath.length` would show
  // a single dash next to the words "Sub-subspace".
  test('marks TRUE depth, not the length of the readable ancestor chain', () => {
    renderPicker();

    const bikes = row('Sub-subspace in Shared bikes');
    expect(bikes.querySelectorAll('[aria-hidden="true"] span')).toHaveLength(2);
    expect(bikes.textContent).toContain('Sub-subspace');
  });

  // A search returning only sub-subspaces: every row still carries two dashes,
  // so depth survives with no parent on screen.
  test('keeps depth legible when a filtered set contains no shallower row', async () => {
    renderPicker();
    await userEvent.type(screen.getByLabelText(copy.searchAriaLabel), 'community');

    const names = rowNames();
    expect(names).toHaveLength(2);
    for (const name of ['Sub-subspace in Energy Transition › Heat networks', 'Sub-subspace in Shared bikes']) {
      expect(row(name).querySelectorAll('[aria-hidden="true"] span')).toHaveLength(2);
    }
  });

  test('renders each row sub-line as "<level> in <path>", and the level alone at the top level', () => {
    renderPicker();

    expect(screen.getByText('Subspace in Energy Transition')).toBeInTheDocument();
    expect(screen.getByText('Sub-subspace in Energy Transition › Heat networks')).toBeInTheDocument();
    // Two L0s, each with no ancestors: the level label stands alone.
    expect(screen.getAllByText('Space')).toHaveLength(2);
  });

  test('renders only the READABLE ancestor chain, with no placeholder for a hidden one', () => {
    renderPicker();

    // `cop-bikes` sits under an unreadable L0; the sub-line stops at the
    // readable ancestor and never hints that another one exists (contract S3).
    expect(screen.getByText('Sub-subspace in Shared bikes')).toBeInTheDocument();
    expect(screen.queryByText(/Sub-subspace in .*›.*Shared bikes/)).toBeNull();
    expect(screen.queryByText(/…|\.\.\./)).toBeNull();
  });

  // The host used to be listed-but-disabled, with the badge explaining why it
  // could not be picked. It is now SELECTABLE like any other candidate
  // (operator request 2026-10-15): a collection meaning "our related
  // initiatives" may legitimately include the space you are standing in, and
  // the server always accepted the id — the write guard scopes to the host's
  // ACCOUNT, and a space belongs to its own account. The badge stays, now as
  // pure orientation.
  test('shows the host row badged AND selectable, reporting its pressed state', async () => {
    const onToggle = vi.fn();
    renderPicker({ onToggle });

    const hostRow = row('Energy Transition');
    expect(hostRow).not.toBeDisabled();
    expect(hostRow).toContainElement(screen.getByText('Callout is here'));
    expect(hostRow).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(hostRow);
    expect(onToggle).toHaveBeenCalledWith('energy');
  });

  test('ticks the host row when it is in the selection, like any other row', () => {
    renderPicker({ selectedIds: ['energy'] });

    expect(row('Energy Transition')).toHaveAttribute('aria-pressed', 'true');
  });

  test('badges exactly the rows the model marks as being in the host tree', () => {
    renderPicker();

    const badges = screen.getAllByText('In this space');
    expect(badges).toHaveLength(2);
    expect(row('Heat networks')).toContainElement(badges[0]);
    // A sibling L0's subspace is not in the host tree, so it carries no badge.
    expect(row('Mobility Lab').textContent).not.toContain('In this space');
    expect(row('Sub-subspace in Shared bikes').textContent).not.toContain('In this space');
  });

  test('ticks a selected row and reports it pressed', () => {
    renderPicker({ selectedIds: ['mobility'] });

    expect(row('Mobility Lab')).toHaveAttribute('aria-pressed', 'true');
    expect(row('Heat networks')).toHaveAttribute('aria-pressed', 'false');
  });

  test('toggles a row through the callback instead of deciding anything itself', async () => {
    const onToggle = vi.fn();
    renderPicker({ onToggle });

    await userEvent.click(row('Mobility Lab'));
    expect(onToggle).toHaveBeenCalledWith('mobility');
  });
});

describe('SpaceSelector — searching', () => {
  test('filters to the matches and marks the matched substring, leaving other names unmarked', async () => {
    renderPicker();

    await userEvent.type(screen.getByLabelText(copy.searchAriaLabel), 'mobility');

    expect(rowNames()).toHaveLength(1);
    const marks = document.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0].textContent).toBe('Mobility');
  });

  test('Escape clears the query back to the unfiltered list', async () => {
    renderPicker();
    const input = screen.getByLabelText(copy.searchAriaLabel);

    await userEvent.type(input, 'mobility');
    expect(rowNames()).toHaveLength(1);

    await userEvent.type(input, '{Escape}');
    expect(input).toHaveValue('');
    expect(rowNames()).toHaveLength(items.length);
  });

  // RED without `event.stopPropagation()` in handleKeyDown. Radix's dismiss
  // handler listens on `document`, so a query-clearing Escape that keeps
  // bubbling also closes the callout editor and raises "Discard your changes?"
  // over an unsaved selection. Found by the 084 acceptance walk, not by review.
  test('Escape that clears the query does not reach a document-level dismiss handler', async () => {
    const documentEscapes: string[] = [];
    const listener = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') documentEscapes.push('escape');
    };
    document.addEventListener('keydown', listener);

    try {
      renderPicker();
      const input = screen.getByLabelText(copy.searchAriaLabel);

      await userEvent.type(input, 'mobility');
      await userEvent.type(input, '{Escape}');
      expect(input).toHaveValue('');
      expect(documentEscapes).toHaveLength(0);

      // With an empty query the key is deliberately left alone, so the dialog
      // can still be dismissed by it.
      await userEvent.type(input, '{Escape}');
      expect(documentEscapes).toHaveLength(1);
    } finally {
      document.removeEventListener('keydown', listener);
    }
  });

  test('the clear affordance is hidden while the query is empty', async () => {
    renderPicker();
    expect(screen.queryByLabelText('Clear search')).toBeNull();

    await userEvent.type(screen.getByLabelText(copy.searchAriaLabel), 'heat');
    await userEvent.click(screen.getByLabelText('Clear search'));

    expect(rowNames()).toHaveLength(items.length);
  });
});

describe('SpaceSelector — the three non-list states', () => {
  test('no candidate matches the query', async () => {
    renderPicker();

    await userEvent.type(screen.getByLabelText(copy.searchAriaLabel), 'zzz');

    expect(screen.getByText(copy.noMatchesLabel)).toBeInTheDocument();
    expect(rowNames()).toHaveLength(0);
  });

  // Was "the account holds no space other than the host" and asserted the empty
  // state. Now that the host is selectable, a host-only account is NOT empty —
  // it offers exactly one pickable row, and claiming emptiness over a row the
  // user can click would be the defect.
  test('a host-only account offers the host, not the empty state', () => {
    renderPicker({ items: [items[0]] });

    expect(screen.queryByText(copy.accountEmptyLabel)).toBeNull();
    expect(rowNames()).toHaveLength(1);
    expect(row('Energy Transition')).not.toBeDisabled();
  });

  test('the empty state is for a genuinely empty candidate set', () => {
    renderPicker({ items: [] });

    expect(screen.getByText(copy.accountEmptyLabel)).toBeInTheDocument();
  });

  test('a failed load says the list could not be LOADED, never that the account is empty', () => {
    renderPicker({ items: [], loadFailed: true });

    expect(screen.getByText(copy.loadFailedLabel)).toBeInTheDocument();
    expect(screen.queryByText(copy.accountEmptyLabel)).toBeNull();
    expect(screen.queryByText(copy.noMatchesLabel)).toBeNull();
  });
});

describe('SpaceSelector — the chips', () => {
  test('shows the empty line when nothing is selected', () => {
    renderPicker();
    expect(screen.getByText(copy.chipsEmptyLabel)).toBeInTheDocument();
  });

  test('adds the parent context ONLY to a chip whose name clashes with another candidate', () => {
    renderPicker({ selectedIds: ['cop-heat', 'heat'] });

    expect(screen.getByText('in Heat networks')).toBeInTheDocument();
    expect(screen.queryByText('in Energy Transition')).toBeNull();
  });

  test('names a selected id that has no candidate entry, and never prints the raw id', () => {
    renderPicker({ selectedIds: ['heat', '1a2b3c-departed'] });

    expect(screen.getByText(copy.unresolvedLabel)).toBeInTheDocument();
    expect(screen.queryByText('1a2b3c-departed')).toBeNull();
    // It is removable by the explicit affordance — that one click is the whole
    // recovery path now that the client-side strip is deleted (FR-014, R-I).
    expect(screen.getByLabelText(`Remove ${copy.unresolvedLabel}`)).toBeInTheDocument();
  });

  test('does NOT call a selected id unavailable while the candidate set is still loading', () => {
    renderPicker({ items: [], loading: true, selectedIds: ['heat', 'mobility'] });

    // RED against reading `byId` without `loading`: a cold cache would report
    // the admin's whole curated selection as gone for the round trip (FR-026).
    expect(screen.queryByText(copy.unresolvedLabel)).toBeNull();
    expect(screen.queryByLabelText(`Remove ${copy.unresolvedLabel}`)).toBeNull();
    expect(screen.getByText('2 spaces selected')).toBeInTheDocument();
  });

  test('removing a chip reports the id and moves focus to the neighbouring chip', async () => {
    function Harness() {
      const [selectedIds, setSelectedIds] = useState(['heat', 'mobility']);
      return (
        <SpaceSelector
          items={items}
          selectedIds={selectedIds}
          onToggle={id => setSelectedIds(current => current.filter(entry => entry !== id))}
          onClearSelection={() => setSelectedIds([])}
          {...copy}
        />
      );
    }
    render(<Harness />);

    await userEvent.click(screen.getByLabelText('Remove Heat networks'));

    const remaining = screen.getByLabelText('Remove Mobility Lab');
    expect(remaining).toHaveFocus();
  });
});

describe('SpaceSelector — the footer', () => {
  test('counts the selection in a polite live region and hides the clear action when empty', () => {
    renderPicker();

    const count = screen.getByText('No spaces selected');
    expect(count).toHaveAttribute('aria-live', 'polite');
    expect(screen.queryByText(copy.clearSelectionLabel)).toBeNull();
  });

  test('shows the count and the clear action once something is selected', async () => {
    const onClearSelection = vi.fn();
    renderPicker({ selectedIds: ['heat', 'mobility'], onClearSelection });

    expect(screen.getByText('2 spaces selected')).toHaveAttribute('aria-live', 'polite');
    await userEvent.click(screen.getByText(copy.clearSelectionLabel));
    expect(onClearSelection).toHaveBeenCalled();
  });
});
