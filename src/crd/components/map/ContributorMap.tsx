import 'maplibre-gl/dist/maplibre-gl.css';
import { useState } from 'react';
import { AttributionControl, Map as MapLibreMap, Marker, Popup } from 'react-map-gl/maplibre';
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
  onPinClick?: (href: string) => void;
  className?: string;
};

// Default to a Europe-centred view when there are no plottable pins; when there
// are, fit the map to their bounds (single pin → centre on it). The view is only
// the INITIAL state — the user can pan/zoom freely afterwards.
const EUROPE_VIEW = { longitude: 10, latitude: 50, zoom: 3.5 } as const;

function initialView(pins: ContributorMapPin[]) {
  if (pins.length === 0) {
    return EUROPE_VIEW;
  }
  if (pins.length === 1) {
    return { longitude: pins[0].longitude, latitude: pins[0].latitude, zoom: 5 };
  }
  const longitudes = pins.map(p => p.longitude);
  const latitudes = pins.map(p => p.latitude);
  return {
    bounds: [
      [Math.min(...longitudes), Math.min(...latitudes)],
      [Math.max(...longitudes), Math.max(...latitudes)],
    ] as [[number, number], [number, number]],
    fitBoundsOptions: { padding: 48, maxZoom: 6 },
  };
}

export default function ContributorMap({ pins, ariaLabel, onPinClick, className }: ContributorMapProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = pins.find(p => p.id === activeId) ?? null;

  return (
    <section
      className={cn('h-96 w-full overflow-hidden rounded-lg border border-border', className)}
      aria-label={ariaLabel}
    >
      <MapLibreMap
        initialViewState={initialView(pins)}
        mapStyle={POSITRON_STYLE}
        style={{ width: '100%', height: '100%' }}
        // Disable the default (expanded) control and add an explicit COMPACT one,
        // so the OpenStreetMap/OpenFreeMap attribution (license-required) is kept
        // but collapsed to a small "ⓘ" toggle in the corner.
        attributionControl={false}
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
