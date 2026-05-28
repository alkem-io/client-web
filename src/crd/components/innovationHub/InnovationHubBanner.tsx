import { backgroundGradient } from '@/crd/lib/backgroundGradient';
import { contentColumnClass } from '@/crd/lib/contentColumn';
import { cn } from '@/crd/lib/utils';

/**
 * Aspect ratio of the Innovation Hub banner — used by the crop dialog config
 * in `useHubAboutTabData` to enforce the same ratio the page actually displays
 * at. Keeping them in lockstep is what makes the cropper preview match the
 * rendered banner exactly (WYSIWYG): the user crops at the same ratio they'll
 * see on the public hub home, so there is no centre-crop surprise between
 * editor and display.
 *
 * MUST stay in sync with the literal `aspect-[6/1]` Tailwind class on the
 * banner `<div>` below — Tailwind's JIT scanner needs the literal string at
 * build time, so we can't interpolate the constant directly into the class.
 *
 * The constant intentionally overrides the server's `visual.aspectRatio` for
 * `BANNER_WIDE` (the upload pipeline is unchanged — same visual type, same
 * mutation). Scoped to hub surfaces only; Space and Subspace banners keep
 * their own ratios in `SpaceHeader` and do not import this constant.
 */
export const HUB_BANNER_ASPECT_RATIO = 6;

export type InnovationHubBannerProps = {
  imageUrl?: string;
  color: string;
  alt: string;
  /**
   * When `true`, the banner fills all 12 grid columns. When `false` (default),
   * it sits in the centered `lg:col-start-2 lg:col-span-10` content band so it
   * vertically aligns with the title/body below — mirrors `SpaceHeader`'s
   * collapsed-banner behaviour.
   */
  fullWidth?: boolean;
  className?: string;
};

/**
 * Innovation Hub banner.
 *
 * - Uses `aspect-[HUB_BANNER_ASPECT_RATIO / 1]` so the banner scales with
 *   viewport width while staying short enough that the description + Spaces
 *   grid show with minimal scroll. Same ratio is enforced by the crop dialog.
 * - Sits inside the same 12-column grid as the rest of the page, with
 *   `contentColumnClass(fullWidth)` controlling whether it's edge-to-edge
 *   (expanded) or constrained to the centered band (collapsed).
 * - The outer `lg:px-8` padding when collapsed reproduces the inset gap that
 *   the Space header uses to align banner edges with the body content.
 *
 * The page-level `-mt-16` that slides the banner under the transparent topbar
 * is owned by the containing page (`InnovationHubHome`) so that the topbar's
 * overlay state can be coordinated with the rest of the header content. The
 * banner itself stays presentation-only.
 */
export const InnovationHubBanner = ({
  imageUrl,
  color,
  alt,
  fullWidth = false,
  className,
}: InnovationHubBannerProps) => (
  <div className={cn('w-full', !fullWidth && 'lg:px-8', className)}>
    <div className="grid grid-cols-12 gap-6">
      <div
        // Aspect MUST stay in sync with HUB_BANNER_ASPECT_RATIO (=6) — see the
        // constant's comment for why the class can't be interpolated.
        className={cn(
          'relative col-span-12 aspect-[6/1] overflow-hidden',
          !fullWidth && 'rounded-b-xl',
          contentColumnClass(fullWidth)
        )}
        role="img"
        aria-label={alt}
      >
        <div
          className={cn('absolute inset-0 bg-cover bg-center', !imageUrl && !color && 'bg-muted')}
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : color ? backgroundGradient(color) : undefined}
        />
      </div>
    </div>
  </div>
);
