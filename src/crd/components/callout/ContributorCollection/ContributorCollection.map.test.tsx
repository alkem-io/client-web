/**
 * ContributorCollection — map pin popup.
 *
 * Drives the real ContributorCollection → lazy ContributorMap path; only the
 * WebGL layer (`react-map-gl/maplibre`) is replaced by plain DOM stand-ins, so
 * the markers, the popup and its content are the production code.
 *
 * Clicking a pin must show the same contributor card as the list (tagline,
 * tags, organisation details, the actions menu with Message), on both the
 * inline and the expanded map; Esc closes the popup and returns focus to the
 * pin that opened it.
 */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18next from 'i18next';
import type { ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { beforeAll, describe, expect, test, vi } from 'vitest';
import commonEnJson from '@/crd/i18n/common/common.en.json';
import spaceEnJson from '@/crd/i18n/space/space.en.json';
import type { ContributorCardData } from './ContributorCard';
import { ContributorCollection } from './ContributorCollection';

// The stand-in map is 384px tall (the inline map's h-96) with every pin projected
// to its vertical centre — the case where neither side of the pin fits a full card.
const MAP_HEIGHT = 384;
const PIN_Y = 192;

vi.mock('react-map-gl/maplibre', async () => {
  const { forwardRef, useImperativeHandle } = await import('react');
  return {
    Map: forwardRef<unknown, { children: ReactNode }>(({ children }, ref) => {
      useImperativeHandle(ref, () => ({
        project: () => ({ x: 0, y: PIN_Y }),
        getContainer: () => ({ clientHeight: MAP_HEIGHT }),
      }));
      return <div data-testid="maplibre-map">{children}</div>;
    }),
    AttributionControl: () => null,
    // Mirrors react-map-gl: the marker's click listener sits on the wrapper element
    // and hands the DOM event over as `originalEvent`.
    Marker: ({ children, onClick }: { children: ReactNode; onClick?: (e: { originalEvent: Event }) => void }) => (
      // biome-ignore lint/a11y/noStaticElementInteractions: test stand-in for the maplibre marker wrapper
      // biome-ignore lint/a11y/useKeyWithClickEvents: the real pin is the inner <button>
      <div onClick={e => onClick?.({ originalEvent: e.nativeEvent })}>{children}</div>
    ),
    Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  };
});

const i18n = i18next.createInstance();

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['crd-common', 'crd-space'],
    defaultNS: 'crd-common',
    resources: { en: { 'crd-common': commonEnJson, 'crd-space': spaceEnJson } },
    interpolation: { escapeValue: false },
  });
});

// CollapsibleTagList renders an aria-hidden measuring copy of every tag; text queries skip it.
const HIDDEN_TEXT = 'script, style, [aria-hidden="true"] *';

const ada: ContributorCardData = {
  id: 'user-ada',
  type: 'user',
  name: 'Ada',
  roleLabel: 'member',
  href: '/user/ada',
  hasValidCoordinates: true,
  latitude: 52.37,
  longitude: 4.9,
  tagline: 'Urban planner who loves a good map.',
  tags: ['Urban Planning'],
  locationLabel: 'Amsterdam, NL',
  canMessage: true,
};

const acme: ContributorCardData = {
  id: 'org-acme',
  type: 'organization',
  name: 'Acme',
  roleLabel: 'lead',
  href: '/organization/acme',
  hasValidCoordinates: true,
  latitude: 48.85,
  longitude: 2.35,
  tagline: 'We build everything.',
  associatesCount: 3,
  websiteUrl: 'https://acme.example',
  canMessage: true,
};

const renderMap = (cards: ContributorCardData[], onMessage = vi.fn()) => {
  const activeType = cards[0].type === 'organization' ? 'organization' : 'user';
  render(
    <I18nextProvider i18n={i18n}>
      <ContributorCollection
        types={[activeType]}
        activeType={activeType}
        onActiveTypeChange={() => {}}
        defaultView="map"
        counts={{
          users: activeType === 'user' ? cards.length : 0,
          organizations: activeType === 'organization' ? cards.length : 0,
          virtualContributors: 0,
        }}
        cards={cards}
        loading={false}
        onContributorClick={vi.fn()}
        onMessage={onMessage}
      />
    </I18nextProvider>
  );
  return { onMessage };
};

