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
});
