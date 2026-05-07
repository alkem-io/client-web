import { Bot, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';

export type VCPageHeroProps = {
  avatarImageUrl: string | null;
  displayName: string;
  /** When `null` the gear icon is hidden. */
  settingsUrl: string | null;
  /** i18n-resolved "Virtual Contributor" label rendered inside a Badge next to the name. */
  typeBadgeLabel: string;
  /** Resolved keyword strings. Empty array → chip row is omitted entirely (FR-030). */
  keywords: string[];
  /** NO Message button (FR-030). */
};

export function VCPageHero({ avatarImageUrl, displayName, settingsUrl, typeBadgeLabel, keywords }: VCPageHeroProps) {
  const { t } = useTranslation('crd-profilePages');

  return (
    <div>
      <div className="container mx-auto px-4 md:px-8 py-8 md:py-10">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <Avatar className="w-32 h-32 md:w-40 md:h-40 shrink-0 border-4 border-background shadow-lg text-4xl">
            {avatarImageUrl ? <AvatarImage src={avatarImageUrl} alt={displayName} /> : null}
            <AvatarFallback className="bg-muted text-foreground">
              <Bot className="size-12 md:size-16" aria-hidden="true" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 flex flex-col md:flex-row md:items-start justify-between gap-4 min-w-0">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-page-title text-foreground">{displayName}</h1>
                <Badge variant="secondary">
                  <Bot className="size-3" aria-hidden="true" />
                  {typeBadgeLabel}
                </Badge>
              </div>
              {keywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {keywords.map(keyword => (
                    <Badge key={keyword} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex gap-3 shrink-0">
              {settingsUrl ? (
                <Button
                  asChild={true}
                  variant="secondary"
                  size="icon"
                  className="shadow-sm"
                  title={t('vcProfile.hero.settingsTooltip')}
                >
                  <a href={settingsUrl} aria-label={t('vcProfile.hero.settingsAriaLabel')}>
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
