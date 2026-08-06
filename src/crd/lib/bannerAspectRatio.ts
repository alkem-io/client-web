/**
 * Space page banner shape.
 *
 * The banner strip is no longer a fixed 6:1 — a space admin picks a width /
 * height ratio and it is stored on the space's BANNER visual. These values
 * mirror `DEFAULT_VISUAL_CONSTRAINTS[VisualType.BANNER]` in the server
 * (`src/domain/common/visual/visual.constraints.ts`) and exist only as a
 * fallback for the moment before the server's real constraints have loaded —
 * the authoritative bounds always come from
 * `platform.configuration.defaultVisualTypeConstraints(type: BANNER)`.
 *
 * The ratio cannot be expressed as a Tailwind `aspect-[6/1]` class because the
 * JIT scanner needs a literal string at build time, so consumers apply it as an
 * inline `style={{ aspectRatio }}` — permitted under the CRD carve-out for
 * user-provided runtime values.
 */
export const DEFAULT_BANNER_ASPECT_RATIO = 6;
export const MIN_BANNER_ASPECT_RATIO = 6;
export const MAX_BANNER_ASPECT_RATIO = 10;
/** Granularity of the admin-facing ratio control; matches the DB's numeric(3,1). */
export const BANNER_ASPECT_RATIO_STEP = 0.1;

/**
 * Placeholder intrinsic size for the banner `<img>`, derived from the ratio
 * stored on the visual. Feed these to the element's `width`/`height`
 * **attributes** — never to a CSS `aspect-ratio`.
 *
 * The distinction matters. A CSS `aspect-ratio` on the image (or on a wrapper)
 * *forces* a shape, so the browser has to crop or letterbox the real pixels to
 * fit it. The `width`/`height` attributes instead resolve through the UA
 * stylesheet's `aspect-ratio: auto attr(width) / attr(height)`, and that `auto`
 * keyword means the loaded image's own intrinsic ratio takes over as soon as it
 * is known. So the rendered height ends up following the actual image — the
 * browser does the work — and the stored ratio only reserves a correctly-shaped
 * box beforehand, which matters because the banner is the page's LCP element
 * and an unreserved one shifts the whole page on load.
 *
 * The absolute numbers are irrelevant; only their ratio is read.
 */
export function bannerPlaceholderSize(aspectRatio: number): { width: number; height: number } {
  const width = 1920;
  return { width, height: Math.max(1, Math.round(width / aspectRatio)) };
}

/** Clamp an arbitrary stored/user value into the allowed banner ratio range. */
export function clampBannerAspectRatio(
  ratio: number | undefined,
  min: number = MIN_BANNER_ASPECT_RATIO,
  max: number = MAX_BANNER_ASPECT_RATIO
): number {
  if (!ratio || !Number.isFinite(ratio)) return DEFAULT_BANNER_ASPECT_RATIO;
  return Math.min(Math.max(ratio, min), max);
}
