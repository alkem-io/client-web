import { FoldHorizontal, Settings, UnfoldHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AlkemioLogo } from '@/crd/components/common/AlkemioLogo';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { SpaceCard, type SpaceCardData } from '@/crd/components/space/SpaceCard';
import { contentColumnClass } from '@/crd/lib/contentColumn';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { InnovationHubBanner } from './InnovationHubBanner';

export type InnovationHubHomeData = {
  name: string;
  tagline: string;
  description: string;
  bannerImageUrl?: string;
  bannerColor: string;
  bannerAlt: string;
  settingsUrl?: string;
  spaces: SpaceCardData[];
  allSpacesUrl: string;
};

export type InnovationHubHomeProps = {
  data: InnovationHubHomeData;
  onSettingsClick?: () => void;
  /**
   * Current full-width state — mirrors the Spaces "Wide layout" toggle. When
   * `true`, the content band fills all 12 grid columns; when `false`, the band
   * sits in the centered `col-start-2 col-span-10` inset.
   */
  fullWidth?: boolean;
  /**
   * When provided, renders the expand/collapse toggle next to the settings gear.
   * Omitting both `fullWidth` and `onToggleFullWidth` hides the toggle entirely.
   */
  onToggleFullWidth?: () => void;
};

export const InnovationHubHome = ({
  data,
  onSettingsClick,
  fullWidth = false,
  onToggleFullWidth,
}: InnovationHubHomeProps) => {
  const { t } = useTranslation('crd-innovationHub');
  const bandClass = contentColumnClass(fullWidth);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <InnovationHubBanner imageUrl={data.bannerImageUrl} color={data.bannerColor} alt={data.bannerAlt} />

      <div className="w-full px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className={cn('col-span-12 flex flex-col gap-1', bandClass)}>
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-hero text-foreground">{data.name}</h1>
              <div className="flex shrink-0 items-center gap-1">
                {onToggleFullWidth && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden h-9 w-9 lg:inline-flex"
                    onClick={onToggleFullWidth}
                    aria-pressed={fullWidth}
                    aria-label={fullWidth ? t('home.collapseWidth') : t('home.expandWidth')}
                  >
                    {fullWidth ? (
                      <FoldHorizontal className="size-4" aria-hidden="true" />
                    ) : (
                      <UnfoldHorizontal className="size-4" aria-hidden="true" />
                    )}
                  </Button>
                )}
                {data.settingsUrl && (
                  <a
                    href={data.settingsUrl}
                    onClick={onSettingsClick}
                    className={cn(
                      'rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent',
                      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
                    )}
                    aria-label={t('home.settingsAria')}
                  >
                    <Settings className="size-4" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
            {data.tagline && <p className="text-body italic text-muted-foreground">{data.tagline}</p>}
          </div>
        </div>
      </div>

      <div className="w-full px-8 pb-8">
        <div className="grid grid-cols-12 gap-6">
          <div className={cn('col-span-12 flex flex-col gap-10', bandClass)}>
            {data.description && (
              <section>
                <div className="rounded-xl border border-border bg-card p-6">
                  <MarkdownContent content={data.description} />
                </div>
              </section>
            )}

            <section>
              <h2 className="text-section-title mb-6 text-foreground">
                {t('home.spacesSection.title', { hubName: data.name })}
              </h2>
              {data.spaces.length === 0 ? (
                <div className="rounded-lg border border-border bg-card/50 p-8 text-center text-muted-foreground">
                  <p className="text-body">{t('home.spacesSection.empty')}</p>
                </div>
              ) : (
                <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {data.spaces.map(space => (
                    <li key={space.id}>
                      <SpaceCard space={space} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="flex items-center gap-3 px-4 py-3 text-muted-foreground">
              <div className="size-4 shrink-0">
                <AlkemioLogo aria-hidden="true" />
              </div>
              <p className="text-caption">
                <a
                  href={data.allSpacesUrl}
                  className={cn(
                    'underline underline-offset-2 hover:opacity-80',
                    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'
                  )}
                >
                  {t('home.allSpacesCta')}
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
