import { Activity, Maximize2, Menu, Minimize2, Settings, Share2, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { contentColumnClass } from '@/crd/lib/contentColumn';
import { safeHttpUrl } from '@/crd/lib/safeHttpUrl';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

export type SubspaceHeaderActionsData = {
  showActivity: boolean;
  showVideoCall: boolean;
  showShare: boolean;
  showSettings: boolean;
  /** Shows the expand/collapse (full-width) toggle next to Activity. */
  showFullWidthToggle?: boolean;
  /** Current full-width state — drives the icon and pressed state. */
  fullWidth?: boolean;
  settingsHref?: string;
  videoCallUrl?: string;
  onActivityClick?: () => void;
  onVideoCallClick?: () => void;
  onShareClick?: () => void;
  onToggleFullWidth?: () => void;
  /**
   * Opens the sidebar drawer. When provided, a hamburger button is shown
   * before the other action icons — but only on tablet widths (640–1023px),
   * where the desktop sidebar is hidden and the mobile bottom-bar hamburger is
   * not shown. Hidden on phones (`<640px`) and desktop (`>=1024px`).
   */
  onMenuClick?: () => void;
};

export type SubspaceHeaderProps = {
  /** Subspace identity */
  title: string;
  tagline?: string;
  subspaceInitials: string;
  /** Subspace accent colour — used for the avatar fallback. */
  subspaceColor: string;
  subspaceAvatarUrl?: string;

  /**
   * Page banner image — sourced from the L0 root of the ancestry chain (NOT from the immediate
   * parent for L2). L1/L2 subspaces do not have a settable page banner, so the L0 root's BANNER
   * visual (stored at ~1920×320) is used. The subspace's own cardBanner is intentionally NOT used
   * here because it is sized for cards (~416×256) and would be visibly blurry when stretched.
   */
  bannerUrl?: string;
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
  subspaceInitials,
  subspaceColor,
  subspaceAvatarUrl,
  bannerUrl,
  color,
  actions,
  overlayHeader = false,
  fullWidth = false,
  className,
}: SubspaceHeaderProps) {
  const { t } = useTranslation('crd-subspace');
  const safeVideoCallUrl = safeHttpUrl(actions.videoCallUrl);
  const safeSettingsHref = safeHttpUrl(actions.settingsHref);

  return (
    <div className={cn('flex flex-col bg-background', overlayHeader && '-mt-16', className)}>
      <div
        className="relative w-full aspect-[6/1] overflow-hidden"
        role="img"
        aria-label={t('a11y.subspaceBanner', { name: title })}
      >
        <div
          className={cn('absolute inset-0 bg-cover bg-center', !bannerUrl && 'bg-muted')}
          style={
            bannerUrl
              ? { backgroundImage: `url(${bannerUrl})` }
              : { background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 70%, black))` }
          }
        />
      </div>

      <div className="w-full px-6 md:px-8 pt-8 pb-8">
        <div className="grid grid-cols-12 gap-6">
          <div className={cn('col-span-12 flex flex-col gap-1', contentColumnClass(fullWidth))}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className="shrink-0 size-14 rounded-md border-2 border-border overflow-hidden flex items-center justify-center"
                  style={subspaceAvatarUrl ? undefined : { background: subspaceColor }}
                >
                  {subspaceAvatarUrl ? (
                    <img src={subspaceAvatarUrl} alt={title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-subsection-title font-bold text-primary-foreground">{subspaceInitials}</span>
                  )}
                </div>
                <h1 className="text-hero text-foreground truncate">{title}</h1>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {actions.onMenuClick && (
                  <div className="hidden sm:flex lg:hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={actions.onMenuClick}
                      aria-label={t('a11y.openMenu')}
                      aria-haspopup="dialog"
                    >
                      <Menu className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                )}
                {actions.showActivity && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={actions.onActivityClick}
                    aria-label={t('actions.activity')}
                  >
                    <Activity className="h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
                {actions.showFullWidthToggle && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 hidden lg:inline-flex"
                    onClick={actions.onToggleFullWidth}
                    aria-pressed={actions.fullWidth}
                    aria-label={actions.fullWidth ? t('actions.collapseWidth') : t('actions.expandWidth')}
                  >
                    {actions.fullWidth ? (
                      <Minimize2 className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Maximize2 className="h-4 w-4" aria-hidden="true" />
                    )}
                  </Button>
                )}
                {actions.showVideoCall &&
                  (safeVideoCallUrl ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      aria-label={t('actions.videoCall')}
                      asChild={true}
                    >
                      <a href={safeVideoCallUrl} target="_blank" rel="noopener noreferrer">
                        <Video className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={actions.onVideoCallClick}
                      aria-label={t('actions.videoCall')}
                    >
                      <Video className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  ))}
                {actions.showShare && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={actions.onShareClick}
                    aria-label={t('actions.share')}
                  >
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
                {actions.showSettings && safeSettingsHref && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    aria-label={t('actions.settings')}
                    asChild={true}
                  >
                    <a href={safeSettingsHref}>
                      <Settings className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {tagline && <p className="text-body text-muted-foreground truncate">{tagline}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
