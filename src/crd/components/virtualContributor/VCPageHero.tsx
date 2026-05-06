import { Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';

export type VCPageHeroProps = {
  avatarImageUrl: string | null;
  color: string;
  displayName: string;
  /** When `null` the gear icon is hidden. */
  settingsHref: string | null;
  /** NO Message button (FR-030). */
};

const fallbackInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

export function VCPageHero({ avatarImageUrl, color, displayName, settingsHref }: VCPageHeroProps) {
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
              <h1 className="text-page-title md:text-4xl text-foreground truncate">{displayName}</h1>
            </div>

            <div className="flex gap-3 shrink-0">
              {settingsHref ? (
                <Button
                  asChild={true}
                  variant="secondary"
                  size="icon"
                  className="shadow-sm"
                  title={t('vcProfile.hero.settingsTooltip')}
                >
                  <a href={settingsHref} aria-label={t('vcProfile.hero.settingsAriaLabel')}>
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
