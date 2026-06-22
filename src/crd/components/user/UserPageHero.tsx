import { Mail, MapPin, MessageSquare, Settings } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessagePopover } from '@/crd/components/common/MessagePopover';
import { fallbackInitials } from '@/crd/lib/fallbackInitials';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';

export type UserPageHeroProps = {
  avatarImageUrl: string | null;
  /** Deterministic colour (from `pickColorFromId(userId)`) used for the avatar fallback. */
  color: string;
  displayName: string;
  /** "City, Country" — null when both empty. */
  location: string | null;
  showSettingsIcon: boolean;
  settingsHref?: string;
  /**
   * Chat route (FR-001): when provided, a Message button opens/focuses the 1:1
   * chat panel directly — no compose popover. Provided when the recipient has
   * chat enabled (`isContactable`).
   */
  onMessageClick?: () => Promise<void> | void;
  /**
   * Email route (FR-011): when provided, an Email button opens a compose popover
   * (a one-off send). Provided when the recipient has email contact enabled
   * (`isContactableViaEmail`) — independently of chat, so it can appear
   * alongside the Message button.
   */
  onSendEmail?: (messageText: string) => Promise<void>;
  /**
   * Shown instead of the contact buttons when the viewer may contact the user
   * but the user has both chat and email contact disabled (FR-011).
   */
  cannotBeReachedLabel?: string;
};

export function UserPageHero({
  avatarImageUrl,
  color,
  displayName,
  location,
  showSettingsIcon,
  settingsHref,
  onMessageClick,
  onSendEmail,
  cannotBeReachedLabel,
}: UserPageHeroProps) {
  const { t } = useTranslation('crd-profilePages');
  const [openingChat, setOpeningChat] = useState(false);

  const handleMessageClick = async () => {
    if (!onMessageClick || openingChat) return;
    setOpeningChat(true);
    try {
      await onMessageClick();
    } finally {
      setOpeningChat(false);
    }
  };

  return (
    <div>
      <div className="container mx-auto px-4 md:px-8 pt-8 pb-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <Avatar className="w-28 h-28 md:w-32 md:h-32 shrink-0 border-4 border-background shadow-lg">
            {avatarImageUrl ? <AvatarImage src={avatarImageUrl} alt={displayName} /> : null}
            <AvatarFallback color={color} className="text-white text-3xl">
              {fallbackInitials(displayName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 flex flex-col md:flex-row md:items-start justify-between gap-4 min-w-0">
            <div className="min-w-0">
              <h1 className="text-hero text-foreground">{displayName}</h1>
              {location ? (
                <div className="flex items-center gap-2 text-muted-foreground text-body-emphasis mt-1">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  <span>{location}</span>
                </div>
              ) : null}
            </div>

            <div className="flex gap-3 shrink-0">
              {onMessageClick ? (
                <Button
                  className="gap-2 shadow-sm"
                  onClick={handleMessageClick}
                  disabled={openingChat}
                  aria-busy={openingChat}
                >
                  <MessageSquare className="w-4 h-4" aria-hidden="true" />
                  {t('userProfile.hero.messageButton')}
                </Button>
              ) : null}
              {onSendEmail ? (
                <MessagePopover
                  triggerLabel={t('userProfile.hero.emailButton')}
                  triggerVariant={onMessageClick ? 'secondary' : 'default'}
                  triggerIcon={<Mail className="w-4 h-4" aria-hidden="true" />}
                  onSendMessage={onSendEmail}
                  title={t('common.messagePopover.emailTitle')}
                  notice={t('common.messagePopover.emailNotice')}
                  placeholder={t('common.messagePopover.emailPlaceholder')}
                />
              ) : null}
              {!onMessageClick && !onSendEmail && cannotBeReachedLabel ? (
                <p className="text-caption text-muted-foreground self-center">{cannotBeReachedLabel}</p>
              ) : null}
              {showSettingsIcon && settingsHref ? (
                <Button
                  asChild={true}
                  variant="secondary"
                  size="icon"
                  className="shadow-sm"
                  title={t('userProfile.hero.settingsTooltip')}
                >
                  <a href={settingsHref} aria-label={t('userProfile.hero.settingsAriaLabel')}>
                    <Settings className="w-4 h-4" aria-hidden="true" />
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
