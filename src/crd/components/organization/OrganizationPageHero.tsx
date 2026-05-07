import { BadgeCheck, MapPin, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MessagePopover } from '@/crd/components/common/MessagePopover';
import { fallbackInitials } from '@/crd/lib/fallbackInitials';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/crd/primitives/tooltip';

export type OrganizationPageHeroProps = {
  avatarImageUrl: string | null;
  color: string;
  displayName: string;
  location: string | null;
  verified: boolean;
  /** When `null` the gear icon is hidden. */
  settingsHref: string | null;
  /** When `null` (anonymous viewer) the Message button is hidden. */
  onSendMessage: ((messageText: string) => Promise<void>) | null;
};

export function OrganizationPageHero({
  avatarImageUrl,
  color,
  displayName,
  location,
  verified,
  settingsHref,
  onSendMessage,
}: OrganizationPageHeroProps) {
  const { t } = useTranslation('crd-profilePages');

  return (
    <div>
      <div className="container mx-auto px-4 md:px-8 py-8 md:py-10">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <Avatar className="w-32 h-32 md:w-40 md:h-40 shrink-0 border-4 border-background shadow-lg text-4xl rounded-2xl">
            {avatarImageUrl ? <AvatarImage src={avatarImageUrl} alt={displayName} className="object-cover" /> : null}
            <AvatarFallback color={color} className="text-white text-3xl rounded-2xl">
              {fallbackInitials(displayName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 flex flex-col md:flex-row md:items-start justify-between gap-4 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-page-title text-foreground">{displayName}</h1>
                {verified ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild={true}>
                        <Badge variant="secondary" className="gap-1">
                          <BadgeCheck className="w-3 h-3" aria-hidden="true" />
                          {t('orgProfile.hero.verifiedBadge')}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>{t('orgProfile.hero.verifiedTooltip')}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : null}
              </div>
              {location ? (
                <div className="flex items-center gap-2 text-muted-foreground text-body-emphasis mt-1">
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  <span>{location}</span>
                </div>
              ) : null}
            </div>

            <div className="flex gap-3 shrink-0">
              {onSendMessage ? (
                <MessagePopover triggerLabel={t('orgProfile.hero.messageButton')} onSendMessage={onSendMessage} />
              ) : null}
              {settingsHref ? (
                <Button
                  asChild={true}
                  variant="secondary"
                  size="icon"
                  className="shadow-sm"
                  title={t('orgProfile.hero.settingsTooltip')}
                >
                  <a href={settingsHref} aria-label={t('orgProfile.hero.settingsAriaLabel')}>
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
