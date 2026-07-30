import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/crd/primitives/collapsible';
import type { CompactSpaceCardData } from './CompactSpaceCard';
import { CompactSpaceCard, CompactSpaceCardSkeleton } from './CompactSpaceCard';
import { HomeSpacePlaceholder } from './HomeSpacePlaceholder';

type CollapsibleSpaceSectionProps = {
  title: string;
  items: CompactSpaceCardData[];
  /** Maximum cards shown, counting the empty-pin slot when present. Default 4. */
  maxVisible?: number;
  defaultExpanded?: boolean;
  loading?: boolean;
  /** When set, an empty home-space pin slot is rendered first (Section 1 with no home Space). */
  emptyPinSlot?: { settingsHref: string };
  /** When provided and the total item count exceeds `maxVisible`, a "show more" trigger is shown. */
  showMore?: { onShowMore: () => void };
  /** Invoked when the home-space pin badge on a card is activated. */
  onPinClick?: () => void;
  className?: string;
};

export function CollapsibleSpaceSection({
  title,
  items,
  maxVisible = 4,
  defaultExpanded = true,
  loading,
  emptyPinSlot,
  showMore,
  onPinClick,
  className,
}: CollapsibleSpaceSectionProps) {
  const { t } = useTranslation('crd-dashboard');
  const [open, setOpen] = useState(defaultExpanded);

  // The empty-pin placeholder occupies one of the row's slots, so the space cards
  // fill the remainder — mirrors the RecentSpaces row behaviour.
  const slotsForCards = Math.max(0, maxVisible - (emptyPinSlot ? 1 : 0));
  const visibleItems = items.slice(0, slotsForCards);
  const showMoreVisible = !!showMore && items.length > slotsForCards;
  const totalCount = items.length + (emptyPinSlot ? 1 : 0);

  return (
    <section className={cn('space-y-4', className)}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
          <div className="flex items-center gap-2">
            <h2 className="text-section-title">{title}</h2>
            {totalCount > 0 && (
              <Badge variant="secondary" className="shrink-0">
                {totalCount}
              </Badge>
            )}
          </div>
          <ChevronDown
            className="size-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
            aria-hidden="true"
          />
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-4">
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
              Array.from({ length: maxVisible }).map((_, i) => (
                <li key={i}>
                  <CompactSpaceCardSkeleton />
                </li>
              ))
            ) : (
              <>
                {emptyPinSlot && (
                  <li>
                    <HomeSpacePlaceholder settingsHref={emptyPinSlot.settingsHref} />
                  </li>
                )}
                {visibleItems.map(item => (
                  <li key={item.id}>
                    <CompactSpaceCard {...item} onPinClick={item.isHomeSpace ? onPinClick : undefined} />
                  </li>
                ))}
              </>
            )}
          </ul>

          {showMoreVisible && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={showMore.onShowMore}
                className="text-body-emphasis text-primary transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
              >
                {t('nonActivity.showMore')}
              </button>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
