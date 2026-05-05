import { BadgeCheck, MapPin, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MessagePopover } from '@/crd/components/common/MessagePopover';
import { backgroundGradient } from '@/crd/lib/backgroundGradient';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/crd/primitives/tooltip';

export type OrganizationPageHeroProps = {
  bannerImageUrl: string | null;
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

const fallbackInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

export function OrganizationPageHero({
  bannerImageUrl,
  avatarImageUrl,
  color,
  displayName,
  location,
  verified,
  settingsHref,
  onSendMessage,
}: OrganizationPageHeroProps) {
  const { t } = useTranslation('crd-profilePages');

  const bannerStyle = bannerImageUrl ? { backgroundImage: `url(${bannerImageUrl})` } : backgroundGradient(color);

  return (
    <div className="relative mb-20 md:mb-24 group">
      <div className="h-64 md:h-80 w-full relative overflow-hidden bg-muted">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={bannerStyle}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="absolute -bottom-16 md:-bottom-20 left-0 right-0 px-4 md:px-8">
        <div className="container mx-auto flex flex-col md:flex-row items-end gap-6">
          <div className="relative shrink-0">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-lg text-4xl rounded-2xl">
              {avatarImageUrl ? <AvatarImage src={avatarImageUrl} alt={displayName} className="object-cover" /> : null}
              <AvatarFallback color={color} className="text-white text-3xl rounded-2xl">
                {fallbackInitials(displayName)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 pb-2 flex flex-col md:flex-row md:items-end justify-between gap-4 w-full">
            <div className="mb-2 md:mb-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-page-title md:text-4xl font-bold text-foreground">{displayName}</h1>
                {verified ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild={true}>
                        <Badge variant="secondary" className="gap-1">
                          <BadgeCheck className="w-3 h-3" />
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
                  <MapPin className="w-4 h-4" />
                  <span>{location}</span>
                </div>
              ) : null}
            </div>

            <div className={cn('flex gap-3 mt-4 md:mt-0')}>
              {onSendMessage ? (
                <MessagePopover triggerLabel={t('orgProfile.hero.messageButton')} onSendMessage={onSendMessage} />
              ) : null}
              {settingsHref ? (
                <a href={settingsHref} aria-label={t('orgProfile.hero.settingsAriaLabel')}>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="shadow-sm"
                    title={t('orgProfile.hero.settingsTooltip')}
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
