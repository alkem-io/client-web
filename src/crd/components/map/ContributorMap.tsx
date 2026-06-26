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

export default function ContributorMap({ pins, ariaLabel, fitKey, onPinClick, className }: ContributorMapProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = pins.find(p => p.id === activeId) ?? null;

  const mapRef = useRef<MapRef>(null);
  // Latest pins, read inside the fit effect without making it a dependency (we
  // re-fit on `fitKey`, not on every pin change — so searching doesn't re-zoom).
  const pinsRef = useRef(pins);
  pinsRef.current = pins;
  const isFirstFit = useRef(true);

  useEffect(() => {
    // `initialViewState` already positioned the map on mount; skip that first
    // run and only re-fit on subsequent dataset changes (e.g. type switch).
    if (isFirstFit.current) {
      isFirstFit.current = false;
      return;
    }
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const view = initialView(pinsRef.current);
    if ('bounds' in view) {
      map.fitBounds(view.bounds, view.fitBoundsOptions);
    } else {
      map.easeTo({ center: [view.longitude, view.latitude], zoom: view.zoom });
    }
  }, [fitKey]);

  return (
    <section
      className={cn('h-96 w-full overflow-hidden rounded-lg border border-border', className)}
      aria-label={ariaLabel}
    >
      <MapLibreMap
        ref={mapRef}
        initialViewState={initialView(pins)}
        mapStyle={POSITRON_STYLE}
        style={{ width: '100%', height: '100%' }}
        // Disable the default (expanded) control and add an explicit COMPACT one;
        // `onLoad` then collapses it so the attribution starts as a small "ⓘ"
        // toggle in the corner (license-required attribution is kept, not removed).
        attributionControl={false}
        onLoad={e => collapseAttribution(e.target)}
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
