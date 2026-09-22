import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18next from 'i18next';
import type { ReactElement } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { beforeAll, describe, expect, test, vi } from 'vitest';
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

describe('ContributorCard — organisation website control (US5)', () => {
  const org: ContributorCardData = {
    id: 'org-green-future',
    type: 'organization',
    name: 'Green Future Labs',
    hasValidCoordinates: false,
    href: 'https://alkemio.test/green-future-labs',
    websiteUrl: 'https://greenfuture.example',
  };

  test('an organization with a website shows the control, opening a new tab with no window.opener access', () => {
    renderCard(<ContributorCard contributor={org} />);

    const link = screen.getByRole('link', { name: 'Visit the website of Green Future Labs (opens in a new tab)' });
    expect(link).toHaveAttribute('href', 'https://greenfuture.example');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  test('the control is absent when websiteUrl is undefined', () => {
    renderCard(<ContributorCard contributor={{ ...org, websiteUrl: undefined }} />);

    expect(
      screen.queryByRole('link', { name: 'Visit the website of Green Future Labs (opens in a new tab)' })
    ).not.toBeInTheDocument();
  });

  test('the control never appears for a user or a virtual contributor, even if websiteUrl is passed', () => {
    renderCard(
      <>
        <ContributorCard contributor={{ ...baseCard, websiteUrl: 'https://example.com' }} />
        <ContributorCard
          contributor={{
            ...baseCard,
            type: 'virtualContributor',
            name: 'Helper VC',
            websiteUrl: 'https://example.com',
          }}
        />
      </>
    );

    expect(screen.queryByRole('link', { name: /opens in a new tab/ })).not.toBeInTheDocument();
  });

  test('an organization with a website still exposes exactly one profile link, named after the organisation', () => {
    renderCard(<ContributorCard contributor={org} />);

    const profileLinks = screen.getAllByRole('link', { name: 'Green Future Labs' });
    expect(profileLinks).toHaveLength(1);
  });
});

describe('ContributorCard — "Joined this space" bottom line (US4, isolated block)', () => {
  test('a user with a joinedMonthLabel shows the line', () => {
    renderCard(<ContributorCard contributor={{ ...baseCard, joinedMonthLabel: 'Oct 2023' }} />);

    expect(screen.getByText('Joined this space Oct 2023')).toBeInTheDocument();
  });

  test('a user with no joinedMonthLabel shows no line', () => {
    renderCard(<ContributorCard contributor={{ ...baseCard }} />);

    expect(screen.queryByText(/Joined this space/)).not.toBeInTheDocument();
  });

  test('organisations and virtual contributors never show the line, even if joinedMonthLabel is passed', () => {
    renderCard(
      <>
        <ContributorCard
          contributor={{ ...baseCard, type: 'organization', name: 'Some Org', joinedMonthLabel: 'Oct 2023' }}
        />
        <ContributorCard
          contributor={{ ...baseCard, type: 'virtualContributor', name: 'Some VC', joinedMonthLabel: 'Oct 2023' }}
        />
      </>
    );

    expect(screen.queryByText(/Joined this space/)).not.toBeInTheDocument();
  });
});

describe('ContributorCard — the "…" actions menu (US3)', () => {
  const withHref: ContributorCardData = { ...baseCard, href: 'https://alkemio.test/ada' };

  test("the trigger's accessible name contains the contributor's name", () => {
    renderCard(<ContributorCard contributor={withHref} />);

    expect(screen.getByRole('button', { name: /Actions for Ada/ })).toBeInTheDocument();
  });

  test('a virtual contributor with no messaging capability has exactly one menu item (View Profile)', async () => {
    renderCard(
      <ContributorCard
        contributor={{
          ...baseCard,
          type: 'virtualContributor',
          name: 'Helper VC',
          href: 'https://alkemio.test/helper-vc',
        }}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /Actions for Helper VC/ }));

    expect(screen.getAllByRole('menuitem')).toHaveLength(1);
    expect(screen.getByRole('menuitem', { name: /View Profile/ })).toBeInTheDocument();
  });

  test('canMessage: true shows two items, and selecting Message calls onMessage with the contributor', async () => {
    const onMessage = vi.fn();
    const contributor: ContributorCardData = { ...withHref, canMessage: true };
    renderCard(<ContributorCard contributor={contributor} onMessage={onMessage} />);

    await userEvent.click(screen.getByRole('button', { name: /Actions for Ada/ }));
    expect(screen.getAllByRole('menuitem')).toHaveLength(2);

    await userEvent.click(screen.getByRole('menuitem', { name: 'Message' }));
    expect(onMessage).toHaveBeenCalledWith(contributor);
  });

  test('the View Profile item is a new-tab anchor', async () => {
    renderCard(<ContributorCard contributor={withHref} />);

    await userEvent.click(screen.getByRole('button', { name: /Actions for Ada/ }));

    const viewProfileItem = screen.getByRole('menuitem', { name: /View Profile/ });
    expect(viewProfileItem).toHaveAttribute('href', 'https://alkemio.test/ada');
    expect(viewProfileItem).toHaveAttribute('target', '_blank');
    expect(viewProfileItem).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  test('no href and no messaging capability ⇒ no trigger at all', () => {
    renderCard(<ContributorCard contributor={{ ...baseCard }} />);

    expect(screen.queryByRole('button', { name: /Actions for/ })).not.toBeInTheDocument();
  });

  test('no menu item ever reads "remove"', async () => {
    renderCard(<ContributorCard contributor={{ ...withHref, canMessage: true }} onMessage={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /Actions for Ada/ }));

    for (const item of screen.getAllByRole('menuitem')) {
      expect(item.textContent).not.toMatch(/remove/i);
    }
  });

  test('opening the menu never calls onContributorClick', async () => {
    const onContributorClick = vi.fn();
    renderCard(<ContributorCard contributor={withHref} onContributorClick={onContributorClick} />);

    await userEvent.click(screen.getByRole('button', { name: /Actions for Ada/ }));

    expect(onContributorClick).not.toHaveBeenCalled();
  });
});
