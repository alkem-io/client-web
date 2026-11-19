import 'maplibre-gl/dist/maplibre-gl.css';
import { X } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AttributionControl, Map as MapLibreMap, type MapRef, Marker, Popup } from 'react-map-gl/maplibre';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';

/**
 * Lazy MapLibre map for the contributor-collection callout (feature 008, R1/T013).
 *
 * **This is the ONLY file in the codebase that imports `maplibre-gl` /
 * `react-map-gl/maplibre`.** It is loaded via `React.lazy` + `Suspense` from
 * `ContributorCollection`, so the WebGL bundle never enters the main chunk. The
 * basemap is OpenFreeMap's public positron style (no API key → no infra change).
 * Markers + popups are MapLibre child components styled with shadcn/Tailwind
 * tokens (`theme.css`). Only contributors with valid coordinates are plotted;
 * the caller lists the rest under "no location data".
 *
 * Adds optional `fixedView` (admin-chosen camera) and `onViewChange`
 * (capture callback). `isRenderableMapView` and `resolveView` are exported pure
 * functions for use in tests and the capture UI.
 */

const POSITRON_STYLE = 'https://tiles.openfreemap.org/styles/positron';

export type ContributorMapPin = {
  id: string;
  name: string;
  avatarUrl?: string;
  roleLabel?: string;
  href?: string;
  latitude: number;
  longitude: number;
};

/** Pins drawn on top of each other at the current zoom, shown as one pin placed at the first. */
export type ContributorMapPinGroup = {
  id: string;
  pins: ContributorMapPin[];
};

// Avatar pins are 48px squares: two pins closer than that on both axes overlap.
const PIN_SIZE_PX = 48;
// MapLibre's Web Mercator world is 512px wide at zoom 0.
const WORLD_SIZE_AT_ZOOM_0 = 512;

const toWorldPixels = (pin: ContributorMapPin, zoom: number) => {
  const world = WORLD_SIZE_AT_ZOOM_0 * 2 ** zoom;
  const sinLat = Math.sin((pin.latitude * Math.PI) / 180);
  return {
    x: ((pin.longitude + 180) / 360) * world,
    y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * world,
  };
};

/**
 * Groups the pins that overlap at `zoom`. Panning moves every pin alike, so
 * overlap depends on the zoom alone. Each pin joins the first group whose
 * first pin it overlaps; pins at identical coordinates stay grouped at any zoom.
 */
export function groupOverlappingPins(pins: ContributorMapPin[], zoom: number): ContributorMapPinGroup[] {
  const groups: { anchor: { x: number; y: number }; group: ContributorMapPinGroup }[] = [];
  for (const pin of pins) {
    const point = toWorldPixels(pin, zoom);
    const overlapped = groups.find(
      ({ anchor }) => Math.abs(anchor.x - point.x) < PIN_SIZE_PX && Math.abs(anchor.y - point.y) < PIN_SIZE_PX
    );
    if (overlapped) {
      overlapped.group.pins.push(pin);
    } else {
      groups.push({ anchor: point, group: { id: pin.id, pins: [pin] } });
    }
  }
  return groups.map(({ group }) => group);
}

/**
 * Admin-fixed initial map view. Absent/null ⇒ automatic framing.
 * Mirrors the server shape (longitude, latitude, zoom) — three floats.
 */
export type ContributorMapFixedView = {
  longitude: number;
  latitude: number;
  zoom: number;
};

/**
 * Guard predicate. Returns true ONLY when all three
 * values are finite numbers within MapLibre's safe ranges:
 *  - latitude ∈ [−90, 90]
 *  - longitude ∈ [−180, 180]
 *  - zoom ∈ [0, 22]
 *
 * MapLibre throws at mount on any out-of-range value (especially lat > ±90),
 * which would crash the map for every viewer — including anonymous ones. An
 * invalid stored view always falls back to automatic framing; no clamping.
 */
export function isRenderableMapView(v: ContributorMapFixedView | null | undefined): v is ContributorMapFixedView {
  if (!v) return false;
  const { longitude, latitude, zoom } = v;
  return (
    Number.isFinite(longitude) &&
    Number.isFinite(latitude) &&
    Number.isFinite(zoom) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    zoom >= 0 &&
    zoom <= 22
  );
}

