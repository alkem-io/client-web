import { useTranslation } from 'react-i18next';
import { bannerPlaceholderSize, DEFAULT_BANNER_ASPECT_RATIO } from '@/crd/lib/bannerAspectRatio';
import { contentColumnClass } from '@/crd/lib/contentColumn';
import { cn } from '@/crd/lib/utils';
import { HeaderActionIcons, type HeaderActionIconsData } from './HeaderActionIcons';

export type SubspaceHeaderActionsData = HeaderActionIconsData;

export type SubspaceHeaderProps = {
  /** Subspace identity */
  title: string;
  tagline?: string;

  /**
   * Page banner image — sourced from the L0 root of the ancestry chain (NOT from the immediate
   * parent for L2). L1/L2 subspaces do not have a settable page banner, so the L0 root's BANNER
   * visual (up to 3840px wide) is used. The subspace's own cardBanner is intentionally NOT used
   * here because it is sized for cards (~416×256) and would be visibly blurry when stretched.
   */
  bannerUrl?: string;
  /**
   * Author-supplied alternative text for the banner image (from the L0 root's
   * BANNER visual). Falls back to a generic label when the author left it empty.
   */
  bannerAlt?: string;
  /**
   * Width / height ratio of the banner strip. Like the image itself this is
   * inherited from the L0 root, so a subspace matches its parent space's shape.
   */
  bannerAspectRatio?: number;
  /** Accent colour for the gradient fallback when `bannerUrl` is missing — derived from the L0 root id. */
  color: string;

  /** Banner action icons */
  actions: SubspaceHeaderActionsData;

  /**
   * When true, the title/actions row fills all 12 grid columns instead of the
   * default `lg:col-start-2 lg:col-span-10` inset, aligning with a full-width body.
   */
  fullWidth?: boolean;

  /**
   * When true, the banner slides under the sticky page header (h-16) so the header can render
   * transparently over it (spec 100-space-header-layout A8). The title/buttons row stays below
   * the banner — no in-banner overlay offset is needed in this layout because the only content
   * inside the banner div is the image/gradient itself.
   */
  overlayHeader?: boolean;

  className?: string;
};

export function SubspaceHeader({
  title,
  tagline,
  bannerUrl,
  bannerAlt,
  bannerAspectRatio = DEFAULT_BANNER_ASPECT_RATIO,
  color,
  actions,
  overlayHeader = false,
  fullWidth = false,
  className,
}: SubspaceHeaderProps) {
  const { t } = useTranslation('crd-subspace');
  const bannerPlaceholder = bannerPlaceholderSize(bannerAspectRatio);

  return (
    <div className={cn('flex flex-col bg-background', overlayHeader && '-mt-16', className)}>
      {/* Banner — the collapsed layout insets the banner into the content grid
          on desktop (aligning with the title row below and matching the MUI
          banner sizing); mobile/tablet and the expanded layout keep the
          edge-to-edge full-bleed banner. */}
      <div className={cn('w-full', !fullWidth && 'lg:px-8')}>
        <div className="grid grid-cols-12 gap-6">
          {/* A real <img> rather than a CSS background — see the matching note in
              SpaceHeader: LCP discoverability plus somewhere for the alt text.
              The height comes from the image for the same reason, and it has to
              match SpaceHeader exactly: this is the L0 root's banner, so the
              identical image would otherwise render at two different heights
              depending on whether you are on the space or a subspace. */}
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
                alt={bannerAlt || t('a11y.subspaceBanner', { name: title })}
                width={bannerPlaceholder.width}
                height={bannerPlaceholder.height}
                // Same worst-case cap as SpaceHeader — see the note there. It has
                // to match, for the same reason the height rule does.
                className="w-full h-auto max-h-[50vh] object-contain"
                fetchPriority="high"
                decoding="async"
              />
            ) : (
              <div
                className="w-full"
                style={{
                  aspectRatio: bannerAspectRatio,
                  background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 70%, black))`,
                }}
                role="img"
                aria-label={t('a11y.subspaceBanner', { name: title })}
              />
            )}
          </div>
        </div>
      </div>

      <div className="w-full px-6 md:px-8 py-3">
        <div className="grid grid-cols-12 gap-6">
          <div className={cn('col-span-12 flex flex-col gap-1', contentColumnClass(fullWidth))}>
            <h1 className="text-hero text-foreground truncate">{title}</h1>
            {/* Prototype layout: the tagline and the action icons share the second row.
                At sm+ the icons move to the sticky flow-tabs row (rendered by the page),
                so the in-header copy is mobile-only. */}
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
