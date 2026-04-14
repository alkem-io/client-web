import { FileText, Home, Settings, Share2, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';

type MemberAvatar = {
  url?: string;
  initials: string;
};

type SpaceHeaderActions = {
  showDocuments?: boolean;
  showVideoCall?: boolean;
  showShare?: boolean;
  showSettings?: boolean;
  onDocumentsClick?: () => void;
  onVideoCallClick?: () => void;
  onShareClick?: () => void;
  settingsHref?: string;
  onSettingsClick?: () => void;
};

type SpaceHeaderProps = {
  title: string;
  tagline?: string;
  bannerUrl?: string;
  isHomeSpace?: boolean;
  memberAvatars: MemberAvatar[];
  memberCount: number;
  actions: SpaceHeaderActions;
  onMemberClick?: () => void;
  className?: string;
};

export function SpaceHeader({
  title,
  tagline,
  bannerUrl,
  isHomeSpace,
  memberAvatars,
  memberCount,
  actions,
  onMemberClick,
  className,
}: SpaceHeaderProps) {
  const { t } = useTranslation('crd-space');
  const displayedAvatars = memberAvatars.slice(0, 5);
  const extraCount = memberCount - displayedAvatars.length;

  return (
    <div className={cn('flex flex-col bg-background', className)}>
      <div
        className="relative w-full h-[320px] overflow-hidden group"
        role="img"
        aria-label={t('a11y.spaceBanner', { name: title })}
      >
        {/* Background image */}
        <div
          className={cn(
            'absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105',
            !bannerUrl && 'bg-muted'
          )}
          style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, color-mix(in srgb, var(--foreground) 40%, transparent), color-mix(in srgb, var(--foreground) 8%, transparent))',
          }}
        />

        {/* Top-right action buttons */}
        <div className="absolute top-0 left-0 right-0 z-10 px-6 md:px-8 pt-8">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-start-2 lg:col-span-10 flex items-center justify-end">
              <div className="flex items-center gap-2">
                {actions.showDocuments && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded text-white hover:text-white/80 hover:bg-white/10"
                    onClick={actions.onDocumentsClick}
                    aria-label={t('mobile.activity')}
                  >
                    <FileText className="h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
                {actions.showVideoCall && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded text-white hover:text-white/80 hover:bg-white/10"
                    onClick={actions.onVideoCallClick}
                    aria-label={t('mobile.videoCall')}
                  >
                    <Video className="h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
                {actions.showShare && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded text-white hover:text-white/80 hover:bg-white/10"
                    onClick={actions.onShareClick}
                    aria-label={t('mobile.share')}
                  >
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
                {actions.showSettings && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded text-white hover:text-white/80 hover:bg-white/10"
                    onClick={actions.onSettingsClick}
                    aria-label={t('mobile.settings')}
                    asChild={!!actions.settingsHref}
                  >
                    {actions.settingsHref ? (
                      <a href={actions.settingsHref}>
                        <Settings className="h-4 w-4" aria-hidden="true" />
                      </a>
                    ) : (
                      <span>
                        <Settings className="h-4 w-4" aria-hidden="true" />
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Title + tagline + member avatars */}
        <div className="relative h-full flex flex-col justify-end w-full px-6 md:px-8 pb-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-start-2 lg:col-span-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-3xl text-primary-foreground">
                  <div className="flex items-center gap-2 mb-4">
                    <h1
                      className="font-bold tracking-tight leading-tight"
                      style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}
                    >
                      {title}
                    </h1>
                    {isHomeSpace && (
                      <>
                        <Home className="h-5 w-5 text-primary-foreground/80 shrink-0" aria-hidden="true" />
                        <span className="sr-only">{t('banner.homeSpace')}</span>
                      </>
                    )}
                  </div>
                  {tagline && (
                    <p className="max-w-xl text-base text-primary-foreground/90 leading-relaxed">{tagline}</p>
                  )}
                </div>

                {/* Member avatars */}
                <button
                  type="button"
                  className="flex items-center gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={onMemberClick}
                  aria-label={t('members.title')}
                >
                  <div className="flex -space-x-2">
                    {displayedAvatars.map(avatar => (
                      <Avatar
                        key={avatar.initials}
                        className="w-10 h-10 border-2 border-background transition-transform hover:z-10 hover:scale-110"
                      >
                        {avatar.url && <AvatarImage src={avatar.url} alt={avatar.initials} />}
                        <AvatarFallback
                          style={{
                            background: 'color-mix(in srgb, var(--primary) 20%, transparent)',
                          }}
                          className="text-xs text-primary-foreground"
                        >
                          {avatar.initials}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {extraCount > 0 && (
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-full backdrop-blur-sm text-xs font-medium border-2 border-background text-primary-foreground"
                        style={{
                          background: 'color-mix(in srgb, var(--primary-foreground) 20%, transparent)',
                        }}
                      >
                        +{extraCount}
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
