import { Activity, Home, Maximize2, Minimize2, Settings, Share2, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { backgroundGradient } from '@/crd/lib/backgroundGradient';
import { safeHttpUrl } from '@/crd/lib/safeHttpUrl';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';

type SpaceHeaderActions = {
  showVideoCall?: boolean;
  showShare?: boolean;
  showSettings?: boolean;
  showActivity?: boolean;
  /** Shows the expand/collapse (full-width) toggle next to Activity. */
  showFullWidthToggle?: boolean;
  /** Current full-width state — drives the icon and pressed state. */
  fullWidth?: boolean;
  onActivityClick?: () => void;
  onVideoCallClick?: () => void;
  onShareClick?: () => void;
  onToggleFullWidth?: () => void;
  videoCallUrl?: string;
  settingsHref?: string;
  onSettingsClick?: () => void;
};

type SpaceHeaderProps = {
  title: string;
  tagline?: string;
  bannerUrl?: string;
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
  color,
  isHomeSpace,
  actions,
  overlayHeader = false,
  fullWidth = false,
  className,
}: SpaceHeaderProps) {
  const { t } = useTranslation('crd-space');
  const safeVideoCallUrl = safeHttpUrl(actions.videoCallUrl);
  const safeSettingsHref = safeHttpUrl(actions.settingsHref);

  return (
    <div className={cn('flex flex-col bg-background', overlayHeader && '-mt-16', className)}>
      <div
        className="relative w-full aspect-[6/1] overflow-hidden"
        role="img"
        aria-label={t('a11y.spaceBanner', { name: title })}
      >
        <div
          className={cn('absolute inset-0 bg-cover bg-center', !bannerUrl && !color && 'bg-muted')}
          style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : color ? backgroundGradient(color) : undefined}
        />
      </div>

      <div className="w-full px-6 md:px-8 pt-8 pb-8">
        <div className="grid grid-cols-12 gap-6">
          <div
            className={cn(
              'col-span-12 flex flex-col gap-1',
              fullWidth ? 'lg:col-span-12' : 'lg:col-start-2 lg:col-span-10'
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <h1 className="text-hero text-foreground truncate">{title}</h1>
                {isHomeSpace && (
                  <>
                    <Home className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden="true" />
                    <span className="sr-only">{t('banner.homeSpace')}</span>
                  </>
                )}
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {actions.showActivity && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={actions.onActivityClick}
                    aria-label={t('mobile.activity')}
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
                    aria-label={actions.fullWidth ? t('mobile.collapseWidth') : t('mobile.expandWidth')}
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
                      aria-label={t('mobile.videoCall')}
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
                      aria-label={t('mobile.videoCall')}
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
                    aria-label={t('mobile.share')}
                  >
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
                {actions.showSettings &&
                  (safeSettingsHref ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      aria-label={t('mobile.settings')}
                      asChild={true}
                    >
                      <a href={safeSettingsHref}>
                        <Settings className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={actions.onSettingsClick}
                      aria-label={t('mobile.settings')}
                    >
                      <Settings className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  ))}
              </div>
            </div>

            {tagline && <p className="text-body text-muted-foreground truncate">{tagline}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
