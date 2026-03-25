// Netherlands map data with simplified province outlines and Mercator projection
// All coordinates are [longitude, latitude] pairs

// --- Bounding box ---
export const NL_BOUNDS = {
  minLat: 50.70,
  maxLat: 53.60,
  minLng: 3.10,
  maxLng: 7.35,
};

// --- Mercator projection ---
// Both axes must be in radians for correct aspect ratio
const DEG2RAD = Math.PI / 180;
const mercX = (lng: number) => lng * DEG2RAD;
const mercY = (lat: number) =>
  Math.log(Math.tan(Math.PI / 4 + (lat * DEG2RAD) / 2));

export function projectToPixel(
  lat: number,
  lng: number,
  width: number,
  height: number,
  padding: number = 60
): { x: number; y: number } {
  const mapW = width - padding * 2;
  const mapH = height - padding * 2;

  // Bounding box in Mercator (radians on both axes)
  const x0 = mercX(NL_BOUNDS.minLng);
  const x1 = mercX(NL_BOUNDS.maxLng);
  const y0 = mercY(NL_BOUNDS.minLat);
  const y1 = mercY(NL_BOUNDS.maxLat);

  // Uniform scale preserving aspect ratio
  const scaleX = mapW / (x1 - x0);
  const scaleY = mapH / (y1 - y0);
  const scale = Math.min(scaleX, scaleY);

  // Center the map within the available area
  const offsetX = padding + (mapW - (x1 - x0) * scale) / 2;
  const offsetY = padding + (mapH - (y1 - y0) * scale) / 2;

  return {
    x: offsetX + (mercX(lng) - x0) * scale,
    y: offsetY + (y1 - mercY(lat)) * scale,
  };
}

