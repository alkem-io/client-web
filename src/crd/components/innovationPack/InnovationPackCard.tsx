import { Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CollapsibleTagList } from '@/crd/components/common/CollapsibleTagList';
import { InlineMarkdown } from '@/crd/components/common/InlineMarkdown';
import { backgroundGradient } from '@/crd/lib/backgroundGradient';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import type { InnovationPackCardData } from './types';

export type InnovationPackCardProps = {
  pack: InnovationPackCardData;
  className?: string;
};

/**
 * Innovation Pack card — banner + provider avatar/name + name + description + tags + template-count badge.
 * The card is a single `<a>` link to the pack's public profile (`pack.url`); navigation is the host's
 * concern — we never call `useNavigate` or `window.location`.
 */
export function InnovationPackCard({ pack, className }: InnovationPackCardProps) {
  const { t } = useTranslation('crd-templates');
  const providerInitials = pack.providerName
    ? pack.providerName
        .split(/\s+/)
        .map(part => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <a
      href={pack.url}
      className={cn(
        'group block h-full overflow-hidden rounded-lg border bg-card outline-none transition-all duration-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden">
        {pack.bannerUrl ? (
          <img
            src={pack.bannerUrl}
            alt=""
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center" style={backgroundGradient(pack.color)}>
            <Package aria-hidden="true" className="size-10 text-white/80" />
          </div>
        )}
        <span className="absolute bottom-2 left-2 rounded bg-background/90 px-2 py-0.5 text-caption font-semibold shadow-sm backdrop-blur">
          {t('packCard.templateCount', { count: pack.templateCount })}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-2">
          <Avatar className="size-8 shrink-0">
            {pack.providerAvatarUrl ? (
              <AvatarImage src={pack.providerAvatarUrl} alt="" />
            ) : (
              <AvatarFallback
                aria-hidden="true"
                className="text-badge text-white"
                style={{ backgroundColor: pack.color }}
              >
                {providerInitials}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="text-card-title truncate group-hover:text-primary">{pack.name}</h3>
            {pack.providerName && (
              <p className="truncate text-caption text-muted-foreground">
                {t('packCard.byProvider', { name: pack.providerName })}
              </p>
            )}
          </div>
        </div>

        {pack.description && (
          <InlineMarkdown content={pack.description} clampLines={2} className="text-body text-muted-foreground" />
        )}

        {pack.tags.length > 0 && (
          <div className="mt-auto">
            <CollapsibleTagList tags={pack.tags} />
          </div>
        )}
      </div>
    </a>
  );
}