type ContributorMapProps = {
  pins: ContributorMapPin[];
  /** Accessible label for the map region (consumer i18n's it). */
  ariaLabel: string;
  /**
   * Identifies what the user chose to show (e.g. the contributor type and role
   * filter). The map re-fits to the pins when it changes, and only then: pins
   * that load or refetch never move a map that is already framed.
   */
  fitKey?: string;
  /**
   * Admin-fixed initial camera. When present and valid
   * (`isRenderableMapView`), the map opens on this view instead of the automatic
   * fit-to-pins framing. Invalid stored values fall back to automatic framing
   * (never throw). Viewers can still pan/zoom freely after mount.
   */
  fixedView?: ContributorMapFixedView;
  /**
   * Called with the current camera whenever the map loads or the user finishes
   * panning/zooming. Used by the capture control to read the view.
   */
  onViewChange?: (view: ContributorMapFixedView) => void;
  onPinClick?: (href: string) => void;
  /**
   * Content of the popup opened by a pin (e.g. the contributor's full card).
   * When absent, the popup shows the pin's avatar, name and role only.
   */
  renderPinCard?: (pinId: string) => ReactNode;
  className?: string;
};

// Gap kept between a pin's popup (its card, or a group's list) and the map's edges.
const PIN_POPUP_EDGE_GAP = 8;

// The card popup's width is capped by maplibre's `maxWidth` (its 240px default
// is too narrow for a card). The popup sits in the map container, so `100%` is
// the map's width: the card never gets wider than a narrow (mobile) map.
const CARD_POPUP_MAX_WIDTH = `min(20rem, calc(100% - ${2 * PIN_POPUP_EDGE_GAP}px))`;

// A pin's popup sits centred below its pin (`top` anchor) or above it (`bottom`),
// so the pin always stays within the popup's width. Avatar pins are bottom-anchored
// and 48px tall: a card above the point must clear the avatar.
type PinPopupAnchor = 'top' | 'bottom';
const PIN_POPUP_OFFSET: Record<PinPopupAnchor, [number, number]> = { top: [0, 8], bottom: [0, -56] };

// Where a pin's popup goes and how tall it may be: below the pin when the pin is in
// the map's top half, above it otherwise; at most the map's height minus the
// pin, maplibre's tip (10px) and the edge gaps. Without a map yet, only the CSS
// cap applies.
const pinPopupLayout = (
  map: MapRef | null,
  pin: ContributorMapPin
): { anchor: PinPopupAnchor; maxHeight: number | undefined } => {
  if (!map) {
    return { anchor: 'top', maxHeight: undefined };
  }
  const mapHeight = map.getContainer().clientHeight;
  const { y } = map.project([pin.longitude, pin.latitude]);
  return {
    anchor: y < mapHeight / 2 ? 'top' : 'bottom',
    maxHeight: Math.max(mapHeight + PIN_POPUP_OFFSET.bottom[1] - 10 - 2 * PIN_POPUP_EDGE_GAP, 0),
  };
};

// Maplibre never pans to show a popup, and the map clips its overflow. Once the
// popup has laid out, pan the map by however far it and its pin stick out, so
// both end up inside the map whatever the pin position or map size.
const panPinPopupIntoView = (map: MapRef | null, popup: HTMLElement, pinButton: HTMLElement | undefined) => {
  if (!map) {
    return;
  }
  const bounds = map.getContainer().getBoundingClientRect();
  const card = popup.getBoundingClientRect();
  const pin = pinButton?.getBoundingClientRect() ?? card;
  const left = Math.min(card.left, pin.left);
  const right = Math.max(card.right, pin.right);
  const top = Math.min(card.top, pin.top);
  const bottom = Math.max(card.bottom, pin.bottom);
  const overflow = (start: number, end: number, min: number, max: number) => {
    if (start < min + PIN_POPUP_EDGE_GAP) {
      return start - min - PIN_POPUP_EDGE_GAP;
    }
    if (end > max - PIN_POPUP_EDGE_GAP) {
      return end - max + PIN_POPUP_EDGE_GAP;
    }
    return 0;
  };
  const dx = overflow(left, right, bounds.left, bounds.right);
  const dy = overflow(top, bottom, bounds.top, bounds.bottom);
  if (dx !== 0 || dy !== 0) {
    map.panBy([dx, dy], { duration: 200 });
  }
};

// The popup's height cap: the CSS cap, tightened to the room beside the pin once known.
const popupHeightStyle = ({ maxHeight }: { maxHeight: number | undefined }) =>
  maxHeight === undefined ? undefined : { maxHeight: `min(18rem, 60vh, ${maxHeight}px)` };