describe('ContributorCollection map — pin popup shows the full contributor card', () => {
  test('a user pin opens the full card, including the Message action', async () => {
    const user = userEvent.setup();
    const { onMessage } = renderMap([ada]);

    await user.click(await screen.findByRole('button', { name: 'Ada' }));

    const popup = screen.getByRole('dialog', { name: 'Ada' });
    expect(within(popup).getByText('Urban planner who loves a good map.')).toBeInTheDocument();
    expect(within(popup).getByText('Urban Planning', { ignore: HIDDEN_TEXT })).toBeInTheDocument();
    expect(within(popup).getByText('Amsterdam, NL')).toBeInTheDocument();
    expect(within(popup).getByText('Member')).toBeInTheDocument();

    await user.click(within(popup).getByRole('button', { name: 'Actions for Ada' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Message' }));
    expect(onMessage).toHaveBeenCalledWith(ada);
  });

  test('an organisation pin opens the full organisation card', async () => {
    const user = userEvent.setup();
    renderMap([acme]);

    await user.click(await screen.findByRole('button', { name: 'Acme' }));

    const popup = screen.getByRole('dialog', { name: 'Acme' });
    expect(within(popup).getByText('We build everything.')).toBeInTheDocument();
    expect(within(popup).getByText('3 associates in this organization')).toBeInTheDocument();
    expect(within(popup).getByRole('link', { name: /Visit the website of Acme/ })).toHaveAttribute(
      'href',
      'https://acme.example'
    );
    expect(within(popup).getByRole('button', { name: 'Actions for Acme' })).toBeInTheDocument();
  });

  test('Esc closes the popup and returns focus to the pin', async () => {
    const user = userEvent.setup();
    renderMap([ada]);

    const pin = await screen.findByRole('button', { name: 'Ada' });
    await user.click(pin);
    const popup = screen.getByRole('dialog', { name: 'Ada' });
    expect(popup).toHaveFocus();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog', { name: 'Ada' })).not.toBeInTheDocument();
    expect(pin).toHaveFocus();
  });

  test('the close button closes the popup and returns focus to the pin', async () => {
    const user = userEvent.setup();
    renderMap([ada]);

    const pin = await screen.findByRole('button', { name: 'Ada' });
    await user.click(pin);
    await user.click(within(screen.getByRole('dialog', { name: 'Ada' })).getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog', { name: 'Ada' })).not.toBeInTheDocument();
    expect(pin).toHaveFocus();
  });

  test('the expanded map shows the same card; Esc closes only the popup, not the expanded map', async () => {
    const user = userEvent.setup();
    renderMap([ada]);

    await screen.findByRole('button', { name: 'Ada' });
    await user.click(screen.getByRole('button', { name: 'Expand map' }));
    const expanded = await screen.findByRole('dialog', { name: 'Map' });

    const pin = await within(expanded).findByRole('button', { name: 'Ada' });
    await user.click(pin);
    const popup = within(expanded).getByRole('dialog', { name: 'Ada' });
    expect(within(popup).getByText('Urban planner who loves a good map.')).toBeInTheDocument();
    expect(popup).toHaveFocus();

    await user.keyboard('{Escape}');

    expect(within(expanded).queryByRole('dialog', { name: 'Ada' })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Map' })).toBeInTheDocument();
    expect(pin).toHaveFocus();
  });

  test('on the expanded map, Message closes the map before opening the chat', async () => {
    const user = userEvent.setup();
    const onMessage = vi.fn(() => {
      // The chat opens outside the modal map, so the map must already be gone.
      expect(screen.queryByRole('dialog', { name: 'Map' })).not.toBeInTheDocument();
    });
    renderMap([ada], onMessage);

    await screen.findByRole('button', { name: 'Ada' });
    await user.click(screen.getByRole('button', { name: 'Expand map' }));
    const expanded = await screen.findByRole('dialog', { name: 'Map' });
    await user.click(await within(expanded).findByRole('button', { name: 'Ada' }));
    const popup = within(expanded).getByRole('dialog', { name: 'Ada' });

    await user.click(within(popup).getByRole('button', { name: 'Actions for Ada' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Message' }));

    expect(onMessage).toHaveBeenCalledWith(ada);
    expect(screen.queryByRole('dialog', { name: 'Map' })).not.toBeInTheDocument();
  });

  test('a centred pin on the inline map caps the card to the room left inside the map', async () => {
    const user = userEvent.setup();
    renderMap([ada]);

    await user.click(await screen.findByRole('button', { name: 'Ada' }));

    // Below the pin: 384 - 192 - 8 (popup offset) - 18 (tip + edge gap) = 166px,
    // more than the 118px above it — so the card scrolls inside the map, not past it.
    expect(screen.getByRole('dialog', { name: 'Ada' }).style.maxHeight).toBe('min(18rem, 60vh, 166px)');
  });
});
