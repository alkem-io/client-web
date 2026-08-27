/**
 * Space page banner shape.
 *
 * The banner strip is no longer a fixed 6:1 — a space admin picks a width /
 * height ratio and it is stored on the space's BANNER visual. `MIN`/`MAX`
 * mirror `DEFAULT_VISUAL_CONSTRAINTS[VisualType.BANNER]` in the server
 * (`src/domain/common/visual/visual.constraints.ts`) and exist only as a
 * fallback for the moment before the server's real constraints have loaded —
 * the authoritative bounds always come from
 * `platform.configuration.defaultVisualTypeConstraints(type: BANNER)`.
 *
 * `DEFAULT` is the *design* default — the 10:1 slim strip — and deliberately
 * does NOT mirror the server's row-creation default: the server stamps 6 (the
 * historic shape) on every banner visual it creates, chosen by nobody, which
 * is why `resolveBannerAspectRatio` only trusts a stored ratio when an image
 * was actually cropped to it.
 *
 * The ratio cannot be expressed as a Tailwind `aspect-[10/1]` class because the
 * JIT scanner needs a literal string at build time, so consumers apply it as an
 * inline `style={{ aspectRatio }}` — permitted under the CRD carve-out for
 * user-provided runtime values.
 */
export const DEFAULT_BANNER_ASPECT_RATIO = 10;
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

/**
 * The ratio to render a banner strip at: the value the server recorded — when
 * it means anything — or the default.
 *
 * The stored ratio is only honoured when the visual actually has an image. The
 * one control that writes it is the crop dialog's shape slider, so a stored
 * ratio describes an uploaded image's crop; a visual with no image still
 * carries a persisted value, but it is the server's row-creation default (6),
 * chosen by nobody, and letting it through would pin every no-image gradient
 * to the historic shape instead of `DEFAULT`.
 *
 * Deliberately does **not** clamp into `MIN`/`MAX`. Those two constants are a
 * fallback for the *edit* control while the server's real bounds are loading;
 * the authoritative range lives in platform config and ops can widen it. Read
 * paths that clamped to the local constants would keep reserving a 6:1 box for
 * a legitimately 4:1 banner — the render and the editor would disagree about
 * what is legal, and the page would shift on load. The server validates the
 * ratio on write, so what it hands back is by definition in range.
 */
export function resolveBannerAspectRatio(
  banner: { uri?: string | null; aspectRatio?: number | null } | null | undefined
): number {
  if (!banner?.uri) return DEFAULT_BANNER_ASPECT_RATIO;
  const ratio = banner.aspectRatio;
  if (!ratio || !Number.isFinite(ratio)) return DEFAULT_BANNER_ASPECT_RATIO;
  return ratio;
}
