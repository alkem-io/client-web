import { Activity, Settings, Share2, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';

type MemberAvatar = {
  id: string;
  url?: string;
  initials: string;
};

export type SubspaceHeaderActionsData = {
  showActivity: boolean;
  showVideoCall: boolean;
  showShare: boolean;
  showSettings: boolean;
  shareUrl?: string;
  settingsHref?: string;
  onActivityClick?: () => void;
  onVideoCallClick?: () => void;
  onShareClick?: () => void;
};

export type SubspaceHeaderProps = {
  /** Subspace identity */
  title: string;
  tagline?: string;
  subspaceInitials: string;
  subspaceColor: string;
  subspaceAvatarUrl?: string;

  /** Immediate parent identity (L0 for L1, L1 for L2) */
  parentName: string;
  parentInitials: string;
  parentColor: string;
  parentBannerUrl?: string;

  /** Level badge */
  badgeLabel: 'SubSpace' | 'SubSubSpace';

  /** Banner action icons */
  actions: SubspaceHeaderActionsData;

  /** Community avatar stack */
  memberAvatars: MemberAvatar[];
  onMemberClick?: () => void;

  className?: string;
};

export function SubspaceHeader({
  title,
  tagline,
  subspaceInitials,
  subspaceColor,
  subspaceAvatarUrl,
  parentName,
  parentInitials,
  parentColor,
  parentBannerUrl,
  badgeLabel,
  actions,
  memberAvatars,
  onMemberClick,
  className,
}: SubspaceHeaderProps) {
  const { t } = useTranslation('crd-subspace');
  const displayedAvatars = memberAvatars.slice(0, 5);
  const showAvatarStack = displayedAvatars.length > 0;

  const badgeText = badgeLabel === 'SubSubSpace' ? t('badge.subSubspace') : t('badge.subspace');

  return (
    <div className={cn('flex flex-col bg-background', className)}>
      <div
        className="relative w-full h-52 md:h-64 overflow-hidden group"
        role="img"
        aria-label={t('a11y.subspaceBanner', { name: title })}
      >
        {/* Banner background — parent's banner image when present, else gradient from parent's accent color */}
        <div
          className={cn(
            'absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105',
            !parentBannerUrl && 'bg-muted'
          )}
          style={
            parentBannerUrl
              ? { backgroundImage: `url(${parentBannerUrl})` }
              : { background: `linear-gradient(135deg, ${parentColor}, color-mix(in srgb, ${parentColor} 70%, black))` }
          }
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Top-right action icons */}
        <div className="absolute top-0 left-0 right-0 z-10 px-6 md:px-8 pt-8">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-start-2 lg:col-span-10 flex items-center justify-end">
              <div className="flex items-center gap-2">
                {actions.showActivity && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded text-white hover:text-white/80 hover:bg-white/10"
                    onClick={actions.onActivityClick}
                    aria-label={t('actions.activity')}
                  >
                    <Activity className="h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
                {actions.showVideoCall && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded text-white hover:text-white/80 hover:bg-white/10"
                    onClick={actions.onVideoCallClick}
                    aria-label={t('actions.videoCall')}
                  >
                    <Video className="h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
                {actions.showShare &&
                  (actions.shareUrl ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded text-white hover:text-white/80 hover:bg-white/10"
                      aria-label={t('actions.share')}
                      asChild={true}
                    >
                      <a href={actions.shareUrl}>
                        <Share2 className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded text-white hover:text-white/80 hover:bg-white/10"
                      onClick={actions.onShareClick}
                      aria-label={t('actions.share')}
                    >
                      <Share2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  ))}
                {actions.showSettings && actions.settingsHref && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded text-white hover:text-white/80 hover:bg-white/10"
                    aria-label={t('actions.settings')}
                    asChild={true}
                  >
                    <a href={actions.settingsHref}>
                      <Settings className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Level badge — top-right */}
        <Badge
          variant="secondary"
          className="absolute top-4 right-4 backdrop-blur-sm border-0 text-badge uppercase"
          style={{
            background: 'color-mix(in srgb, var(--background) 80%, transparent)',
            letterSpacing: '0.08em',
          }}
        >
          {badgeText}
        </Badge>

        {/* Member avatar stack — bottom-right */}
        {showAvatarStack && (
          <div className="absolute bottom-6 right-6 md:right-8">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-start-2 lg:col-span-10 flex justify-end">
                <button
                  type="button"
                  className="flex items-center gap-4 cursor-pointer transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
                  onClick={onMemberClick}
                  aria-label={t('members.viewCommunity')}
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

      {/* Below-banner: layered avatar overlapping upward + title/tagline */}
      <div className="px-6 md:px-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-start-2 lg:col-span-10 flex flex-col md:flex-row items-start gap-5">
            {/* Two-layered avatar — parent behind, subspace in front */}
            <div className="relative shrink-0 -mt-12 w-28 h-28">
              {/* Parent avatar (behind, top-left) */}
              <div
                role="img"
                aria-label={t('a11y.parentLink', { name: parentName })}
                className="absolute top-0 left-0 size-[72px] rounded-xl border-[3px] border-background overflow-hidden flex items-center justify-center z-[1]"
                style={parentBannerUrl ? undefined : { background: parentColor }}
              >
                {parentBannerUrl ? (
                  <img src={parentBannerUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-subsection-title font-bold text-primary-foreground" aria-hidden="true">
                    {parentInitials}
                  </span>
                )}
              </div>

              {/* Subspace avatar (in front, bottom-right) */}
              <div
                className="absolute top-6 left-6 size-[88px] rounded-xl border-[3px] border-background overflow-hidden flex items-center justify-center z-[2] shadow-sm"
                style={subspaceAvatarUrl ? undefined : { background: subspaceColor }}
              >
                {subspaceAvatarUrl ? (
                  <img src={subspaceAvatarUrl} alt={title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-section-title font-bold text-primary-foreground">{subspaceInitials}</span>
                )}
              </div>
            </div>

            {/* Title + tagline below banner */}
            <div className="flex-1 pt-4 min-w-0">
              <h1 className="text-page-title text-foreground mb-1 tracking-tight truncate">{title}</h1>
              {tagline && <p className="max-w-xl text-body text-muted-foreground">{tagline}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