// Default to a Europe-centred view when there are no plottable pins; when there
// are, fit the map to their bounds (single pin → centre on it). The view is only
// the INITIAL state — the user can pan/zoom freely afterwards.
const EUROPE_VIEW = { longitude: 10, latitude: 50, zoom: 3.5 } as const;

// Discriminated so `'bounds' in view` narrows cleanly (centre-view vs fit-bounds).
type MapInitialView =
  | { longitude: number; latitude: number; zoom: number }
  | {
      bounds: [[number, number], [number, number]];
      fitBoundsOptions: {
        padding: { top: number; bottom: number; left: number; right: number };
        maxZoom: number;
      };
    };

function initialView(pins: ContributorMapPin[]): MapInitialView {
  if (pins.length === 0) {
    return EUROPE_VIEW;
  }
  if (pins.length === 1) {
    return { longitude: pins[0].longitude, latitude: pins[0].latitude, zoom: 7 };
  }
  const longitudes = pins.map(p => p.longitude);
  const latitudes = pins.map(p => p.latitude);
  return {
    bounds: [
      [Math.min(...longitudes), Math.min(...latitudes)],
      [Math.max(...longitudes), Math.max(...latitudes)],
    ] as [[number, number], [number, number]],
    // Tighter padding + a higher zoom cap so clustered pins aren't shown on an
    // unnecessarily wide view (still fits all pins). Extra TOP padding because
    // the avatar pins are bottom-anchored (render upward from the point), so the
    // topmost pin needs headroom or its avatar is clipped at the map's top edge.
    fitBoundsOptions: {
      padding: { top: 72, bottom: 32, left: 32, right: 32 },
      maxZoom: 10,
    },
  };
}

/**
 * Shared view resolver. Returns the fixed view when valid
 * (`isRenderableMapView`), otherwise falls back to `initialView(pins)`.
 * Feeds the mount `initialViewState` and every re-frame (`fitKey`, first pins).
 */
export function resolveView(
  fixedView: ContributorMapFixedView | null | undefined,
  pins: ContributorMapPin[]
): MapInitialView {
  if (isRenderableMapView(fixedView)) {
    return { longitude: fixedView.longitude, latitude: fixedView.latitude, zoom: fixedView.zoom };
  }
  return initialView(pins);
}

// MapLibre renders the compact attribution EXPANDED by default; collapse it on
// load so it starts as a small "ⓘ" toggle (the license-required OpenStreetMap /
// OpenFreeMap attribution stays — clicking ⓘ expands it).
function collapseAttribution(target: { getContainer(): HTMLElement }) {
  const el = target.getContainer().querySelector('.maplibregl-ctrl-attrib');
  if (el instanceof HTMLDetailsElement) {
    el.open = false;
  } else if (el) {
    el.classList.remove('maplibregl-compact-show');
  }
}

// The highest zoom MapLibre allows.
const MAX_ZOOM = 22;

// The smallest box around a group's pins, as fitBounds takes it.
const pinBounds = (pins: ContributorMapPin[]): [[number, number], [number, number]] => [
  [Math.min(...pins.map(p => p.longitude)), Math.min(...pins.map(p => p.latitude))],
  [Math.max(...pins.map(p => p.longitude)), Math.max(...pins.map(p => p.latitude))],
];

// Room kept around a group's pins when zooming onto them, so they land clear of the edges.
const GROUP_ZOOM_PADDING = 64;

// Whether a closer zoom separates a group's pins; pins sharing one spot never separate.
const canZoomApart = (group: ContributorMapPinGroup) => groupOverlappingPins(group.pins, MAX_ZOOM).length > 1;

