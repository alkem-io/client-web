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
  const withImage = (aspectRatio: number | null | undefined) => ({ uri: 'https://cdn/banner.jpg', aspectRatio });

  it('returns what the server stored for an uploaded image, unclamped', () => {
    expect(resolveBannerAspectRatio(withImage(MIN_BANNER_ASPECT_RATIO))).toBe(MIN_BANNER_ASPECT_RATIO);
    expect(resolveBannerAspectRatio(withImage(MAX_BANNER_ASPECT_RATIO))).toBe(MAX_BANNER_ASPECT_RATIO);
    expect(resolveBannerAspectRatio(withImage(7.5))).toBe(7.5);
  });

  // The local MIN/MAX are a loading-time fallback for the editor, not a render
  // rule: ops can widen the range in platform config, and a read path that
  // clamped would reserve a differently-shaped box than the image really is.
  it('does not clamp a value outside the local fallback bounds', () => {
    expect(resolveBannerAspectRatio(withImage(4))).toBe(4);
    expect(resolveBannerAspectRatio(withImage(12))).toBe(12);
  });

  // The server stamps its row-creation default on every banner visual it
  // creates, image or not (10 today, 6 on legacy rows) — a stored ratio only
  // means anything once an image was actually cropped to it, so the no-image
  // gradient keeps the design default regardless of what the row says.
  it('ignores the stored ratio when the visual has no image', () => {
    expect(resolveBannerAspectRatio({ uri: null, aspectRatio: 6 })).toBe(DEFAULT_BANNER_ASPECT_RATIO);
    expect(resolveBannerAspectRatio({ uri: '', aspectRatio: 7.5 })).toBe(DEFAULT_BANNER_ASPECT_RATIO);
  });

  it('falls back to the default for missing or unusable values', () => {
    expect(resolveBannerAspectRatio(undefined)).toBe(DEFAULT_BANNER_ASPECT_RATIO);
    expect(resolveBannerAspectRatio(null)).toBe(DEFAULT_BANNER_ASPECT_RATIO);
    expect(resolveBannerAspectRatio(withImage(undefined))).toBe(DEFAULT_BANNER_ASPECT_RATIO);
    expect(resolveBannerAspectRatio(withImage(null))).toBe(DEFAULT_BANNER_ASPECT_RATIO);
    expect(resolveBannerAspectRatio(withImage(0))).toBe(DEFAULT_BANNER_ASPECT_RATIO);
    expect(resolveBannerAspectRatio(withImage(Number.NaN))).toBe(DEFAULT_BANNER_ASPECT_RATIO);
    expect(resolveBannerAspectRatio(withImage(Number.POSITIVE_INFINITY))).toBe(DEFAULT_BANNER_ASPECT_RATIO);
  });
});
