import { Activity, FoldHorizontal, Info, Menu, Settings, Share2, UnfoldHorizontal, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { safeHttpUrl } from '@/crd/lib/safeHttpUrl';
import { cn } from '@/crd/lib/utils';
import { IconButton } from '@/crd/primitives/icon-button';

/**
 * Prototype treatment for the header action icons: compact 28px buttons with a
 * subtle gray fill (`--foreground` at 8%) and muted icons.
 */
const ACTION_ICON_BUTTON_CLASSES = 'size-7 bg-foreground/8 text-muted-foreground';

export type HeaderActionIconsData = {
  /** Shows the info button (About this Space) first in the row. */
  showInfo?: boolean;
  onInfoClick?: () => void;
  showActivity?: boolean;
  onActivityClick?: () => void;
  /** Shows the expand/collapse (full-width) toggle next to Activity. */
  showFullWidthToggle?: boolean;
  /** Current full-width state — drives the icon and pressed state. */
  fullWidth?: boolean;
  onToggleFullWidth?: () => void;
  showVideoCall?: boolean;
  videoCallUrl?: string;
  onVideoCallClick?: () => void;
  showShare?: boolean;
  onShareClick?: () => void;
  showSettings?: boolean;
  settingsHref?: string;
  onSettingsClick?: () => void;
  /** Tablet-only hamburger (subspace pages): opens the sidebar drawer. Hidden at lg+. */
  onMenuClick?: () => void;
};

type HeaderActionIconsProps = {
  actions: HeaderActionIconsData;
  className?: string;
};

/**
 * The gray icon-button row for space/subspace pages (info, activity, width
 * toggle, video call, share, settings). Rendered in the header's tagline row
 * below `sm` and in the sticky tab row's right slot at `sm+`, so the icons
 * stay visible while scrolling.
 */
export function HeaderActionIcons({ actions, className }: HeaderActionIconsProps) {
  const { t } = useTranslation('crd-space');
  const safeVideoCallUrl = safeHttpUrl(actions.videoCallUrl);
  const safeSettingsHref = safeHttpUrl(actions.settingsHref);

  return (
    <div className={cn('shrink-0 flex items-center gap-0.5', className)}>
      {actions.showInfo && (
        <IconButton
          variant="ghost"
          className={ACTION_ICON_BUTTON_CLASSES}
          onClick={actions.onInfoClick}
          tooltipLabel={t('sidebar.aboutSpace')}
        >
          <Info className="size-3.5" aria-hidden="true" />
        </IconButton>
      )}
      {actions.showActivity && (
        <IconButton
          variant="ghost"
          className={ACTION_ICON_BUTTON_CLASSES}
          onClick={actions.onActivityClick}
          tooltipLabel={t('mobile.activity')}
        >
          <Activity className="size-3.5" aria-hidden="true" />
        </IconButton>
      )}
      {actions.showFullWidthToggle && (
        <IconButton
          variant="ghost"
          className={cn(ACTION_ICON_BUTTON_CLASSES, 'hidden lg:inline-flex')}
          onClick={actions.onToggleFullWidth}
          aria-pressed={actions.fullWidth}
          tooltipLabel={actions.fullWidth ? t('mobile.collapseWidth') : t('mobile.expandWidth')}
        >
          {actions.fullWidth ? (
            <FoldHorizontal className="size-3.5" aria-hidden="true" />
          ) : (
            <UnfoldHorizontal className="size-3.5" aria-hidden="true" />
          )}
        </IconButton>
      )}
      {actions.showVideoCall &&
        (safeVideoCallUrl ? (
          <IconButton
            variant="ghost"
            className={ACTION_ICON_BUTTON_CLASSES}
            tooltipLabel={t('mobile.videoCall')}
            asChild={true}
          >
            <a href={safeVideoCallUrl} target="_blank" rel="noopener noreferrer">
              <Video className="size-3.5" aria-hidden="true" />
            </a>
          </IconButton>
        ) : (
          <IconButton
            variant="ghost"
            className={ACTION_ICON_BUTTON_CLASSES}
            onClick={actions.onVideoCallClick}
            tooltipLabel={t('mobile.videoCall')}
          >
            <Video className="size-3.5" aria-hidden="true" />
          </IconButton>
        ))}
      {actions.showShare && (
        <IconButton
          variant="ghost"
          className={ACTION_ICON_BUTTON_CLASSES}
          onClick={actions.onShareClick}
          tooltipLabel={t('mobile.share')}
        >
          <Share2 className="size-3.5" aria-hidden="true" />
        </IconButton>
      )}
      {actions.showSettings &&
        (safeSettingsHref ? (
          <IconButton
            variant="ghost"
            className={ACTION_ICON_BUTTON_CLASSES}
            tooltipLabel={t('mobile.settings')}
            asChild={true}
          >
            <a href={safeSettingsHref}>
              <Settings className="size-3.5" aria-hidden="true" />
            </a>
          </IconButton>
        ) : (
          <IconButton
            variant="ghost"
            className={ACTION_ICON_BUTTON_CLASSES}
            onClick={actions.onSettingsClick}
            tooltipLabel={t('mobile.settings')}
          >
            <Settings className="size-3.5" aria-hidden="true" />
          </IconButton>
        ))}
      {/* Hamburger — tablet widths only (640–1023px): the desktop sidebar is hidden
          there and the phone bottom bar (with its own hamburger) is not shown. */}
      {actions.onMenuClick && (
        <IconButton
          variant="ghost"
          className={cn(ACTION_ICON_BUTTON_CLASSES, 'hidden sm:inline-flex lg:hidden')}
          onClick={actions.onMenuClick}
          tooltipLabel={t('mobile.menu')}
          aria-haspopup="dialog"
        >
          <Menu className="size-3.5" aria-hidden="true" />
        </IconButton>
      )}
    </div>
  );
}
