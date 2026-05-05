import { MapPin, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MessagePopover } from '@/crd/components/common/MessagePopover';
import { cn } from '@/crd/lib/utils';
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

const fallbackInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

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
      <div className="container mx-auto px-4 md:px-8 py-8 md:py-10">
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <Avatar className="w-32 h-32 md:w-40 md:h-40 shrink-0 border-4 border-background shadow-lg text-4xl">
            {avatarImageUrl ? <AvatarImage src={avatarImageUrl} alt={displayName} /> : null}
            <AvatarFallback color={color} className="text-white text-3xl">
              {fallbackInitials(displayName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 flex flex-col md:flex-row md:items-end justify-between gap-4 min-w-0">
            <div className="min-w-0">
              <h1 className="text-page-title md:text-4xl font-bold text-foreground truncate">{displayName}</h1>
              {location ? (
                <div className="flex items-center gap-2 text-muted-foreground text-body-emphasis mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{location}</span>
                </div>
              ) : null}
            </div>

            <div className={cn('flex gap-3 shrink-0')}>
              {showMessageButton && onSendMessage ? (
                <MessagePopover triggerLabel={t('userProfile.hero.messageButton')} onSendMessage={onSendMessage} />
              ) : null}
              {showSettingsIcon && settingsHref ? (
                <a href={settingsHref} aria-label={t('userProfile.hero.settingsAriaLabel')}>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="shadow-sm"
                    title={t('userProfile.hero.settingsTooltip')}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
