/**
 * ContributorMap — unit specs for the fixed-view helpers.
 *
 * Tests the exported pure functions `isRenderableMapView` and `resolveView`
 * without mounting the full MapLibre component (which requires WebGL + canvas
 * not available in jsdom).
 *
 * Guard matrix: invalid values fall back to initialView(pins);
 * valid values (incl. boundary values) are used verbatim.
 *
 * AUTO matrix: when fixedView is absent/null/invalid, resolveView output
 * deep-equals initialView(pins) for the 0-pin, 1-pin, and ≥2-pin cases.
 *
 * Re-frame target: with a valid fixedView, the fitKey path yields the fixed
 * camera (delegated — resolveView returns the fixed view object directly).
 */
import { describe, expect, test } from 'vitest';
import type { ContributorMapPin } from './ContributorMap';
import { isRenderableMapView, resolveView } from './ContributorMap';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePin(id: string, lat: number, lng: number): ContributorMapPin {
  return { id, name: id, latitude: lat, longitude: lng };
}

const EUROPE_VIEW = { longitude: 10, latitude: 50, zoom: 3.5 };

// ---------------------------------------------------------------------------
// isRenderableMapView — guard matrix
// ---------------------------------------------------------------------------

describe('isRenderableMapView — guard matrix', () => {
  test('null → false', () => expect(isRenderableMapView(null)).toBe(false));
  test('undefined → false', () => expect(isRenderableMapView(undefined)).toBe(false));

  // NaN values
  test('NaN latitude → false', () => expect(isRenderableMapView({ latitude: NaN, longitude: 0, zoom: 5 })).toBe(false));
  test('NaN longitude → false', () =>
    expect(isRenderableMapView({ latitude: 0, longitude: NaN, zoom: 5 })).toBe(false));
  test('NaN zoom → false', () => expect(isRenderableMapView({ latitude: 0, longitude: 0, zoom: NaN })).toBe(false));

  // Infinity values
  test('Infinity latitude → false', () =>
    expect(isRenderableMapView({ latitude: Infinity, longitude: 0, zoom: 5 })).toBe(false));
  test('-Infinity longitude → false', () =>
    expect(isRenderableMapView({ latitude: 0, longitude: -Infinity, zoom: 5 })).toBe(false));
  test('Infinity zoom → false', () =>
    expect(isRenderableMapView({ latitude: 0, longitude: 0, zoom: Infinity })).toBe(false));

  // Out-of-range latitude
  test('latitude = 91 → false (crash bound)', () =>
    expect(isRenderableMapView({ latitude: 91, longitude: 0, zoom: 5 })).toBe(false));
  test('latitude = -91 → false', () =>
    expect(isRenderableMapView({ latitude: -91, longitude: 0, zoom: 5 })).toBe(false));

  // Out-of-range longitude
  test('longitude = 200 → false', () =>
    expect(isRenderableMapView({ latitude: 0, longitude: 200, zoom: 5 })).toBe(false));
  test('longitude = -200 → false', () =>
    expect(isRenderableMapView({ latitude: 0, longitude: -200, zoom: 5 })).toBe(false));

  // Out-of-range zoom
  test('zoom = -5 → false', () => expect(isRenderableMapView({ latitude: 0, longitude: 0, zoom: -5 })).toBe(false));
  test('zoom = 23 → false', () => expect(isRenderableMapView({ latitude: 0, longitude: 0, zoom: 23 })).toBe(false));

  // Valid values including boundary values
  test('valid interior view → true', () =>
    expect(isRenderableMapView({ latitude: 52.37, longitude: 4.9, zoom: 10 })).toBe(true));
  test('boundary lat = 90 → true', () =>
    expect(isRenderableMapView({ latitude: 90, longitude: 0, zoom: 5 })).toBe(true));
  test('boundary lat = -90 → true', () =>
    expect(isRenderableMapView({ latitude: -90, longitude: 0, zoom: 5 })).toBe(true));
  test('boundary lng = 180 → true', () =>
    expect(isRenderableMapView({ latitude: 0, longitude: 180, zoom: 5 })).toBe(true));
  test('boundary lng = -180 → true', () =>
    expect(isRenderableMapView({ latitude: 0, longitude: -180, zoom: 5 })).toBe(true));
  test('boundary zoom = 0 → true', () =>
    expect(isRenderableMapView({ latitude: 0, longitude: 0, zoom: 0 })).toBe(true));
  test('boundary zoom = 22 → true', () =>
    expect(isRenderableMapView({ latitude: 0, longitude: 0, zoom: 22 })).toBe(true));
});

