/**
 * ContributorCollection — unit specs for feature 025 filter-gate changes (T008/T009).
 *
 * T008 (US4-AS1/AS2/AS3): The segmented type switch is gated on ≥2 resolved
 * (non-zero count) types, not on the configured `types` array length.
 *
 * T009 (US4-AS4): When the caller-supplied `activeType` resolves to zero,
 * the component falls back to the first resolved non-empty type (read-time only).
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { ContributorMapFixedView } from '@/crd/components/map/ContributorMap';
import type { ContributorCardData } from './ContributorCard';
import type { ContributorCollectionCounts } from './ContributorCollection';
import { ContributorCollection } from './ContributorCollection';

// Echo i18n keys so assertions don't depend on translated strings.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

// Stub the lazy ContributorMap so Suspense never blocks assertions.
vi.mock('@/crd/components/map/ContributorMap', () => ({
  default: () => <div data-testid="contributor-map" />,
}));

function makeCounts(users: number, organizations: number, virtualContributors: number): ContributorCollectionCounts {
  return { users, organizations, virtualContributors };
}

function makeCard(id: string, name: string): ContributorCardData {
  return {
    id,
    type: 'user',
    name,
    hasValidCoordinates: false,
  };
}

const noop = () => {};

describe('ContributorCollection — T008 resolved-count filter gate (US4)', () => {
  test('US4-AS1: hides the type switch when only ONE resolved type has data, even if config lists multiple', () => {
    // Config: three types; only "user" resolves to a non-zero count.
    render(
      <ContributorCollection
        types={['user', 'organization', 'virtualContributor']}
        activeType="user"
        onActiveTypeChange={noop}
        defaultView="list"
        counts={makeCounts(5, 0, 0)}
        cards={[makeCard('u1', 'Alice')]}
        loading={false}
      />
    );

    // The Tabs/type switch should not be present when only 1 type has data.
    // The segments are rendered as tab triggers; "People" / "Organizations" / "VCs"
    // resolve to i18n keys: contributors.types.user / .organization / .virtualContributor
    expect(screen.queryByText('contributors.types.organization')).not.toBeInTheDocument();
    expect(screen.queryByText('contributors.types.virtualContributor')).not.toBeInTheDocument();
    // The sole resolved type's label is NOT in the switch (switch is hidden entirely).
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  test('US4-AS2: hides the type switch when NO resolved type has data (all counts zero)', () => {
    render(
      <ContributorCollection
        types={['user', 'organization']}
        activeType="user"
        onActiveTypeChange={noop}
        defaultView="list"
        counts={makeCounts(0, 0, 0)}
        cards={[]}
        loading={false}
      />
    );

    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  test('US4-AS3: shows the type switch with only the resolved (non-zero) segments when ≥2 types have data', () => {
    // Config: three types; two have data (user + organization), VC is zero.
    render(
      <ContributorCollection
        types={['user', 'organization', 'virtualContributor']}
        activeType="user"
        onActiveTypeChange={noop}
        defaultView="list"
        counts={makeCounts(3, 2, 0)}
        cards={[makeCard('u1', 'Alice')]}
        loading={false}
      />
    );

    // Tabs are present for user and organization.
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(2);

    // Count badge labels include the count value.
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // VC segment is not rendered (zero count).
    expect(screen.queryByText('contributors.types.virtualContributor')).not.toBeInTheDocument();
  });

  test('US4-AS3 alt: all three types resolved shows all three segments', () => {
    render(
      <ContributorCollection
        types={['user', 'organization', 'virtualContributor']}
        activeType="user"
        onActiveTypeChange={noop}
        defaultView="list"
        counts={makeCounts(4, 1, 2)}
        cards={[makeCard('u1', 'Alice')]}
        loading={false}
      />
    );

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(3);
  });
});

describe('ContributorCollection — T009 default-segment fallback (US4-AS4)', () => {
  test('falls back to first resolved type when activeType has zero count', () => {
    // activeType=organization has 0 count; fallback should be "user" (first in types array with > 0).
    render(
      <ContributorCollection
        types={['user', 'organization', 'virtualContributor']}
        activeType="organization"
        onActiveTypeChange={noop}
        defaultView="list"
        counts={makeCounts(5, 0, 3)}
        cards={[makeCard('u1', 'Alice')]}
        loading={false}
      />
    );

    // The Tabs value should reflect the fallback type (user).
    // Since both user (5) and virtualContributor (3) are non-zero, we have ≥2 resolved types — tabs show.
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(2); // user + virtualContributor (organization is zero, hidden)

    // The "user" tab should be selected (aria-selected="true") because it is the fallback.
    const userTab = screen.getByText('contributors.types.user').closest('[role="tab"]');
    expect(userTab).toHaveAttribute('data-state', 'active');
  });

  test('no fallback when activeType has non-zero count — stays on the configured type', () => {
    render(
      <ContributorCollection
        types={['user', 'organization', 'virtualContributor']}
        activeType="organization"
        onActiveTypeChange={noop}
        defaultView="list"
        counts={makeCounts(5, 2, 3)}
        cards={[makeCard('o1', 'Acme Corp')]}
        loading={false}
      />
    );

    const orgTab = screen.getByText('contributors.types.organization').closest('[role="tab"]');
    expect(orgTab).toHaveAttribute('data-state', 'active');
  });

  test('falls back to first non-zero type in types-array order when activeType is zero', () => {
    // Types configured as [virtualContributor, user]; activeType=virtualContributor has 0.
    // Fallback should be "user" (first in types array with count > 0).
    render(
      <ContributorCollection
        types={['virtualContributor', 'user']}
        activeType="virtualContributor"
        onActiveTypeChange={noop}
        defaultView="list"
        counts={makeCounts(4, 0, 0)}
        cards={[makeCard('u1', 'Alice')]}
        loading={false}
      />
    );

    // Only "user" has count > 0, so only 1 resolved type — switch is hidden.
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();

    // The count line should display for the resolved user type (effectiveActiveType = user).
    // i18n key: contributors.counts.users with { count: 4 }
    expect(screen.getByText('contributors.counts.users:{"count":4}')).toBeInTheDocument();
  });
});

// fixedView orthogonality assertions

const FIXED_VIEW: ContributorMapFixedView = { longitude: 4.9, latitude: 52.37, zoom: 10 };

describe('ContributorCollection — fixedView orthogonality', () => {
  test('cards rendered are identical whether fixedView is set or absent', () => {
    const cards = [makeCard('u1', 'Alice'), makeCard('u2', 'Bob')];
    const counts = makeCounts(2, 0, 0);

    const { unmount } = render(
      <ContributorCollection
        types={['user']}
        activeType="user"
        onActiveTypeChange={noop}
        defaultView="list"
        counts={counts}
        cards={cards}
        loading={false}
      />
    );
    const namesWithout = screen.getAllByText(/Alice|Bob/).map(el => el.textContent);
    unmount();

    render(
      <ContributorCollection
        types={['user']}
        activeType="user"
        onActiveTypeChange={noop}
        defaultView="list"
        fixedView={FIXED_VIEW}
        counts={counts}
        cards={cards}
        loading={false}
      />
    );
    const namesWith = screen.getAllByText(/Alice|Bob/).map(el => el.textContent);

    expect(namesWith).toEqual(namesWithout);
  });

  test('fixedView absent means no fixedView set on the component (automatic framing — list mode smoke)', () => {
    // Smoke: the component renders correctly with no fixedView prop in list mode.
    render(
      <ContributorCollection
        types={['user']}
        activeType="user"
        onActiveTypeChange={noop}
        defaultView="list"
        counts={makeCounts(1, 0, 0)}
        cards={[makeCard('u1', 'Alice')]}
        loading={false}
      />
    );
    // Alice's card is visible — rendering succeeds with no fixedView (automatic path).
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  test('list view renders normally when fixedView is set (map not mounted in list mode)', () => {
    render(
      <ContributorCollection
        types={['user']}
        activeType="user"
        onActiveTypeChange={noop}
        defaultView="list"
        fixedView={FIXED_VIEW}
        counts={makeCounts(2, 0, 0)}
        cards={[makeCard('u1', 'Alice'), makeCard('u2', 'Bob')]}
        loading={false}
      />
    );
    // Cards are rendered in list mode.
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    // Map is not mounted in list mode.
    expect(screen.queryByTestId('contributor-map')).not.toBeInTheDocument();
  });
});
