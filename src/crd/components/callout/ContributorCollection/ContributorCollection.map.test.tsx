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
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18next from 'i18next';
import type { ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { beforeAll, describe, expect, test, vi } from 'vitest';
import commonEnJson from '@/crd/i18n/common/common.en.json';
import spaceEnJson from '@/crd/i18n/space/space.en.json';
import { Dialog, DialogContent, DialogTitle } from '@/crd/primitives/dialog';
import type { ContributorCardData } from './ContributorCard';
import { ContributorCollection } from './ContributorCollection';

// The stand-in map is a phone-width inline map: 292px wide, 384px tall (h-96).
const MAP_HEIGHT = 384;
const MAP_RECT = { left: 0, top: 0, right: 292, bottom: MAP_HEIGHT, width: 292, height: MAP_HEIGHT };

// Where the stand-in popup reports it was laid out, and the map's pan calls.
const layout = vi.hoisted(() => ({
  popupRect: undefined as DOMRect | undefined,
  pinY: 100,
  // The zoom the stand-in map reports on load (a city-level view).
  zoom: 10,
  panBy: (() => {}) as (offset: [number, number]) => void,
  // Where fitBounds was asked to go, and the zoom the stand-in map then settles on.
  fitBounds: [] as [[number, number], [number, number]][],
  zoomAfterFit: 16,
  // How many camera moves the map was asked to make (fitBounds or easeTo).
  moves: 0,
}));

// maplibre's `focusAfterOpen` selector: the popup focuses the first match on open.
const POPUP_FOCUSABLE =
  "a[href], [tabindex]:not([tabindex='-1']), [contenteditable]:not([contenteditable='false']), button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])";

type MapStandInProps = {
  children: ReactNode;
  onLoad?: (e: { target: unknown }) => void;
  onZoomEnd?: (e: { viewState: { zoom: number } }) => void;
  onMoveStart?: (e: { originalEvent?: Event }) => void;
};
const mapEvents = vi.hoisted(() => ({}) as Pick<MapStandInProps, 'onZoomEnd' | 'onMoveStart'>);

// A user's drag starts a move with the DOM event behind it; the map's own moves carry none.
const userMovesMap = () => act(() => mapEvents.onMoveStart?.({ originalEvent: new MouseEvent('mousedown') }));

vi.mock('react-map-gl/maplibre', async () => {
  const { forwardRef, useEffect, useImperativeHandle, useRef, useState } = await import('react');
  const { createPortal } = await import('react-dom');
  const { act: actInMock } = await import('@testing-library/react');
  const standInMap = {
    getContainer: () => ({
      clientHeight: MAP_HEIGHT,
      getBoundingClientRect: () => MAP_RECT,
      querySelector: () => null,
    }),
    getZoom: () => layout.zoom,
    getCenter: () => ({ lng: 0, lat: 0 }),
    project: () => ({ x: 146, y: layout.pinY }),
    panBy: (offset: [number, number]) => layout.panBy(offset),
    easeTo: () => {
      layout.moves += 1;
    },
    // Like maplibre, fitting the bounds ends in a `zoomend` at the new zoom.
    fitBounds: (bounds: [[number, number], [number, number]]) => {
      layout.moves += 1;
      layout.fitBounds.push(bounds);
      layout.zoom = layout.zoomAfterFit;
      actInMock(() => mapEvents.onZoomEnd?.({ viewState: { zoom: layout.zoom } }));
    },
  };
  return {
    Map: forwardRef<unknown, MapStandInProps>(({ children, onLoad, onZoomEnd, onMoveStart }, ref) => {
      useImperativeHandle(ref, () => standInMap);
      // The map's event props, for the stand-in's own moves and for tests driving the map.
      useEffect(() => {
        Object.assign(mapEvents, { onZoomEnd, onMoveStart });
      });
      // Like maplibre, `load` fires once the map is ready.
      useEffect(() => {
        onLoad?.({ target: standInMap });
      }, []);
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
    // Mirrors react-map-gl 8's lifecycle: children render into a detached
    // container, which an effect then attaches before maplibre focuses the
    // first focusable element — so a focus made during render would be lost —
    // and then fires `open` with the popup element.
    Popup: ({
      children,
      anchor: side,
      onOpen,
    }: {
      children: ReactNode;
      anchor?: string;
      onOpen?: (e: { target: { getElement: () => HTMLElement } }) => void;
    }) => {
      const [container] = useState(() => document.createElement('div'));
      const anchor = useRef<HTMLDivElement>(null);
      useEffect(() => {
        const element = anchor.current;
        if (!element) return;
        element.appendChild(container);
        if (layout.popupRect) {
          element.getBoundingClientRect = () => layout.popupRect as DOMRect;
        }
        container.querySelector<HTMLElement>(POPUP_FOCUSABLE)?.focus();
        onOpen?.({ target: { getElement: () => element } });
        return () => container.remove();
      }, [container]);
      return (
        <div ref={anchor} data-anchor={side}>
          {createPortal(children, container)}
        </div>
      );
    },
  };
});

const i18n = i18next.createInstance();

beforeAll(async () => {
  // The collection loads the map lazily. Load it once up front so the first test's wait
  // covers rendering the map, not compiling the map's modules, which takes over a second
  // when the whole suite runs in parallel.
  await import('@/crd/components/map/ContributorMap');
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

const renderMap = (cards: ContributorCardData[], onMessage = vi.fn(), wrap = (node: ReactNode) => node) => {
  const activeType = cards[0].type === 'organization' ? 'organization' : 'user';
  render(
    <I18nextProvider i18n={i18n}>
      {wrap(
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
      )}
    </I18nextProvider>
  );
  return { onMessage };
};

// The callout detail dialog renders the inline map inside a modal Radix dialog.
const inCalloutDialog = (node: ReactNode) => (
  <Dialog defaultOpen={true}>
    <DialogContent aria-describedby={undefined}>
      <DialogTitle>Contributors callout</DialogTitle>
      {node}
    </DialogContent>
  </Dialog>
);

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
    expect(within(popup).getByRole('button', { name: 'Close' })).toHaveFocus();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog', { name: 'Ada' })).not.toBeInTheDocument();
    expect(pin).toHaveFocus();
  });

  test('inside the callout dialog, Esc closes only the popup, not the callout dialog', async () => {
    const user = userEvent.setup();
    renderMap([ada], vi.fn(), inCalloutDialog);

    const callout = await screen.findByRole('dialog', { name: 'Contributors callout' });
    const pin = await within(callout).findByRole('button', { name: 'Ada' });
    await user.click(pin);
    expect(within(callout).getByRole('dialog', { name: 'Ada' })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(within(callout).queryByRole('dialog', { name: 'Ada' })).not.toBeInTheDocument();
    expect(callout).toBeInTheDocument();
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
    expect(within(popup).getByRole('button', { name: 'Close' })).toHaveFocus();

    await user.keyboard('{Escape}');

    expect(within(expanded).queryByRole('dialog', { name: 'Ada' })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Map' })).toBeInTheDocument();
    expect(pin).toHaveFocus();
  });

  test('on the expanded map, Message hands the contributor to the consumer', async () => {
    const user = userEvent.setup();
    const onMessage = vi.fn();
    renderMap([ada], onMessage);

    await screen.findByRole('button', { name: 'Ada' });
    await user.click(screen.getByRole('button', { name: 'Expand map' }));
    const expanded = await screen.findByRole('dialog', { name: 'Map' });
    await user.click(await within(expanded).findByRole('button', { name: 'Ada' }));
    const popup = within(expanded).getByRole('dialog', { name: 'Ada' });

    await user.click(within(popup).getByRole('button', { name: 'Actions for Ada' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Message' }));

    expect(onMessage).toHaveBeenCalledWith(ada);
  });

  test('the card is capped to the map height left beside its pin', async () => {
    const user = userEvent.setup();
    renderMap([ada]);

    await user.click(await screen.findByRole('button', { name: 'Ada' }));

    // 384 (map) - 56 (pin) - 10 (tip) - 2 × 8 (edge gaps) = 302px.
    expect(screen.getByRole('dialog', { name: 'Ada' }).style.maxHeight).toBe('min(18rem, 60vh, 302px)');
  });

  test('a card that sticks out of a narrow map pans the map until it fits', async () => {
    const user = userEvent.setup();
    const panBy = vi.fn();
    layout.panBy = panBy;
    // Laid out 30px past the right edge and 21px past the bottom of the 292 × 384 map.
    layout.popupRect = { left: 32, right: 322, top: 150, bottom: 405, width: 290, height: 255 } as DOMRect;
    try {
      renderMap([ada]);
      const pin = await screen.findByRole('button', { name: 'Ada' });
      // The pin sits inside the map, above the card.
      pin.getBoundingClientRect = () => ({ left: 153, right: 201, top: 94, bottom: 142 }) as DOMRect;
      await user.click(pin);

      // Each overflow plus the 8px edge gap: 322 - 292 + 8 and 405 - 384 + 8.
      await waitFor(() => expect(panBy).toHaveBeenCalledWith([38, 29]));
    } finally {
      layout.popupRect = undefined;
      layout.panBy = () => {};
    }
  });

  test('a card that already fits does not move the map', async () => {
    const user = userEvent.setup();
    const panBy = vi.fn();
    layout.panBy = panBy;
    layout.popupRect = { left: 20, right: 270, top: 60, bottom: 300, width: 250, height: 240 } as DOMRect;
    try {
      renderMap([ada]);
      const pin = await screen.findByRole('button', { name: 'Ada' });
      pin.getBoundingClientRect = () => ({ left: 121, right: 169, top: 10, bottom: 58 }) as DOMRect;
      await user.click(pin);
      await new Promise(resolve => requestAnimationFrame(resolve));

      expect(panBy).not.toHaveBeenCalled();
    } finally {
      layout.popupRect = undefined;
      layout.panBy = () => {};
    }
  });

  test('a card that clips its pin on the narrow map pans until both fit', async () => {
    const user = userEvent.setup();
    const panBy = vi.fn();
    layout.panBy = panBy;
    // The card fits, but the pin above it is 15px past the map's top edge.
    layout.popupRect = { left: 9, right: 283, top: 66, bottom: 360, width: 274, height: 294 } as DOMRect;
    try {
      renderMap([ada]);
      const pin = await screen.findByRole('button', { name: 'Ada' });
      pin.getBoundingClientRect = () => ({ left: 122, right: 170, top: -15, bottom: 33 }) as DOMRect;
      await user.click(pin);

      // -15 - 0 - 8: the map pans the pin down into view.
      await waitFor(() => expect(panBy).toHaveBeenCalledWith([0, -23]));
    } finally {
      layout.popupRect = undefined;
      layout.panBy = () => {};
    }
  });

  test('a pin in the top half opens its card below it', async () => {
    const user = userEvent.setup();
    renderMap([ada]);
    await user.click(await screen.findByRole('button', { name: 'Ada' }));

    expect(screen.getByRole('dialog', { name: 'Ada' }).closest('[data-anchor]')).toHaveAttribute('data-anchor', 'top');
  });

  test('a pin in the bottom half opens its card above it', async () => {
    const user = userEvent.setup();
    layout.pinY = 300;
    try {
      renderMap([ada]);
      await user.click(await screen.findByRole('button', { name: 'Ada' }));

      expect(screen.getByRole('dialog', { name: 'Ada' }).closest('[data-anchor]')).toHaveAttribute(
        'data-anchor',
        'bottom'
      );
    } finally {
      layout.pinY = 100;
    }
  });
});

describe('ContributorCollection map — pins on the same spot', () => {
  // Hedy stands on the same spot as Ada; Alan is a street away.
  const hedy: ContributorCardData = {
    ...ada,
    id: 'user-hedy',
    name: 'Hedy',
    href: '/user/hedy',
    tagline: 'Frequency hopping.',
  };
  const alan: ContributorCardData = {
    ...ada,
    id: 'user-alan',
    name: 'Alan',
    href: '/user/alan',
    latitude: 52.36,
    longitude: 4.88,
  };

  test('overlapping pins show as one round pin with their count inside, named for who it holds', async () => {
    renderMap([ada, hedy, alan]);

    const group = await screen.findByRole('button', { name: '3 contributors here: Ada, Hedy, Alan' });
    expect(group).toHaveTextContent(/^3$/);
    expect(group.firstElementChild).toHaveClass('rounded-full');
    expect(screen.queryByRole('button', { name: 'Ada' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Hedy' })).not.toBeInTheDocument();
  });

  test('clicking a group whose pins zooming can separate zooms the map in onto them', async () => {
    const user = userEvent.setup();
    layout.fitBounds = [];
    try {
      renderMap([alan, ada]);
      await user.click(await screen.findByRole('button', { name: '2 contributors here: Alan, Ada' }));

      expect(layout.fitBounds).toEqual([
        [
          [4.88, 52.36],
          [4.9, 52.37],
        ],
      ]);
      expect(screen.queryByRole('dialog', { name: '2 contributors here' })).not.toBeInTheDocument();
      // Zoomed in, the pins stand apart; focus moves to the first of them.
      expect(screen.getByRole('button', { name: 'Ada' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Alan' })).toHaveFocus();
    } finally {
      layout.zoom = 10;
    }
  });

  test('a group at one exact spot, which no zoom separates, lists its contributors; choosing one opens its card', async () => {
    const user = userEvent.setup();
    renderMap([ada, hedy]);

    await user.click(await screen.findByRole('button', { name: '2 contributors here: Ada, Hedy' }));
    const list = screen.getByRole('dialog', { name: '2 contributors here' });
    await user.click(within(list).getByRole('button', { name: /Hedy/ }));

    expect(screen.queryByRole('dialog', { name: '2 contributors here' })).not.toBeInTheDocument();
    expect(within(screen.getByRole('dialog', { name: 'Hedy' })).getByText('Frequency hopping.')).toBeInTheDocument();
  });

  test('Esc closes the list, and later the chosen card, returning focus to the group pin each time', async () => {
    const user = userEvent.setup();
    renderMap([ada, hedy]);
    const group = await screen.findByRole('button', { name: '2 contributors here: Ada, Hedy' });

    await user.click(group);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: '2 contributors here' })).not.toBeInTheDocument();
    expect(group).toHaveFocus();

    await user.click(group);
    await user.click(
      within(screen.getByRole('dialog', { name: '2 contributors here' })).getByRole('button', { name: /Ada/ })
    );
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Ada' })).not.toBeInTheDocument();
    expect(group).toHaveFocus();
  });

  test('like a card, the list of a group in the bottom half opens above it, capped to the room left', async () => {
    const user = userEvent.setup();
    layout.pinY = 300;
    try {
      renderMap([ada, hedy]);
      await user.click(await screen.findByRole('button', { name: '2 contributors here: Ada, Hedy' }));

      const list = screen.getByRole('dialog', { name: '2 contributors here' });
      expect(list.closest('[data-anchor]')).toHaveAttribute('data-anchor', 'bottom');
      expect(list.style.maxHeight).toBe('min(18rem, 60vh, 302px)');
    } finally {
      layout.pinY = 100;
    }
  });

  test('zoomed in, nearby pins that no longer overlap stand alone again', async () => {
    layout.zoom = 16;
    try {
      renderMap([ada, alan]);
      expect(await screen.findByRole('button', { name: 'Ada' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Alan' })).toBeInTheDocument();
    } finally {
      layout.zoom = 10;
    }
  });
});

describe('ContributorCollection map — the map never zooms out on its own', () => {
  const far: ContributorCardData = {
    ...ada,
    id: 'user-far',
    name: 'Far',
    href: '/user/far',
    latitude: -1.29,
    longitude: 36.82,
  };
  const near: ContributorCardData = {
    ...ada,
    id: 'user-near',
    name: 'Near',
    href: '/user/near',
    latitude: 51.92,
    longitude: 4.48,
  };
  const tree = (cards: ContributorCardData[], activeType: 'user' | 'organization' = 'user') => (
    <I18nextProvider i18n={i18n}>
      <ContributorCollection
        types={['user', 'organization']}
        activeType={activeType}
        onActiveTypeChange={() => {}}
        defaultView="map"
        counts={{ users: 3, organizations: 1, virtualContributors: 0 }}
        cards={cards}
        loading={false}
        onContributorClick={vi.fn()}
      />
    </I18nextProvider>
  );
  const movesDuring = (run: () => void) => {
    layout.moves = 0;
    run();
    return layout.moves;
  };

  test('contributors that finish loading after the map opened frame it once', async () => {
    const { rerender } = render(tree([]));
    await screen.findByTestId('maplibre-map');

    expect(movesDuring(() => rerender(tree([ada, near])))).toBe(1);
  });

  test('once framed, a change in the loaded contributors leaves the map where it is', async () => {
    const { rerender } = render(tree([ada, near]));
    await screen.findByRole('button', { name: 'Ada' });

    expect(movesDuring(() => rerender(tree([ada, near, far])))).toBe(0);
  });

  test('a map the user has moved is not framed when contributors finish loading', async () => {
    const { rerender } = render(tree([]));
    await screen.findByTestId('maplibre-map');
    userMovesMap();

    expect(movesDuring(() => rerender(tree([ada, far])))).toBe(0);
  });

  test('switching what the map shows frames the new set', async () => {
    // The consumer passes the cards of the active type.
    const { rerender } = render(tree([ada, near]));
    await screen.findByRole('button', { name: 'Ada' });

    expect(movesDuring(() => rerender(tree([acme], 'organization')))).toBe(1);
  });
});
