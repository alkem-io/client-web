import { Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { backgroundGradient } from '@/crd/lib/backgroundGradient';
import { bannerPlaceholderSize, DEFAULT_BANNER_ASPECT_RATIO } from '@/crd/lib/bannerAspectRatio';
import { contentColumnClass } from '@/crd/lib/contentColumn';
import { cn } from '@/crd/lib/utils';
import { HeaderActionIcons, type HeaderActionIconsData } from './HeaderActionIcons';

type SpaceHeaderActions = HeaderActionIconsData;

type SpaceHeaderProps = {
  title: string;
  tagline?: string;
  bannerUrl?: string;
  /**
   * Author-supplied alternative text for the banner image. Falls back to a
   * generic "Space banner for X" label when the author left it empty.
   */
  bannerAlt?: string;
  /**
   * Width / height ratio of the banner strip, chosen per space by an admin.
   * The server bounds it (BANNER: 6-10); 6 is the historic shape and the
   * fallback when the value has not loaded yet.
   */
  bannerAspectRatio?: number;
  /** Deterministic accent colour shown as a gradient when `bannerUrl` is missing. */
  color?: string;
  isHomeSpace?: boolean;
  actions: SpaceHeaderActions;
  /**
   * When true, the banner slides under the sticky page header (h-16) so the header can render
   * transparently over it (spec 100-space-header-layout A8). The title/buttons row stays below
   * the banner — no in-banner overlay offset is needed in this layout because the only content
   * inside the banner div is the image/gradient itself.
   */
  overlayHeader?: boolean;
  /**
   * When true, the title/actions row fills all 12 grid columns instead of the
   * default `lg:col-start-2 lg:col-span-10` inset, aligning with a full-width
   * `SpaceShell` body.
   */
  fullWidth?: boolean;
  className?: string;
};

export function SpaceHeader({
  title,
  tagline,
  bannerUrl,
  bannerAlt,
  bannerAspectRatio = DEFAULT_BANNER_ASPECT_RATIO,
  color,
  isHomeSpace,
  actions,
  overlayHeader = false,
  fullWidth = false,
  className,
}: SpaceHeaderProps) {
  const { t } = useTranslation('crd-space');
  const bannerPlaceholder = bannerPlaceholderSize(bannerAspectRatio);

  return (
    <div className={cn('flex flex-col bg-background', overlayHeader && '-mt-16', className)}>
      {/* Banner — the collapsed layout insets the banner into the content grid
          on desktop (aligning with the title row below and matching the MUI
          banner sizing); mobile/tablet and the expanded layout keep the
          edge-to-edge full-bleed banner. */}
      <div className={cn('w-full', !fullWidth && 'lg:px-8')}>
        <div className="grid grid-cols-12 gap-6">
          {/* A real <img> rather than a CSS background: the banner is the page's
              LCP element, and a background-image is only discoverable after the
              CSSOM is built. `fetchPriority` + eager decoding let the preload
              scanner start it immediately, and it gives the author-supplied alt
              text somewhere to live.

              The banner takes its height from the image, not from a fixed box.
              The admin already crops the banner to the shape they want, so
              pinning the wrapper to `aspectRatio` only re-cropped that choice
              away — a shorter banner never actually got shorter, it just lost
              more of its pixels to `object-cover`. With `h-auto` and no forced
              ratio the rendered height is whatever the image is, which is what
              buying back the vertical space depends on. `bannerAspectRatio`
              survives as the pre-load size hint and as the gradient's shape. */}
          {/* `lg:-mx-4` bleeds the banner ~16px past the content column on each side
              (prototype look). Full-width mode is untouched — there the banner is
              already an edge-to-edge full bleed, wider than the content column. */}
          <div
            className={cn(
              'col-span-12 overflow-hidden rounded-b-lg',
              contentColumnClass(fullWidth),
              !fullWidth && 'lg:-mx-4'
            )}
          >
            {bannerUrl ? (
              <img
                src={bannerUrl}
                alt={bannerAlt || t('a11y.spaceBanner', { name: title })}
                width={bannerPlaceholder.width}
                height={bannerPlaceholder.height}
                // `max-h` is a floor under the worst case, not a shape: a banner
                // stored before the server derived `aspectRatio` from the pixels
                // can be far taller than any ratio the editor allows (a 4:3 phone
                // photo would fill the viewport), and `h-auto` alone would let it.
                // A legitimate banner is at most width/6 tall, so this never
                // engages for one.
                className="w-full h-auto max-h-[50vh] object-contain"
                fetchPriority="high"
                decoding="async"
              />
            ) : (
              <div
                className={cn('w-full', !color && 'bg-muted')}
                style={{ aspectRatio: bannerAspectRatio, ...(color ? backgroundGradient(color) : {}) }}
                role="img"
                aria-label={t('a11y.spaceBanner', { name: title })}
              />
            )}
          </div>
        </div>
      </div>

      <div className="w-full px-6 md:px-8 py-3">
        <div className="grid grid-cols-12 gap-6">
          <div className={cn('col-span-12 flex flex-col gap-1', contentColumnClass(fullWidth))}>
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-hero text-foreground truncate">{title}</h1>
              {isHomeSpace && (
                <>
                  <Home className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
                  <span className="sr-only">{t('banner.homeSpace')}</span>
                </>
              )}
            </div>
            {/* Prototype layout: the tagline and the action icons share the second row.
                At sm+ the icons move to the sticky tab row (rendered by the layout), so
                the in-header copy is mobile-only. */}
            <div className="flex items-center justify-between gap-4">
              {tagline ? (
                <p className="text-body text-muted-foreground truncate">{tagline}</p>
              ) : (
                <div aria-hidden="true" />
              )}
              <HeaderActionIcons actions={actions} className="sm:hidden" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
