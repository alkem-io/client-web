import { MapPin, Settings } from 'lucide-react';
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
  showMessageButton: boolean;
  onSendMessage?: (messageText: string) => Promise<void>;
};

export function UserPageHero({
  avatarImageUrl,
  color,
  displayName,
  location,
  showSettingsIcon,
  settingsHref,
  showMessageButton,
  onSendMessage,
}: UserPageHeroProps) {
  const { t } = useTranslation('crd-profilePages');

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
              {showMessageButton && onSendMessage ? (
                <MessagePopover triggerLabel={t('userProfile.hero.messageButton')} onSendMessage={onSendMessage} />
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
