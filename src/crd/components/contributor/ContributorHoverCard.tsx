import { MapPin, MessageCircle } from 'lucide-react';
import { type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ContributorCardData } from '@/crd/components/callout/ContributorCollection/ContributorCard';
import { CollapsibleTagList } from '@/crd/components/common/CollapsibleTagList';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/crd/primitives/hover-card';
import { IconButton } from '@/crd/primitives/icon-button';

export type ContributorPreviewData = Pick<
  ContributorCardData,
  'id' | 'type' | 'name' | 'avatarUrl' | 'href' | 'locationLabel' | 'tagline' | 'tags' | 'canMessage'
>;

type ContributorHoverCardProps = {
  contributor: ContributorPreviewData;
  onMessage?: (contributor: ContributorPreviewData) => void;
  /** The existing profile link; it becomes the hover-card trigger. */
  children: ReactElement;
};

export function ContributorHoverCard({ contributor, onMessage, children }: ContributorHoverCardProps) {
  const { t } = useTranslation('crd-space');
  const isOrg = contributor.type === 'organization';
  const showLocation = contributor.type !== 'virtualContributor' && Boolean(contributor.locationLabel);
  const showMessage = contributor.canMessage && onMessage;
  const [open, setOpen] = useState(false);

  return (
    <HoverCard open={open} onOpenChange={setOpen} openDelay={300} closeDelay={150}>
      <HoverCardTrigger asChild={true}>{children}</HoverCardTrigger>
      <HoverCardContent className="w-72 p-4">
        <div className="flex items-start gap-3">
          <Avatar className={cn('w-12 h-12 shrink-0 border border-border', isOrg && 'rounded-md')}>
            {contributor.avatarUrl && (
              <AvatarImage src={contributor.avatarUrl} alt={contributor.name} className={cn(isOrg && 'rounded-md')} />
            )}
            <AvatarFallback className={cn('text-card-title', isOrg && 'rounded-md')}>
              {contributor.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            {contributor.href ? (
              <a
                href={contributor.href}
                className="block truncate text-card-title text-foreground transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {contributor.name}
              </a>
            ) : (
              <span className="block truncate text-card-title text-foreground">{contributor.name}</span>
            )}
            {showLocation && (
              <div className="mt-1 flex items-center gap-1 text-caption text-muted-foreground">
                <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{contributor.locationLabel}</span>
              </div>
            )}
          </div>
          {showMessage && (
            <IconButton
              variant="ghost"
              tooltipLabel={t('contributors.card.message')}
              className="h-8 w-8 shrink-0 text-muted-foreground"
              onClick={() => {
                // The chat panel opens where the card would otherwise sit on top of it.
                setOpen(false);
                onMessage(contributor);
              }}
            >
              <MessageCircle aria-hidden="true" />
            </IconButton>
          )}
        </div>
        {contributor.tagline && (
          <p className="mt-3 line-clamp-2 text-body text-muted-foreground">{contributor.tagline}</p>
        )}
        {contributor.tags?.length ? <CollapsibleTagList tags={contributor.tags} maxRows={1} className="mt-3" /> : null}
      </HoverCardContent>
    </HoverCard>
  );
}
