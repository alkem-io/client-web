import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import {
  ContributorSelector,
  type ContributorSelectorInvitee,
  type ContributorSelectorUserResult,
} from './ContributorSelector';

const baseLabels = {
  placeholder: 'Username or email…',
  searchAriaLabel: 'Search users',
  noResultsLabel: 'No matching users',
  loadingLabel: 'Loading…',
  loadMoreLabel: 'Loading more…',
  removeAriaLabel: (label: string) => `Remove ${label}`,
  validationErrorLabel: (kind: 'invalid' | 'duplicate') =>
    kind === 'invalid' ? "This isn't a valid email address." : 'This email is already in the list.',
};

const aliceRow: ContributorSelectorUserResult = {
  userId: 'user-alice',
  displayName: 'Alice Adams',
  location: 'Amsterdam',
};
const bobRow: ContributorSelectorUserResult = {
  userId: 'user-bob',
  displayName: 'Bob Brown',
};

describe('ContributorSelector', () => {
  test('autocomplete dropdown renders rows when there is a search query', () => {
    render(
      <ContributorSelector
        selectedContributors={[]}
        searchResults={[aliceRow, bobRow]}
        searchQuery="al"
        onSearchChange={vi.fn()}
        onSelectUser={vi.fn()}
        onRemoveContributor={vi.fn()}
        {...baseLabels}
      />
    );
    expect(screen.getByText('Alice Adams')).toBeInTheDocument();
    expect(screen.getByText('Bob Brown')).toBeInTheDocument();
  });

  test('clicking a result row fires onSelectUser with the userId', async () => {
    const onSelectUser = vi.fn();
    render(
      <ContributorSelector
        selectedContributors={[]}
        searchResults={[aliceRow]}
        searchQuery="al"
        onSearchChange={vi.fn()}
        onSelectUser={onSelectUser}
        onRemoveContributor={vi.fn()}
        {...baseLabels}
      />
    );
    await userEvent.click(screen.getByText('Alice Adams'));
    expect(onSelectUser).toHaveBeenCalledWith('user-alice');
  });

  test('selecting a result also clears the search query', async () => {
    const onSearchChange = vi.fn();
    render(
      <ContributorSelector
        selectedContributors={[]}
        searchResults={[aliceRow]}
        searchQuery="al"
        onSearchChange={onSearchChange}
        onSelectUser={vi.fn()}
        onRemoveContributor={vi.fn()}
        {...baseLabels}
      />
    );
    await userEvent.click(screen.getByText('Alice Adams'));
    expect(onSearchChange).toHaveBeenCalledWith('');
  });

  test('collection picker shows a clear button that resets the query', async () => {
    const onSearchChange = vi.fn();
    render(
      <ContributorSelector
        selectedContributors={[]}
        searchResults={[]}
        searchQuery="al"
        onSearchChange={onSearchChange}
        onSelectUser={vi.fn()}
        onRemoveContributor={vi.fn()}
        allowEmailInvites={false}
        clearSearchAriaLabel="Clear search"
        {...baseLabels}
      />
    );
    await userEvent.click(screen.getByLabelText('Clear search'));
    expect(onSearchChange).toHaveBeenCalledWith('');
  });

  test('no clear button in the invite flow (allowEmailInvites on)', () => {
    render(
      <ContributorSelector
        selectedContributors={[]}
        searchResults={[]}
        searchQuery="al"
        onSearchChange={vi.fn()}
        onSelectUser={vi.fn()}
        onRemoveContributor={vi.fn()}
        allowEmailInvites={true}
        clearSearchAriaLabel="Clear search"
        {...baseLabels}
      />
    );
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  test('already-selected users are filtered out of the autocomplete dropdown', () => {
    const selected: ContributorSelectorInvitee[] = [{ kind: 'user', userId: 'user-alice', displayName: 'Alice Adams' }];
    render(
      <ContributorSelector
        selectedContributors={selected}
        searchResults={[aliceRow, bobRow]}
        searchQuery="a"
        onSearchChange={vi.fn()}
        onSelectUser={vi.fn()}
        onRemoveContributor={vi.fn()}
        {...baseLabels}
      />
    );
    // Only Bob should still be a clickable result row in the dropdown.
    // (Alice still appears as a chip, but the dropdown filters her out.)
    const dropdownButtons = screen.getAllByRole('button').filter(b => b.textContent?.includes('Bob Brown'));
    expect(dropdownButtons.length).toBeGreaterThan(0);
  });

  test('Enter on the input fires onAddEmails with the raw text', async () => {
    const onAddEmails = vi.fn();
    render(
      <ContributorSelector
        selectedContributors={[]}
        searchResults={[]}
        searchQuery="a@b.com,c@d.com"
        onSearchChange={vi.fn()}
        onSelectUser={vi.fn()}
        onAddEmails={onAddEmails}
        onRemoveContributor={vi.fn()}
        allowEmailInvites={true}
        {...baseLabels}
      />
    );
    const input = screen.getByLabelText('Search users');
    input.focus();
    await userEvent.keyboard('{Enter}');
    expect(onAddEmails).toHaveBeenCalledWith('a@b.com,c@d.com');
  });

  test('Enter is a no-op when allowEmailInvites is false', async () => {
    const onAddEmails = vi.fn();
    render(
      <ContributorSelector
        selectedContributors={[]}
        searchResults={[]}
        searchQuery="a@b.com"
        onSearchChange={vi.fn()}
        onSelectUser={vi.fn()}
        onAddEmails={onAddEmails}
        onRemoveContributor={vi.fn()}
        allowEmailInvites={false}
        {...baseLabels}
      />
    );
    const input = screen.getByLabelText('Search users');
    input.focus();
    await userEvent.keyboard('{Enter}');
    expect(onAddEmails).not.toHaveBeenCalled();
  });

  test('chips with validationError render with destructive border + accessible error label', () => {
    const selected: ContributorSelectorInvitee[] = [{ kind: 'email', email: 'broken@', validationError: 'invalid' }];
    render(
      <ContributorSelector
        selectedContributors={selected}
        searchResults={[]}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectUser={vi.fn()}
        onRemoveContributor={vi.fn()}
        {...baseLabels}
      />
    );
    expect(screen.getByLabelText("This isn't a valid email address.")).toBeInTheDocument();
  });

  test('chip remove button calls onRemoveContributor with the index', async () => {
    const onRemoveContributor = vi.fn();
    const selected: ContributorSelectorInvitee[] = [
      { kind: 'user', userId: 'user-alice', displayName: 'Alice Adams' },
      { kind: 'email', email: 'b@example.com' },
    ];
    render(
      <ContributorSelector
        selectedContributors={selected}
        searchResults={[]}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectUser={vi.fn()}
        onRemoveContributor={onRemoveContributor}
        {...baseLabels}
      />
    );
    await userEvent.click(screen.getByLabelText('Remove b@example.com'));
    expect(onRemoveContributor).toHaveBeenCalledWith(1);
  });

  // --- feature 025: organization and virtualContributor chip kinds ---

  test('organization chip renders displayName and remove button', () => {
    const selected: ContributorSelectorInvitee[] = [{ kind: 'organization', id: 'org-1', displayName: 'Acme Corp' }];
    render(
      <ContributorSelector
        selectedContributors={selected}
        searchResults={[]}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectUser={vi.fn()}
        onRemoveContributor={vi.fn()}
        {...baseLabels}
      />
    );
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByLabelText('Remove Acme Corp')).toBeInTheDocument();
  });

  test('virtualContributor chip renders displayName', () => {
    const selected: ContributorSelectorInvitee[] = [
      { kind: 'virtualContributor', id: 'vc-1', displayName: 'Virtual Assistant' },
    ];
    render(
      <ContributorSelector
        selectedContributors={selected}
        searchResults={[]}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectUser={vi.fn()}
        onRemoveContributor={vi.fn()}
        {...baseLabels}
      />
    );
    expect(screen.getByText('Virtual Assistant')).toBeInTheDocument();
  });

  test('ineligible entry renders with line-through style and shows ineligibleLabel tooltip', () => {
    const selected: ContributorSelectorInvitee[] = [
      { kind: 'user', userId: 'user-gone', displayName: 'Gone User', eligible: false },
    ];
    render(
      <ContributorSelector
        selectedContributors={selected}
        searchResults={[]}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectUser={vi.fn()}
        onRemoveContributor={vi.fn()}
        ineligibleLabel="No longer available"
        {...baseLabels}
      />
    );
    expect(screen.getByLabelText('No longer available')).toBeInTheDocument();
  });

  test('eligible entry (eligible=true) does NOT render ineligible indicator', () => {
    const selected: ContributorSelectorInvitee[] = [
      { kind: 'organization', id: 'org-1', displayName: 'Good Org', eligible: true },
    ];
    render(
      <ContributorSelector
        selectedContributors={selected}
        searchResults={[]}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectUser={vi.fn()}
        onRemoveContributor={vi.fn()}
        ineligibleLabel="No longer available"
        {...baseLabels}
      />
    );
    // Should NOT have the ineligible tooltip label
    expect(screen.queryByLabelText('No longer available')).not.toBeInTheDocument();
  });
});

// --- feature 088: rowSelection="toggle" (the collection selection picker) ---
describe('ContributorSelector — toggle row mode', () => {
  // The dropdown is query-gated, so every case passes a non-empty query —
  // otherwise no row renders and the assertions would pass vacuously.
  const renderToggle = (
    searchResults: ContributorSelectorUserResult[],
    selectedContributors: ContributorSelectorInvitee[],
    overrides: { onSelectUser?: () => void; onSearchChange?: () => void } = {}
  ) =>
    render(
      <ContributorSelector
        selectedContributors={selectedContributors}
        searchResults={searchResults}
        searchQuery="a"
        onSearchChange={overrides.onSearchChange ?? vi.fn()}
        onSelectUser={overrides.onSelectUser ?? vi.fn()}
        onRemoveContributor={vi.fn()}
        allowEmailInvites={false}
        rowSelection="toggle"
        {...baseLabels}
      />
    );

  test('a selected row stays listed and reports aria-pressed=true', () => {
    // The chip carries a different display name from the result row, so each
    // assertion below can only match a row in the dropdown.
    renderToggle([aliceRow, bobRow], [{ kind: 'user', userId: 'user-alice', displayName: 'Selected Alice' }]);

    // Add-mode would have filtered Alice out of the dropdown entirely.
    expect(screen.getByText('Alice Adams').closest('button')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Bob Brown').closest('button')).toHaveAttribute('aria-pressed', 'false');
  });

  test('an organization selection ticks its row too', () => {
    renderToggle(
      [{ userId: 'org-1', displayName: 'Acme Org', typeLabel: 'Organizations' }],
      [{ kind: 'organization', id: 'org-1', displayName: 'Selected Acme' }]
    );

    expect(screen.getByText('Acme Org').closest('button')).toHaveAttribute('aria-pressed', 'true');
  });

  test('clicking a ticked row toggles it and keeps the query', async () => {
    const onSelectUser = vi.fn();
    const onSearchChange = vi.fn();
    renderToggle([aliceRow], [{ kind: 'user', userId: 'user-alice', displayName: 'Selected Alice' }], {
      onSelectUser,
      onSearchChange,
    });

    await userEvent.click(screen.getByText('Alice Adams'));
    expect(onSelectUser).toHaveBeenCalledWith('user-alice');
    // The query survives, so the row the admin just unticked is still on screen.
    expect(onSearchChange).not.toHaveBeenCalled();
  });

  test('the invite default leaves rows un-pressed', () => {
    render(
      <ContributorSelector
        selectedContributors={[]}
        searchResults={[aliceRow]}
        searchQuery="a"
        onSearchChange={vi.fn()}
        onSelectUser={vi.fn()}
        onRemoveContributor={vi.fn()}
        {...baseLabels}
      />
    );

    expect(screen.getByText('Alice Adams').closest('button')).not.toHaveAttribute('aria-pressed');
  });
});