function PinAvatar({ pin, className }: { pin: ContributorMapPin; className: string }) {
  return (
    <Avatar className={className}>
      {pin.avatarUrl && <AvatarImage src={pin.avatarUrl} alt="" className="object-cover" />}
      <AvatarFallback className="rounded-md bg-primary text-body text-primary-foreground">
        {pin.name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

export default function ContributorMap({
  pins,
  ariaLabel,
  fitKey,
  fixedView,
  onViewChange,
  onPinClick,
  renderPinCard,
  className,
}: ContributorMapProps) {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = pins.find(p => p.id === activeId) ?? null;
  // Until the map reports its zoom, only pins at the very same spot are grouped.
  const [zoom, setZoom] = useState(MAX_ZOOM);
  const groups = groupOverlappingPins(pins, zoom);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const openGroup = groups.find(g => g.id === openGroupId && g.pins.length > 1) ?? null;
  const pinButtons = useRef(new Map<string, HTMLButtonElement>());
  const [popupLayout, setPopupLayout] = useState<ReturnType<typeof pinPopupLayout>>({
    anchor: 'top',
    maxHeight: undefined,
  });

  // Closing the card popup hands focus back to the pin that opened it.
  const closeCardPopup = () => {
    if (activeId) {
      pinButtons.current.get(activeId)?.focus();
    }
    setActiveId(null);
  };

  // Esc inside the card popup or a group's list closes only that popup, wherever
  // the map sits. A window capture listener runs before Radix's document-level
  // Escape handler, and a handled (default-prevented) Escape stops any enclosing
  // dialog from closing too. Esc from portalled content, such as the card's open
  // actions menu, is outside the popup and left to that content.
  const popupRef = useRef<HTMLDivElement>(null);
  const hasCardPopup = Boolean(renderPinCard);
  const openerId = openGroupId ?? (hasCardPopup ? activeId : null);
  useEffect(() => {
    if (!openerId) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && e.target instanceof Node && popupRef.current?.contains(e.target)) {
        e.preventDefault();
        pinButtons.current.get(openerId)?.focus();
        setOpenGroupId(null);
        setActiveId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [openerId]);

  // Zooming onto a group replaces its pin with its members' pins; focus then moves
  // to the first of them, so a keyboard user carries on from where they were.
  const focusAfterZoom = useRef<string | null>(null);
  useEffect(() => {
    const id = focusAfterZoom.current;
    if (id) {
      focusAfterZoom.current = null;
      pinButtons.current.get(id)?.focus();
    }
  }, [zoom]);

  // A group whose pins a closer zoom separates is zoomed onto; one whose pins
  // share a spot no zoom separates opens a list of them instead.
  const zoomOrListGroup = (group: ContributorMapPinGroup) => {
    setActiveId(null);
    if (canZoomApart(group)) {
      userMovedMap.current = true;
      focusAfterZoom.current = group.pins[0].id;
      mapRef.current?.fitBounds(pinBounds(group.pins), { padding: GROUP_ZOOM_PADDING, maxZoom: MAX_ZOOM });
      return;
    }
    setOpenGroupId(group.id);
    setPopupLayout(pinPopupLayout(mapRef.current, group.pins[0]));
  };

  const openPin = (pin: ContributorMapPin) => {
    setOpenGroupId(null);
    setActiveId(pin.id);
    if (renderPinCard) {
      setPopupLayout(pinPopupLayout(mapRef.current, pin));
    }
  };

  const mapRef = useRef<MapRef>(null);
  // Latest pins + fixedView, read inside the fit effect without making them
  // dependencies (we re-fit on `fitKey`, not on every pin change — so searching
  // doesn't re-zoom).
  const pinsRef = useRef(pins);
  pinsRef.current = pins;
  const fixedViewRef = useRef(fixedView);
  fixedViewRef.current = fixedView;
  const isFirstFit = useRef(true);
  // The map frames itself on its own once, on its first pins. It never moves by
  // itself after that, nor once the user has moved it: a refetch or a late load
  // must not zoom out of where the user is looking.
  const hasFramedPins = useRef(pins.length > 0);
  const userMovedMap = useRef(false);

  // Re-frame the already-mounted map to the resolved view. `initialViewState`
  // only applies on mount, so every post-mount change must move the map here.
  // Reads the latest pins/fixedView from refs (above), so it is never stale.
  const reframe = () => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const view = resolveView(fixedViewRef.current, pinsRef.current);
    if ('bounds' in view) {
      map.fitBounds(view.bounds, view.fitBoundsOptions);
    } else {
      map.easeTo({ center: [view.longitude, view.latitude], zoom: view.zoom });
    }
  };

  useEffect(() => {
    // `initialViewState` already positioned the map on mount; skip that first
    // run and only re-fit on subsequent dataset changes (e.g. type switch). When
    // a valid fixed view is set, resolveView keeps it instead of re-fitting to
    // the new type's pin bounds.
    if (isFirstFit.current) {
      isFirstFit.current = false;
      return;
    }
    reframe();
  }, [fitKey]);

  const hasPins = pins.length > 0;
  useEffect(() => {
    if (!hasPins || hasFramedPins.current) {
      return;
    }
    hasFramedPins.current = true;
    if (!userMovedMap.current) {
      reframe();
    }
  }, [hasPins]);

  // Re-frame live when the stored fixed view itself changes. An
  // admin saving a new view (or resetting to automatic) updates `fixedView`
  // after the map is already mounted — without this the change would only show
  // after a page reload. Keyed on the view's identity so free panning/searching
  // (which leaves `fixedView` untouched) never triggers a re-frame.
  const fixedViewKey = fixedView ? `${fixedView.longitude},${fixedView.latitude},${fixedView.zoom}` : 'auto';
  const isFirstViewSync = useRef(true);
  useEffect(() => {
    if (isFirstViewSync.current) {
      isFirstViewSync.current = false;
      return;
    }
    reframe();
  }, [fixedViewKey]);

  // Report the current camera to the capture control.
  const handleViewChange = () => {
    const map = mapRef.current;
    if (!onViewChange || !map) return;
    const center = map.getCenter();
    onViewChange({ longitude: center.lng, latitude: center.lat, zoom: map.getZoom() });
  };

  return (
    <section
      className={cn('h-96 w-full overflow-hidden rounded-lg border border-border', className)}
      aria-label={ariaLabel}
    >
      <MapLibreMap
        ref={mapRef}
        initialViewState={resolveView(fixedView, pins)}
        mapStyle={POSITRON_STYLE}
        style={{ width: '100%', height: '100%' }}
        // Disable the default (expanded) control and add an explicit COMPACT one;
        // `onLoad` then collapses it so the attribution starts as a small "ⓘ"
        // toggle in the corner (license-required attribution is kept, not removed).
        attributionControl={false}
        onLoad={e => {
          collapseAttribution(e.target);
          setZoom(e.target.getZoom());
          handleViewChange();
        }}
        onMoveEnd={handleViewChange}
        // Only a user's own pan or zoom carries the DOM event behind it.
        onMoveStart={e => {
          if (e.originalEvent) {
            userMovedMap.current = true;
          }
        }}
        onZoomEnd={e => setZoom(e.viewState.zoom)}
      >
        <AttributionControl compact={true} position="bottom-right" />
        {groups.map(group => {
          const [first] = group.pins;
          const isGroup = group.pins.length > 1;
          const opensList = isGroup && !canZoomApart(group);
          return (
            <Marker
              key={group.id}
              longitude={first.longitude}
              latitude={first.latitude}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                if (isGroup) {
                  zoomOrListGroup(group);
                } else {
                  openPin(first);
                }
              }}
            >
              <button
                type="button"
                // Every pin of a group is reached through the group's button, so focus
                // returns here whether its list or one of its cards closes.
                ref={el => {
                  if (!el) {
                    return;
                  }
                  for (const pin of group.pins) {
                    pinButtons.current.set(pin.id, el);
                  }
                  return () => {
                    for (const pin of group.pins) {
                      if (pinButtons.current.get(pin.id) === el) {
                        pinButtons.current.delete(pin.id);
                      }
                    }
                  };
                }}
                aria-label={
                  isGroup
                    ? t('contributorMap.pinGroup', {
                        count: group.pins.length,
                        names: group.pins.map(p => p.name).join(', '),
                      })
                    : first.name
                }
                aria-haspopup={opensList ? 'dialog' : undefined}
                className={cn(
                  'block transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isGroup ? 'rounded-full' : 'rounded-md'
                )}
              >
                {isGroup ? (
                  // Same 48px footprint as an avatar pin, so popups and pans place it alike.
                  <span
                    aria-hidden="true"
                    className="flex size-12 items-center justify-center rounded-full border-2 border-card bg-primary text-card-title text-primary-foreground shadow-md"
                  >
                    {group.pins.length}
                  </span>
                ) : (
                  <PinAvatar pin={first} className="size-12 rounded-md border-2 border-card shadow-md" />
                )}
              </button>
            </Marker>
          );
        })}

        {openGroup && (
          <Popup
            // Its own key: a card popup keyed by the same pin id must mount anew, not
            // take over this popup, or maplibre never opens (and focuses) the card.
            key={`group-${openGroup.id}`}
            longitude={openGroup.pins[0].longitude}
            latitude={openGroup.pins[0].latitude}
            anchor={popupLayout.anchor}
            offset={PIN_POPUP_OFFSET[popupLayout.anchor]}
            closeButton={false}
            closeOnClick={false}
            onClose={() => setOpenGroupId(null)}
            onOpen={e =>
              requestAnimationFrame(() =>
                panPinPopupIntoView(mapRef.current, e.target.getElement(), pinButtons.current.get(openGroup.id))
              )
            }
            className="[&_.maplibregl-popup-content]:rounded-lg! [&_.maplibregl-popup-content]:bg-transparent! [&_.maplibregl-popup-content]:p-0! [&_.maplibregl-popup-content]:shadow-none!"
          >
            {/* maplibre focuses the first contributor on open (`focusAfterOpen`). */}
            <div
              ref={popupRef}
              role="dialog"
              aria-label={t('contributorMap.pinGroupList', { count: openGroup.pins.length })}
              style={popupHeightStyle(popupLayout)}
              className="max-h-[min(18rem,60vh)] w-60 overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-md"
            >
              {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
              {/* biome-ignore lint/a11y/useSemanticElements: role="list" restores semantics after Tailwind reset */}
              <ul role="list" className="flex flex-col">
                {openGroup.pins.map(pin => (
                  <li key={pin.id}>
                    <button
                      type="button"
                      onClick={() => openPin(pin)}
                      className="flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <PinAvatar pin={pin} className="size-8 rounded-md" />
                      <span className="min-w-0">
                        <span className="block truncate text-card-title text-foreground">{pin.name}</span>
                        {pin.roleLabel && (
                          <span className="block truncate text-caption text-muted-foreground">{pin.roleLabel}</span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </Popup>
        )}

        {active && renderPinCard && (
          <Popup
            key={active.id}
            longitude={active.longitude}
            latitude={active.latitude}
            anchor={popupLayout.anchor}
            offset={PIN_POPUP_OFFSET[popupLayout.anchor]}
            maxWidth={CARD_POPUP_MAX_WIDTH}
            closeButton={false}
            closeOnClick={false}
            onClose={() => setActiveId(null)}
            onOpen={e =>
              requestAnimationFrame(() =>
                panPinPopupIntoView(mapRef.current, e.target.getElement(), pinButtons.current.get(active.id))
              )
            }
            // maplibre-gl.css is unlayered, so it beats the layered Tailwind utilities
            // whatever their specificity: `!` is needed to clear its white padded frame.
            className="w-full [&_.maplibregl-popup-content]:rounded-lg! [&_.maplibregl-popup-content]:bg-transparent! [&_.maplibregl-popup-content]:p-0! [&_.maplibregl-popup-content]:shadow-none!"
          >
            {/* Non-modal dialog: on open maplibre (`focusAfterOpen`, on by
                default) focuses its first focusable element, the close button;
                Esc and the close button close it. React mounts this content
                in a detached container that the popup only attaches after
                render, so focusing from a ref here would do nothing. The
                popup lives outside maplibre's canvas
                container, so pointer and key events inside it never reach the
                map's pan/zoom handlers. */}
            <div
              ref={popupRef}
              role="dialog"
              aria-label={active.name}
              style={popupHeightStyle(popupLayout)}
              className="max-h-[min(18rem,60vh)] overflow-y-auto rounded-lg border border-border bg-card shadow-md focus-visible:outline-none"
            >
              <div className="flex justify-end px-1 pt-1">
                <button
                  type="button"
                  aria-label={t('close')}
                  onClick={closeCardPopup}
                  className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              {renderPinCard(active.id)}
            </div>
          </Popup>
        )}

        {active && !renderPinCard && (
          <Popup
            longitude={active.longitude}
            latitude={active.latitude}
            anchor="top"
            offset={12}
            onClose={() => setActiveId(null)}
            closeOnClick={false}
            className="[&_.maplibregl-popup-content]:rounded-lg [&_.maplibregl-popup-content]:border [&_.maplibregl-popup-content]:border-border [&_.maplibregl-popup-content]:bg-card [&_.maplibregl-popup-content]:p-3 [&_.maplibregl-popup-content]:shadow-md"
          >
            <div className="flex items-center gap-2">
              <Avatar className="size-8 border border-border">
                {active.avatarUrl && <AvatarImage src={active.avatarUrl} alt={active.name} />}
                <AvatarFallback className="text-caption">{active.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                {active.href ? (
                  <a
                    href={active.href}
                    onClick={e => {
                      if (onPinClick) {
                        e.preventDefault();
                        onPinClick(active.href as string);
                      }
                    }}
                    className="block truncate text-card-title text-foreground hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {active.name}
                  </a>
                ) : (
                  <span className="block text-card-title text-foreground truncate">{active.name}</span>
                )}
                {active.roleLabel && <p className="text-caption text-muted-foreground truncate">{active.roleLabel}</p>}
              </div>
            </div>
          </Popup>
        )}
      </MapLibreMap>
    </section>
  );
}
