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

/** Clamp an arbitrary stored/user value into the allowed banner ratio range. */
export function clampBannerAspectRatio(
  ratio: number | undefined,
  min: number = MIN_BANNER_ASPECT_RATIO,
  max: number = MAX_BANNER_ASPECT_RATIO
): number {
  if (!ratio || !Number.isFinite(ratio)) return DEFAULT_BANNER_ASPECT_RATIO;
  return Math.min(Math.max(ratio, min), max);
}
