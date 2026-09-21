import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { InlineMarkdown } from '@/crd/components/common/InlineMarkdown';
import { useElementWidth } from '@/crd/hooks/useElementWidth';
import { hasVisibleExcerptText } from '@/crd/lib/markdownExcerpt';
import { cn } from '@/crd/lib/utils';
import type { SpaceCardData } from './SpaceCard';
import { SpaceCardIdentity, SpaceCardLeads } from './SpaceCardIdentity';

/**
 * The card width, measured on the card itself (not the screen — FR-012), at and
 * above which the identity block and the What/Why/Who content sit side by side.
 * Below it they stack, identity first. Reference value from the design source
 * (spec Assumption A-1 / FR-011).
 */
const ROW_LAYOUT_MIN_WIDTH = 520;

export type ExpandedSpaceCardProps = {
  space: SpaceCardData;
  onClick?: (space: SpaceCardData) => void;
  onParentClick?: (parent: NonNullable<SpaceCardData['parent']>) => void;
  className?: string;
};

/**
 * The expanded (rich) subspace card (feature 076) — the compact card's identity
 * block, reused unchanged via `SpaceCardIdentity`, plus clamped What/Why/Who
 * excerpts and a full-width leads footer.
 *
 * One link per card (FR-018): the subspace name is a *stretched* link — its hit
 * area (`after:absolute after:inset-0`) covers the whole card via the `article`'s
 * `relative` positioning, while the tag row's own real controls
 * (`SpaceCardIdentity`'s `relative z-10` wrappers) stay above that overlay and
 * keep working. The footer's "Open subspace" cue is `aria-hidden` — a visual cue
 * inside the one link, never a second stop (spec Assumption A-4).
 *
 * Layout follows the card's OWN measured width (`useElementWidth`), never a
 * screen breakpoint (FR-012) — the same post renders in the feed, a sidebar
 * column, and the post detail dialog at different widths for the same viewport.
 */
export function ExpandedSpaceCard({ space, onClick, onParentClick, className }: ExpandedSpaceCardProps) {
  const { t } = useTranslation(['crd-exploreSpaces', 'crd-common', 'crd-space']);
  const [width, widthRef] = useElementWidth();
  const isRow = (width ?? 0) >= ROW_LAYOUT_MIN_WIDTH;

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick(space);
    }
  };

  const nameSlot = (
    <h3 className="text-card-title text-card-foreground transition-colors duration-200">
      <a
        href={space.href}
        onClick={handleClick}
        aria-label={space.name}
        className={cn(
          'truncate block outline-none',
          'after:absolute after:inset-0 after:content-[""]',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl'
        )}
      >
        {space.name}
      </a>
    </h3>
  );

  const sections: Array<{ key: 'what' | 'why' | 'who'; value: string | undefined; clampLines: 2 | 3 }> = [
    { key: 'what', value: space.what, clampLines: 3 },
    { key: 'why', value: space.why, clampLines: 2 },
    { key: 'who', value: space.who, clampLines: 2 },
  ];

  return (
    <article
      ref={widthRef}
      className={cn(
        'relative flex flex-col rounded-xl bg-card border border-border overflow-hidden',
        'shadow-none hover:shadow-[var(--elevation-sm)] hover:border-primary/30 transition-all duration-300',
        className
      )}
    >
      <div className={cn('flex', isRow ? 'flex-row' : 'flex-col')}>
        <div className={isRow ? 'w-[300px] shrink-0 border-r border-border' : 'border-b border-border'}>
          <SpaceCardIdentity space={space} onParentClick={onParentClick} nameSlot={nameSlot} />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-5 p-6">
          {sections.map(section =>
            hasVisibleExcerptText(section.value) ? (
              <ExcerptSection
                key={section.key}
                label={t(`crd-space:subspaces.expandedCard.${section.key}`)}
                value={section.value as string}
                clampLines={section.clampLines}
                primary={section.key === 'what'}
              />
            ) : null
          )}
        </div>
      </div>

      {/* Full-width footer — closes the card in both the row and the stacked
          arrangement (FR-011). Always renders (it hosts the call-to-action cue);
          the "Leads" group alone is omitted when the subspace has no leads. */}
      <div className="flex items-center justify-between gap-3 mt-auto px-4 py-3 border-t border-border">
        <SpaceCardLeads leads={space.leads} />
        <span
          aria-hidden="true"
          className="inline-flex items-center gap-1.5 rounded text-control text-primary-foreground bg-primary px-3 py-1.5 whitespace-nowrap"
        >
          {t('crd-space:subspaces.expandedCard.open')}
          <ArrowRight className="size-3.5" />
        </span>
      </div>
    </article>
  );
}

type ExcerptSectionProps = {
  label: string;
  value: string;
  clampLines: 2 | 3;
  primary: boolean;
};

function ExcerptSection({ label, value, clampLines, primary }: ExcerptSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'uppercase shrink-0',
            primary ? 'text-label text-foreground' : 'text-badge text-muted-foreground'
          )}
        >
          {label}
        </span>
        <span aria-hidden="true" className="flex-1 h-px bg-border" />
      </div>
      <InlineMarkdown
        content={value}
        rawHtml="skip"
        disableLinks={true}
        clampLines={clampLines}
        className="mt-2.5 text-body text-muted-foreground break-words"
      />
    </div>
  );
}
