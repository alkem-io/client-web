import { render, screen } from '@testing-library/react';
import i18next from 'i18next';
import type { ReactElement } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { beforeAll, describe, expect, test } from 'vitest';
import spaceEnJson from '@/crd/i18n/space/space.en.json';
import { ContributorCard, type ContributorCardData } from './ContributorCard';

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

const renderCard = (ui: ReactElement) => render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);

const baseCard: ContributorCardData = {
  id: 'user-ada',
  type: 'user',
  name: 'Ada',
  hasValidCoordinates: false,
};

describe('ContributorCard — rows and layout (US1)', () => {
  test('a fully described user shows tagline, tags, location', () => {
    renderCard(
      <ContributorCard
        contributor={{
          ...baseCard,
          tagline: 'Urban planner who loves a good map.',
          tags: ['Urban Planning', 'Sustainability'],
          locationLabel: 'Barcelona, ES',
        }}
      />
    );

    expect(screen.getByText('Urban planner who loves a good map.')).toBeInTheDocument();
    expect(screen.getByText('Urban Planning')).toBeInTheDocument();
    expect(screen.getByText('Sustainability')).toBeInTheDocument();
    expect(screen.getByText('Barcelona, ES')).toBeInTheDocument();
  });

  test('a user with an empty tagline shows the italic fallback text', () => {
    renderCard(<ContributorCard contributor={{ ...baseCard }} />);

    expect(screen.getByText('User has not filled in their tagline.')).toBeInTheDocument();
  });

  test('an organization with an empty tagline shows no text row and no fallback', () => {
    renderCard(<ContributorCard contributor={{ ...baseCard, type: 'organization', name: 'Bare Org' }} />);

    expect(screen.queryByText('User has not filled in their tagline.')).not.toBeInTheDocument();
  });

  test('a virtual contributor with an empty tagline shows no text row and no fallback', () => {
    renderCard(<ContributorCard contributor={{ ...baseCard, type: 'virtualContributor', name: 'Quiet VC' }} />);

    expect(screen.queryByText('User has not filled in their tagline.')).not.toBeInTheDocument();
  });

  test('three tags render exactly two pills — never a "+N" indicator', () => {
    renderCard(<ContributorCard contributor={{ ...baseCard, tags: ['Policy', 'Energy', 'Water'] }} />);

    expect(screen.getByText('Policy')).toBeInTheDocument();
    expect(screen.getByText('Energy')).toBeInTheDocument();
    expect(screen.queryByText('Water')).not.toBeInTheDocument();
    expect(screen.queryByText(/^\+\d/)).not.toBeInTheDocument();
  });

  test('a tag pill carries its full text as a title (tooltip) for a cut label', () => {
    renderCard(<ContributorCard contributor={{ ...baseCard, tags: ['Policy'] }} />);

    expect(screen.getByText('Policy')).toHaveAttribute('title', 'Policy');
  });

  test('a virtual contributor never renders a location row, even when locationLabel is passed', () => {
    renderCard(
      <ContributorCard
        contributor={{ ...baseCard, type: 'virtualContributor', name: 'Helper VC', locationLabel: 'Berlin, DE' }}
      />
    );

    expect(screen.queryByText('Berlin, DE')).not.toBeInTheDocument();
  });

  test('associatesCount: 0 renders "0 associates in this organization"', () => {
    renderCard(<ContributorCard contributor={{ ...baseCard, type: 'organization', associatesCount: 0 }} />);

    expect(screen.getByText('0 associates in this organization')).toBeInTheDocument();
  });

  test('associatesCount: 1 uses the singular form', () => {
    renderCard(<ContributorCard contributor={{ ...baseCard, type: 'organization', associatesCount: 1 }} />);

    expect(screen.getByText('1 associate in this organization')).toBeInTheDocument();
  });

  test('associatesCount: 3 uses the plural form', () => {
    renderCard(<ContributorCard contributor={{ ...baseCard, type: 'organization', associatesCount: 3 }} />);

    expect(screen.getByText('3 associates in this organization')).toBeInTheDocument();
  });

  test('users never render the associates line, even if associatesCount is passed', () => {
    renderCard(<ContributorCard contributor={{ ...baseCard, associatesCount: 3 }} />);

    expect(screen.queryByText(/associates? in this organization/)).not.toBeInTheDocument();
  });

  test('virtual contributors never render the associates line, even if associatesCount is passed', () => {
    renderCard(<ContributorCard contributor={{ ...baseCard, type: 'virtualContributor', associatesCount: 3 }} />);

    expect(screen.queryByText(/associates? in this organization/)).not.toBeInTheDocument();
  });
});

describe('ContributorCard — one profile link per card (US1/US2)', () => {
  test('a card with an href exposes exactly one link, named after the contributor', () => {
    renderCard(<ContributorCard contributor={{ ...baseCard, href: 'https://alkemio.test/ada' }} />);

    const links = screen.getAllByRole('link', { name: 'Ada' });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', 'https://alkemio.test/ada');
  });

  test('a card with no href renders no link at all', () => {
    renderCard(<ContributorCard contributor={{ ...baseCard }} />);

    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });
});

describe('ContributorCard — the all-absent card is still a valid card (US2)', () => {
  const enrichedNeighbor: ContributorCardData = {
    id: 'user-fully-enriched',
    type: 'user',
    name: 'Fully Enriched',
    hasValidCoordinates: false,
    tagline: 'Everything filled in.',
    tags: ['Policy', 'Energy'],
    locationLabel: 'Berlin, DE',
  };

  test.each<ContributorCardData['type']>([
    'user',
    'organization',
    'virtualContributor',
  ])('a %s card with only pre-existing fields renders no empty rows and never "undefined"/"null"/"Invalid Date"', type => {
    const { container } = renderCard(
      <>
        <ContributorCard contributor={{ ...baseCard, type, name: `Bare ${type}` }} />
        <ContributorCard contributor={enrichedNeighbor} />
      </>
    );

    expect(container.textContent).not.toMatch(/undefined|null|Invalid Date|NaN/i);
    // Only the user type gets the italic fallback row; org/VC get none.
    const fallbackCount = screen.queryAllByText('User has not filled in their tagline.').length;
    expect(fallbackCount).toBe(type === 'user' ? 1 : 0);
    expect(screen.queryByText(/associates? in this organization/)).not.toBeInTheDocument();
  });

  test('tags: undefined and tags: [] render identically (no tag row either way)', () => {
    const { container: withUndefined } = renderCard(<ContributorCard contributor={{ ...baseCard, tags: undefined }} />);
    const undefinedHtml = withUndefined.innerHTML;

    withUndefined.remove();

    const { container: withEmpty } = renderCard(<ContributorCard contributor={{ ...baseCard, tags: [] }} />);
    expect(withEmpty.innerHTML).toBe(undefinedHtml);
  });
});
