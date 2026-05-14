import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback } from '@/crd/primitives/avatar';

const MAX_VISIBLE = 6;

type SubspaceItem = {
  name: string;
  initials: string;
  href: string;
};

type SubspacesSectionProps = {
  subspaces: SubspaceItem[];
  showAllHref?: string;
  onShowAllClick?: () => void;
  onSubspaceClick?: (href: string) => void;
  className?: string;
};

export function SubspacesSection({
  subspaces,
  showAllHref,
  onShowAllClick,
  onSubspaceClick,
  className,
}: SubspacesSectionProps) {
  const { t } = useTranslation('crd-space');

  // When the consumer wires a "Show all" affordance, cap the list at 6 and
  // surface the top-right link. Without a wire-up (e.g. the dedicated Subspaces
  // tab page), render the full list with no link and no fade.
  const hasShowAll = Boolean(showAllHref) || Boolean(onShowAllClick);
  const visible = hasShowAll ? subspaces.slice(0, MAX_VISIBLE) : subspaces;
  const isTruncated = hasShowAll && subspaces.length > MAX_VISIBLE;
  const showAllLabel = t('sidebar.showAll');

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="uppercase text-label text-muted-foreground">{t('sidebar.subspaces')}</h3>
        {hasShowAll &&
          subspaces.length > 0 &&
          (showAllHref ? (
            <a
              href={showAllHref}
              className="text-caption font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              {showAllLabel}
            </a>
          ) : (
            <button
              type="button"
              onClick={onShowAllClick}
              className="text-caption font-medium text-primary hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              {showAllLabel}
            </button>
          ))}
      </div>
      <div className="relative">
        <div className="space-y-1">
          {visible.map(subspace => (
            <a
              key={subspace.name}
              href={subspace.href}
              onClick={e => {
                if (onSubspaceClick) {
                  e.preventDefault();
                  onSubspaceClick(subspace.href);
                }
              }}
              className="group flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-7 h-7 rounded-md">
                  <AvatarFallback className="rounded-md text-badge">{subspace.initials}</AvatarFallback>
                </Avatar>
                <span className="text-body-emphasis text-foreground">{subspace.name}</span>
              </div>
              <ChevronRight
                className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                aria-hidden="true"
              />
            </a>
          ))}
        </div>
        {isTruncated && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent"
          />
        )}
      </div>
    </div>
  );
}