// ---------------------------------------------------------------------------
// resolveView — AUTO matrix: absent/null/invalid fixedView
// ---------------------------------------------------------------------------

describe('resolveView — AUTO matrix: no fixed view', () => {
  test('0 pins: falls back to EUROPE_VIEW', () => {
    const result = resolveView(undefined, []);
    expect(result).toEqual(EUROPE_VIEW);
  });

  test('1 pin: falls back to center-on-pin view', () => {
    const result = resolveView(null, [makePin('p1', 52.0, 5.0)]);
    expect(result).toEqual({ latitude: 52.0, longitude: 5.0, zoom: 7 });
  });

  test('2 pins: falls back to bounds view', () => {
    const result = resolveView(undefined, [makePin('p1', 40, 0), makePin('p2', 50, 10)]);
    expect('bounds' in result).toBe(true);
  });

  test('null fixedView + 0 pins → EUROPE_VIEW', () => {
    expect(resolveView(null, [])).toEqual(EUROPE_VIEW);
  });

  test('invalid fixedView (lat 91) + 0 pins → EUROPE_VIEW', () => {
    const invalid = { latitude: 91, longitude: 0, zoom: 5 };
    expect(resolveView(invalid, [])).toEqual(EUROPE_VIEW);
  });

  test('invalid fixedView (zoom -1) + 1 pin → auto center', () => {
    const invalid = { latitude: 52, longitude: 5, zoom: -1 };
    const result = resolveView(invalid, [makePin('p1', 52.0, 5.0)]);
    expect(result).toEqual({ latitude: 52.0, longitude: 5.0, zoom: 7 });
  });
});

// ---------------------------------------------------------------------------
// resolveView — fixed view takes precedence when valid
// ---------------------------------------------------------------------------

describe('resolveView — fixed view used when valid', () => {
  const fixed = { latitude: 52.37, longitude: 4.9, zoom: 10 };

  test('valid fixedView with 0 pins → fixed view (not EUROPE_VIEW)', () => {
    expect(resolveView(fixed, [])).toEqual(fixed);
  });

  test('valid fixedView with 1 pin → fixed view (not auto-center)', () => {
    expect(resolveView(fixed, [makePin('p1', 0, 0)])).toEqual(fixed);
  });

  test('valid fixedView with ≥2 pins → fixed view (not bounds)', () => {
    const result = resolveView(fixed, [makePin('p1', 40, 0), makePin('p2', 60, 20)]);
    expect(result).toEqual(fixed);
    expect('bounds' in result).toBe(false);
  });

  test('boundary values used verbatim: lat=90 lng=180 zoom=22', () => {
    const boundary = { latitude: 90, longitude: 180, zoom: 22 };
    expect(resolveView(boundary, [])).toEqual(boundary);
  });

  test('boundary values used verbatim: lat=-90 lng=-180 zoom=0', () => {
    const boundary = { latitude: -90, longitude: -180, zoom: 0 };
    expect(resolveView(boundary, [])).toEqual(boundary);
  });
});

// ---------------------------------------------------------------------------
// resolveView — re-frame target delegation
// Valid fixedView → resolveView returns the fixed camera, not pins' bounds.
// ---------------------------------------------------------------------------

describe('resolveView — re-frame target (fitKey delegation)', () => {
  test('with valid fixedView the result is NOT a bounds object', () => {
    const fixed = { latitude: 52.37, longitude: 4.9, zoom: 10 };
    const pins = [makePin('p1', 40, 0), makePin('p2', 80, 50)]; // wide spread
    const result = resolveView(fixed, pins);
    // If automatic, this would be a bounds object; fixed view is a center+zoom.
    expect('bounds' in result).toBe(false);
    expect(result).toEqual(fixed);
  });

  test('without fixedView the result IS a bounds object for 2+ pins', () => {
    const pins = [makePin('p1', 40, 0), makePin('p2', 80, 50)];
    const result = resolveView(undefined, pins);
    expect('bounds' in result).toBe(true);
  });
});
