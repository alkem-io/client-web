import { FileText, Home, Settings, Share2, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { safeHttpUrl } from '@/crd/lib/safeHttpUrl';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';

type MemberAvatar = {
  id: string;
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
  videoCallUrl?: string;
  settingsHref?: string;
  onSettingsClick?: () => void;
};

type SpaceHeaderProps = {
  title: string;
  tagline?: string;
  bannerUrl?: string;
  isHomeSpace?: boolean;
  memberAvatars: MemberAvatar[];
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
  actions,
  onMemberClick,
  className,
}: SpaceHeaderProps) {
  const { t } = useTranslation('crd-space');
  const displayedAvatars = memberAvatars.slice(0, 5);
  const showAvatarStack = displayedAvatars.length > 0;
  const safeVideoCallUrl = safeHttpUrl(actions.videoCallUrl);
  const safeSettingsHref = safeHttpUrl(actions.settingsHref);

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
                {actions.showVideoCall &&
                  (safeVideoCallUrl ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded text-white hover:text-white/80 hover:bg-white/10"
                      aria-label={t('mobile.videoCall')}
                      asChild={true}
                    >
                      <a href={safeVideoCallUrl} target="_blank" rel="noopener noreferrer">
                        <Video className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded text-white hover:text-white/80 hover:bg-white/10"
                      onClick={actions.onVideoCallClick}
                      aria-label={t('mobile.videoCall')}
                    >
                      <Video className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  ))}
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
                {actions.showSettings &&
                  (safeSettingsHref ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded text-white hover:text-white/80 hover:bg-white/10"
                      aria-label={t('mobile.settings')}
                      asChild={true}
                    >
                      <a href={safeSettingsHref}>
                        <Settings className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded text-white hover:text-white/80 hover:bg-white/10"
                      onClick={actions.onSettingsClick}
                      aria-label={t('mobile.settings')}
                    >
                      <Settings className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: title + tagline (left) */}
        <div className="relative h-full flex flex-col justify-end w-full px-6 md:px-8 pb-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-start-2 lg:col-span-10">
              <div className="max-w-3xl text-primary-foreground">
                <div className="flex items-center gap-2 mb-4">
                  <h1 className="font-bold tracking-tight leading-tight" style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}>
                    {title}
                  </h1>
                  {isHomeSpace && (
                    <>
                      <Home className="h-5 w-5 text-primary-foreground/80 shrink-0" aria-hidden="true" />
                      <span className="sr-only">{t('banner.homeSpace')}</span>
                    </>
                  )}
                </div>
                {tagline && <p className="max-w-xl text-body text-primary-foreground/90">{tagline}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Member avatar stack — bottom-right, aligned with the action-icon row above */}
        {showAvatarStack && (
          <div className="absolute bottom-6 left-0 right-0 px-6 md:px-8">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-start-2 lg:col-span-10 flex justify-end">
                <button
                  type="button"
                  className="flex items-center gap-4 cursor-pointer transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
                  onClick={onMemberClick}
                  aria-label={t('members.title')}
                >
                  <div className="flex -space-x-2">
                    {displayedAvatars.map(avatar => (
                      <Avatar
                        key={avatar.id}
                        className="w-10 h-10 border-2 border-background transition-transform hover:z-10 hover:scale-110"
                      >
                        {avatar.url && <AvatarImage src={avatar.url} alt={avatar.initials} />}
                        <AvatarFallback
                          style={{ background: 'color-mix(in srgb, var(--primary) 20%, transparent)' }}
                          className="text-caption text-primary-foreground"
                        >
                          {avatar.initials}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
