import 'maplibre-gl/dist/maplibre-gl.css';
import { useState } from 'react';
import { Map as MapLibreMap, Marker, Popup } from 'react-map-gl/maplibre';
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

// A neutral world-ish default view; the map fits its content via `initialViewState`
// centered on the first pin (or 0/0 when empty).
function initialView(pins: ContributorMapPin[]) {
  const first = pins[0];
  return {
    longitude: first?.longitude ?? 0,
    latitude: first?.latitude ?? 20,
    zoom: first ? 2.5 : 1,
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
        attributionControl={{ compact: true }}
      >
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
              className="flex size-7 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar className="size-6">
                {pin.avatarUrl && <AvatarImage src={pin.avatarUrl} alt="" />}
                <AvatarFallback className="text-[10px]">{pin.name.charAt(0).toUpperCase()}</AvatarFallback>
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
