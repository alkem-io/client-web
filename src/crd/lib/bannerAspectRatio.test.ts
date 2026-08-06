import { describe, expect, it } from 'vitest';
import {
  bannerPlaceholderSize,
  DEFAULT_BANNER_ASPECT_RATIO,
  MAX_BANNER_ASPECT_RATIO,
  MIN_BANNER_ASPECT_RATIO,
  resolveBannerAspectRatio,
} from './bannerAspectRatio';

describe('bannerPlaceholderSize', () => {
  // The numbers themselves never reach the layout — the browser reads only
  // their ratio, via the UA sheet's `aspect-ratio: auto attr(width)/attr(height)`.
  it.each([MIN_BANNER_ASPECT_RATIO, 7.5, MAX_BANNER_ASPECT_RATIO, 1])('encodes ratio %s', ratio => {
    const { width, height } = bannerPlaceholderSize(ratio);
    expect(width / height).toBeCloseTo(ratio, 2);
  });

  it('produces integers, since these become HTML attributes', () => {
    const { width, height } = bannerPlaceholderSize(7.3);
    expect(Number.isInteger(width)).toBe(true);
    expect(Number.isInteger(height)).toBe(true);
  });

  it('never yields a zero height that would collapse the reserved box', () => {
    expect(bannerPlaceholderSize(100_000).height).toBeGreaterThan(0);
  });

  it('reserves a shorter box for a wider ratio', () => {
    expect(bannerPlaceholderSize(10).height).toBeLessThan(bannerPlaceholderSize(6).height);
  });
});

describe('resolveBannerAspectRatio', () => {
  it('returns what the server stored, unclamped', () => {
    expect(resolveBannerAspectRatio(MIN_BANNER_ASPECT_RATIO)).toBe(MIN_BANNER_ASPECT_RATIO);
    expect(resolveBannerAspectRatio(MAX_BANNER_ASPECT_RATIO)).toBe(MAX_BANNER_ASPECT_RATIO);
    expect(resolveBannerAspectRatio(7.5)).toBe(7.5);
  });

  // The local MIN/MAX are a loading-time fallback for the editor, not a render
  // rule: ops can widen the range in platform config, and a read path that
  // clamped would reserve a differently-shaped box than the image really is.
  it('does not clamp a value outside the local fallback bounds', () => {
    expect(resolveBannerAspectRatio(4)).toBe(4);
    expect(resolveBannerAspectRatio(12)).toBe(12);
  });

  it('falls back to the default for missing or unusable values', () => {
    expect(resolveBannerAspectRatio(undefined)).toBe(DEFAULT_BANNER_ASPECT_RATIO);
    expect(resolveBannerAspectRatio(null)).toBe(DEFAULT_BANNER_ASPECT_RATIO);
    expect(resolveBannerAspectRatio(0)).toBe(DEFAULT_BANNER_ASPECT_RATIO);
    expect(resolveBannerAspectRatio(Number.NaN)).toBe(DEFAULT_BANNER_ASPECT_RATIO);
    expect(resolveBannerAspectRatio(Number.POSITIVE_INFINITY)).toBe(DEFAULT_BANNER_ASPECT_RATIO);
  });
});
