import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';
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
   * A value that changes when the underlying dataset changes (e.g. the active
   * contributor type or its loaded set) — the map re-fits to the new pins when
   * it changes. `initialViewState` only applies on mount, so without this the
   * view would stay frozen on the first type's bounds.
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
  className?: string;
};

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
 * Feeds BOTH the mount `initialViewState` AND the `fitKey` effect re-frame.
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

export default function ContributorMap({
  pins,
  ariaLabel,
  fitKey,
  fixedView,
  onViewChange,
  onPinClick,
  className,
}: ContributorMapProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = pins.find(p => p.id === activeId) ?? null;

  const mapRef = useRef<MapRef>(null);
  // Latest pins + fixedView, read inside the fit effect without making them
  // dependencies (we re-fit on `fitKey`, not on every pin change — so searching
  // doesn't re-zoom).
  const pinsRef = useRef(pins);
  pinsRef.current = pins;
  const fixedViewRef = useRef(fixedView);
  fixedViewRef.current = fixedView;
  const isFirstFit = useRef(true);

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
          handleViewChange();
        }}
        onMoveEnd={handleViewChange}
      >
        <AttributionControl compact={true} position="bottom-right" />
        {pins.map(pin => (
          <Marker
            key={pin.id}
            longitude={pin.longitude}
            latitude={pin.latitude}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setActiveId(pin.id);
            }}
          >
            <button
              type="button"
              aria-label={pin.name}
              className="block rounded-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Avatar className="size-12 rounded-md border-2 border-card shadow-md">
                {pin.avatarUrl && <AvatarImage src={pin.avatarUrl} alt="" className="object-cover" />}
                <AvatarFallback className="rounded-md bg-primary text-body text-primary-foreground">
                  {pin.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </Marker>
        ))}

        {active && (
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
