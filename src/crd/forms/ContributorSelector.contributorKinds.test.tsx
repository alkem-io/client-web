import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import {
  ContributorSelector,
  type ContributorSelectorInvitee,
  type ContributorSelectorUserResult,
} from './ContributorSelector';

// The result dropdown is query-gated (`showResults = trimmedQuery.length > 0`),
// so every case here passes a non-empty `searchQuery` — otherwise no row renders
// and an assertion over result rows would pass vacuously.
const baseLabels = {
  placeholder: 'Search…',
  searchAriaLabel: 'Search contributors',
  noResultsLabel: 'No matches',
  loadingLabel: 'Loading…',
  loadMoreLabel: 'Loading more…',
  removeAriaLabel: (label: string) => `Remove ${label}`,
  validationErrorLabel: () => '',
};

const renderPicker = (
  searchResults: ContributorSelectorUserResult[],
  selectedContributors: ContributorSelectorInvitee[] = []
) =>
  render(
    <ContributorSelector
      selectedContributors={selectedContributors}
      searchResults={searchResults}
      searchQuery="a"
      onSearchChange={vi.fn()}
      onSelectUser={vi.fn()}
      onRemoveContributor={vi.fn()}
      {...baseLabels}
    />
  );

describe('ContributorSelector — contributor-type indication', () => {
  test('renders a result row’s typeLabel', () => {
    renderPicker([{ userId: 'org-1', displayName: 'Acme Org', typeLabel: 'Organizations' }]);

    expect(screen.getByText('Organizations')).toBeInTheDocument();
  });

  test('renders each row’s own typeLabel', () => {
    renderPicker([
      { userId: 'user-1', displayName: 'Alice Adams', typeLabel: 'People' },
      { userId: 'org-1', displayName: 'Acme Org', typeLabel: 'Organizations' },
    ]);

    expect(screen.getByText('Alice Adams').closest('button')).toHaveTextContent('People');
    expect(screen.getByText('Acme Org').closest('button')).toHaveTextContent('Organizations');
  });

  test('a result without a typeLabel keeps today’s row shape', () => {
    renderPicker([{ userId: 'user-1', displayName: 'Bob Brown' }]);

    // Avatar initials + display name, and nothing else — a consumer that omits
    // the optional field must not get a stray node (FR-010).
    expect(screen.getByText('Bob Brown').closest('button')).toHaveTextContent(/^BBBob Brown$/);
  });

  test('the already-selected filter stays user-only (spec D8)', () => {
    // Chips carry different display names from the results so each assertion
    // can only match a result row.
    renderPicker(
      [
        { userId: 'user-alice', displayName: 'Alice Adams' },
        { userId: 'org-1', displayName: 'Acme Org' },
      ],
      [
        { kind: 'user', userId: 'user-alice', displayName: 'Selected Alice' },
        { kind: 'organization', id: 'org-1', displayName: 'Selected Acme' },
      ]
    );

    expect(screen.queryByText('Alice Adams')).not.toBeInTheDocument();
    // De-duplicating non-user kinds is the consumer's job, not this component's.
    expect(screen.getByText('Acme Org')).toBeInTheDocument();
  });
});