// Convert [lng, lat][] polygon to SVG path
export function coordsToPath(
  coords: [number, number][],
  w: number,
  h: number,
  padding?: number,
  close = true
): string {
  return (
    coords
      .map((c, i) => {
        const { x, y } = projectToPixel(c[1], c[0], w, h, padding);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ') + (close ? ' Z' : '')
  );
}

// --- Simplified province polygons ---
// Each province is an array of [lng, lat] coordinate rings
// Simplified to ~8-20 vertices per province for clean rendering

export interface ProvinceData {
  id: string;
  name: string;
  coords: [number, number][];
  center: [number, number]; // [lng, lat] for label placement
}

export const PROVINCES: ProvinceData[] = [
  {
    id: 'groningen',
    name: 'Groningen',
    center: [6.62, 53.22],
    coords: [
      [6.20, 53.40], [6.33, 53.40], [6.55, 53.44], [6.85, 53.46],
      [7.21, 53.33], [7.09, 53.24], [7.06, 53.00], [6.70, 52.98],
      [6.38, 53.08], [6.20, 53.17], [6.20, 53.40],
    ],
  },
  {
    id: 'friesland',
    name: 'Friesland',
    center: [5.72, 53.10],
    coords: [
      [5.00, 53.06], [5.10, 53.12], [5.40, 53.18], [5.75, 53.26],
      [6.05, 53.38], [6.20, 53.40], [6.20, 53.17], [6.38, 53.08],
      [6.20, 52.98], [5.90, 52.86], [5.55, 52.78], [5.33, 52.82],
      [5.08, 52.93], [5.00, 53.06],
    ],
  },
  {
    id: 'drenthe',
    name: 'Drenthe',
    center: [6.55, 52.85],
    coords: [
      [6.20, 52.98], [6.70, 52.98], [7.06, 53.00], [6.95, 52.73],
      [6.85, 52.62], [6.55, 52.60], [6.25, 52.68], [6.10, 52.78],
      [5.90, 52.86], [6.20, 52.98],
    ],
  },
  {
    id: 'overijssel',
    name: 'Overijssel',
    center: [6.40, 52.43],
    coords: [
      [5.55, 52.78], [5.90, 52.86], [6.10, 52.78], [6.25, 52.68],
      [6.55, 52.60], [6.85, 52.62], [7.07, 52.60], [7.07, 52.40],
      [6.95, 52.24], [6.86, 52.13], [6.40, 52.12], [6.10, 52.18],
      [5.80, 52.25], [5.60, 52.40], [5.55, 52.55], [5.55, 52.78],
    ],
  },
  {
    id: 'flevoland',
    name: 'Flevoland',
    center: [5.42, 52.45],
    coords: [
      [5.08, 52.37], [5.10, 52.52], [5.18, 52.60], [5.33, 52.82],
      [5.55, 52.78], [5.55, 52.55], [5.60, 52.40], [5.55, 52.30],
      [5.30, 52.28], [5.08, 52.37],
    ],
  },
  {
    id: 'gelderland',
    name: 'Gelderland',
    center: [5.90, 52.02],
    coords: [
      [5.60, 52.40], [5.80, 52.25], [6.10, 52.18], [6.40, 52.12],
      [6.86, 52.13], [7.07, 51.97], [6.83, 51.84], [6.42, 51.84],
      [6.17, 51.84], [5.93, 51.82], [5.58, 51.82], [5.30, 51.82],
      [5.05, 51.84], [5.02, 51.96], [5.05, 52.05], [5.10, 52.15],
      [5.20, 52.25], [5.30, 52.28], [5.55, 52.30], [5.60, 52.40],
    ],
  },
  {
    id: 'utrecht',
    name: 'Utrecht',
    center: [5.10, 52.08],
    coords: [
      [4.78, 52.08], [4.78, 52.17], [4.90, 52.26], [5.08, 52.37],
      [5.30, 52.28], [5.20, 52.25], [5.10, 52.15], [5.05, 52.05],
      [5.02, 51.96], [4.95, 51.94], [4.78, 52.00], [4.78, 52.08],
    ],
  },
  {
    id: 'noord-holland',
    name: 'Noord-Holland',
    center: [4.85, 52.55],
    coords: [
      [4.55, 52.18], [4.44, 52.37], [4.50, 52.47], [4.55, 52.58],
      [4.63, 52.68], [4.73, 52.80], [4.78, 52.93], [5.00, 53.06],
      [5.08, 52.93], [5.10, 52.77], [5.10, 52.52], [5.08, 52.37],
      [4.90, 52.26], [4.78, 52.17], [4.78, 52.08], [4.65, 52.14],
      [4.55, 52.18],
    ],
  },
  {
    id: 'zuid-holland',
    name: 'Zuid-Holland',
    center: [4.45, 52.00],
    coords: [
      [3.85, 51.75], [4.06, 51.87], [4.12, 52.04], [4.25, 52.08],
      [4.42, 52.15], [4.55, 52.18], [4.65, 52.14], [4.78, 52.08],
      [4.78, 52.00], [4.95, 51.94], [5.02, 51.96], [5.05, 51.84],
      [4.80, 51.80], [4.50, 51.82], [4.30, 51.78], [4.10, 51.72],
      [3.85, 51.75],
    ],
  },
  {
    id: 'zeeland',
    name: 'Zeeland',
    center: [3.78, 51.48],
    coords: [
      [3.36, 51.37], [3.38, 51.42], [3.58, 51.47], [3.72, 51.52],
      [3.85, 51.75], [4.10, 51.72], [4.30, 51.78], [4.38, 51.72],
      [4.28, 51.53], [4.25, 51.40], [4.02, 51.42], [3.72, 51.38],
      [3.50, 51.38], [3.36, 51.37],
    ],
  },
  {
    id: 'noord-brabant',
    name: 'Noord-Brabant',
    center: [5.10, 51.56],
    coords: [
      [4.25, 51.40], [4.28, 51.53], [4.38, 51.72], [4.50, 51.82],
      [4.80, 51.80], [5.05, 51.84], [5.30, 51.82], [5.58, 51.82],
      [5.93, 51.82], [5.97, 51.70], [5.96, 51.47], [5.80, 51.42],
      [5.52, 51.42], [5.22, 51.38], [5.07, 51.27], [4.80, 51.27],
      [4.48, 51.36], [4.25, 51.40],
    ],
  },
  {
    id: 'limburg',
    name: 'Limburg',
    center: [5.88, 51.22],
    coords: [
      [5.93, 51.82], [6.17, 51.84], [6.42, 51.84], [6.17, 51.72],
      [6.08, 51.65], [5.96, 51.47], [5.97, 51.25], [6.02, 51.18],
      [5.94, 51.04], [5.82, 50.76], [5.70, 50.76], [5.48, 50.75],
      [5.22, 51.00], [5.07, 51.27], [5.22, 51.38], [5.52, 51.42],
      [5.80, 51.42], [5.96, 51.47], [5.97, 51.70], [5.93, 51.82],
    ],
  },
];

// --- IJsselmeer / Markermeer water body ---
export const IJSSELMEER: [number, number][] = [
  [4.88, 52.42], [4.82, 52.55], [4.82, 52.65], [4.85, 52.72],
  [4.95, 52.78], [5.00, 52.82], [5.06, 52.87], [5.08, 52.93],
  [5.00, 53.06], [5.08, 52.93], [5.10, 52.77], [5.10, 52.52],
  [5.08, 52.37], [5.00, 52.37], [4.88, 52.42],
];

// --- Major cities ---
export interface CityData {
  name: string;
  lat: number;
  lng: number;
  capital?: boolean; // for Amsterdam
}

export const CITIES: CityData[] = [
  { name: 'Amsterdam', lat: 52.37, lng: 4.90, capital: true },
  { name: 'Rotterdam', lat: 51.92, lng: 4.48 },
  { name: 'Den Haag', lat: 52.08, lng: 4.30 },
  { name: 'Utrecht', lat: 52.09, lng: 5.12 },
  { name: 'Eindhoven', lat: 51.44, lng: 5.47 },
  { name: 'Groningen', lat: 53.22, lng: 6.57 },
  { name: 'Delft', lat: 52.01, lng: 4.36 },
  { name: 'Wageningen', lat: 51.97, lng: 5.67 },
  { name: 'Enschede', lat: 52.22, lng: 6.90 },
  { name: 'Maastricht', lat: 50.85, lng: 5.69 },
  { name: 'Breda', lat: 51.59, lng: 4.78 },
  { name: 'Arnhem', lat: 51.98, lng: 5.91 },
];

// --- Organization headquarters locations ---
// Maps org IDs to their real-world headquarters
export const ORG_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  'tu-delft': { lat: 52.00, lng: 4.37 },         // Delft
  'philips-health': { lat: 51.44, lng: 5.47 },    // Eindhoven
  'tno': { lat: 52.08, lng: 4.31 },               // The Hague
  'ns-railways': { lat: 52.09, lng: 5.11 },       // Utrecht
  'postnl': { lat: 52.07, lng: 4.27 },            // The Hague
  'eneco': { lat: 51.92, lng: 4.48 },             // Rotterdam
  'shell-ventures': { lat: 52.08, lng: 4.30 },    // The Hague
  'gemeente-adam': { lat: 52.37, lng: 4.90 },     // Amsterdam
  'rabobank': { lat: 52.09, lng: 5.11 },          // Utrecht
};