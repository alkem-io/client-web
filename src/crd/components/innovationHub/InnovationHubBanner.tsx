import { backgroundGradient } from '@/crd/lib/backgroundGradient';
import { contentColumnClass } from '@/crd/lib/contentColumn';
import { cn } from '@/crd/lib/utils';

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
 * Innovation Hub banner — mirrors the Spaces banner layout for parity:
 *
 * - Uses an `aspect-[6/1]` ratio (no fixed pixel height) so the banner scales
 *   with viewport width while keeping the proportions designers signed off on.
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
