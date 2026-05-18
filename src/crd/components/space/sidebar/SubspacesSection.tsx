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
  /** When the list is empty, the top-right "Show all" affordance is replaced by
   *  a "Create" link that calls this callback. The section stays hidden when
   *  empty AND this is not provided. */
  onCreateClick?: () => void;
  className?: string;
};

export function SubspacesSection({
  subspaces,
  showAllHref,
  onShowAllClick,
  onSubspaceClick,
  onCreateClick,
  className,
}: SubspacesSectionProps) {
  const { t } = useTranslation('crd-space');

  // When the consumer wires a "Show all" affordance, cap the list at 6 and
  // surface the top-right link. Without a wire-up (e.g. the dedicated Subspaces
  // tab page), render the full list with no link and no fade.
  const hasShowAll = Boolean(showAllHref) || Boolean(onShowAllClick);
  const visible = hasShowAll ? subspaces.slice(0, MAX_VISIBLE) : subspaces;
  const isTruncated = hasShowAll && subspaces.length > MAX_VISIBLE;
  const isEmpty = subspaces.length === 0;

  // Hide the whole section when there's nothing to show AND no Create affordance.
  if (isEmpty && !onCreateClick) return null;

  const showAllLabel = t('sidebar.showAll');
  const createLabel = t('sidebar.create');

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="uppercase text-label text-muted-foreground">{t('sidebar.subspaces')}</h3>
        {isEmpty
          ? onCreateClick && (
              <button
                type="button"
                onClick={onCreateClick}
                className="text-caption font-medium text-primary hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                {createLabel}
              </button>
            )
          : hasShowAll &&
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
        {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
        {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
        <ul role="list" className="space-y-1">
          {visible.map(subspace => (
            <li key={subspace.href}>
              <a
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
            </li>
          ))}
        </ul>
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
