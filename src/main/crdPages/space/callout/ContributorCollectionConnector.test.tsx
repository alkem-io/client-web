import { render, screen } from '@testing-library/react';
import { enUS, nl } from 'date-fns/locale';
import i18next from 'i18next';
import type { ReactElement } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { beforeAll, describe, expect, test, vi } from 'vitest';
import spaceEnJson from '@/crd/i18n/space/space.en.json';

const mockNavigate = vi.fn();
vi.mock('@/core/routing/useNavigate', () => ({ default: () => mockNavigate }));

// A mutable box so each test can flip the resolved date-fns locale without
// re-mocking the module — the connector reads it fresh on every render.
let mockLocale = enUS;
vi.mock('@/main/crdPages/space/hooks/useCrdSpaceLocale', () => ({
  useCrdSpaceLocale: () => mockLocale,
}));

// One card whose only new value is the raw joinedDate — proves the connector
// decorates at render (joinedMonthLabel), never stores a formatted string.
const cardModel = {
  id: 'user-ada',
  type: 'user' as const,
  name: 'Ada',
  hasValidCoordinates: false,
  joinedDate: '2023-10-01T00:00:00.000Z',
};

const mockGetCards = vi.fn(() => [cardModel]);
vi.mock('@/main/crdPages/space/hooks/useCrdSpaceContributors', () => ({
  useCrdSpaceContributors: () => ({
    types: ['user'],
    defaultType: 'user',
    defaultView: 'list',
    fixedView: null,
    counts: { users: 1, organizations: 0, virtualContributors: 0 },
    getCards: mockGetCards,
    ensureLoaded: vi.fn(),
    isLoading: () => false,
    loading: false,
    isCustomSelection: false,
  }),
}));

import { ContributorCollectionConnector } from './ContributorCollectionConnector';

const i18n = i18next.createInstance();

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['crd-space'],
    defaultNS: 'crd-space',
    resources: { en: { 'crd-space': spaceEnJson } },
    interpolation: { escapeValue: false },
  });
});

const renderConnector = (ui: ReactElement) => render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);

describe('ContributorCollectionConnector — join-month decoration at render (US4, isolated block)', () => {
  test('renders "Joined this space Oct 2023" for a user with a joinedDate', () => {
    mockLocale = enUS;
    renderConnector(<ContributorCollectionConnector calloutId="callout-1" />);

    expect(screen.getByText('Joined this space Oct 2023')).toBeInTheDocument();
  });

  test('a live language switch re-labels the card without a new fetch', () => {
    mockLocale = enUS;
    const { rerender } = renderConnector(<ContributorCollectionConnector calloutId="callout-1" />);
    expect(screen.getByText('Joined this space Oct 2023')).toBeInTheDocument();

    // Only the resolved date-fns locale changes — the underlying card model
    // (and its raw joinedDate) is untouched, exactly as it would be after a
    // language switch with no refetch of the contributor list.
    mockLocale = nl;
    rerender(
      <I18nextProvider i18n={i18n}>
        <ContributorCollectionConnector calloutId="callout-1" />
      </I18nextProvider>
    );

    // The month abbreviation is now Dutch — proving the label is re-derived
    // at render from the same underlying model, not cached from first render.
    expect(screen.getByText(/Joined this space okt/i)).toBeInTheDocument();
  });
});
