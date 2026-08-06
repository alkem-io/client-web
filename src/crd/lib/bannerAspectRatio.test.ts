import { describe, expect, it } from 'vitest';
import {
  bannerPlaceholderSize,
  clampBannerAspectRatio,
  DEFAULT_BANNER_ASPECT_RATIO,
  MAX_BANNER_ASPECT_RATIO,
  MIN_BANNER_ASPECT_RATIO,
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

describe('clampBannerAspectRatio', () => {
  it('holds values inside the server bounds', () => {
    expect(clampBannerAspectRatio(4)).toBe(MIN_BANNER_ASPECT_RATIO);
    expect(clampBannerAspectRatio(12)).toBe(MAX_BANNER_ASPECT_RATIO);
    expect(clampBannerAspectRatio(7.5)).toBe(7.5);
  });

  it('falls back to the default for missing or unusable values', () => {
    expect(clampBannerAspectRatio(undefined)).toBe(DEFAULT_BANNER_ASPECT_RATIO);
    expect(clampBannerAspectRatio(0)).toBe(DEFAULT_BANNER_ASPECT_RATIO);
    expect(clampBannerAspectRatio(Number.NaN)).toBe(DEFAULT_BANNER_ASPECT_RATIO);
    expect(clampBannerAspectRatio(Number.POSITIVE_INFINITY)).toBe(DEFAULT_BANNER_ASPECT_RATIO);
  });
});
