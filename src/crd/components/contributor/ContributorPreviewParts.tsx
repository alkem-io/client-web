import { Bot, MapPin } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CollapsibleTagList } from '@/crd/components/common/CollapsibleTagList';
import type { ContributorPreviewData } from '@/crd/components/contributor/ContributorHoverCard';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';

type PreviewHeadProps = {
  contributor: ContributorPreviewData;
  /** Renders the name; the hover card links it, the sheet titles the dialog with it. */
  name: ReactNode;
  avatarClassName: string;
  className?: string;
};

/** Avatar, name, and location — or "Virtual contributor" for a VC. */
export function PreviewHead({ contributor, name, avatarClassName, className }: PreviewHeadProps) {
  const { t } = useTranslation('crd-space');
  const isOrg = contributor.type === 'organization';
  const isVc = contributor.type === 'virtualContributor';

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Avatar className={cn('shrink-0 border border-border', avatarClassName, isOrg && 'rounded-md')}>
        {contributor.avatarUrl && (
          <AvatarImage src={contributor.avatarUrl} alt={contributor.name} className={cn(isOrg && 'rounded-md')} />
        )}
        <AvatarFallback className={cn('text-card-title', isOrg && 'rounded-md')}>
          {contributor.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        {name}
        {isVc ? (
          <div className="mt-1 flex items-center gap-1 text-caption text-muted-foreground">
            <Bot className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{t('contributors.preview.virtualContributor')}</span>
          </div>
        ) : (
          contributor.locationLabel && (
            <div className="mt-1 flex items-center gap-1 text-caption text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{contributor.locationLabel}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

type PreviewDetailsProps = {
  contributor: ContributorPreviewData;
  taglineClassName: string;
  tagRows: number;
};

/** Tagline and keyword tags; each is left out when empty. */
export function PreviewDetails({ contributor, taglineClassName, tagRows }: PreviewDetailsProps) {
  return (
    <>
      {contributor.tagline && (
        <p className={cn('mt-3 text-body text-muted-foreground', taglineClassName)}>{contributor.tagline}</p>
      )}
      {contributor.tags?.length ? (
        <CollapsibleTagList tags={contributor.tags} maxRows={tagRows} className="mt-3" />
      ) : null}
    </>
  );
}
