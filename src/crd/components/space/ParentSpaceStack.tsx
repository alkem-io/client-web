import { ArrowUpLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { backgroundGradient } from '@/crd/lib/backgroundGradient';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback } from '@/crd/primitives/avatar';

export type ParentSpaceStackItem = {
  name: string;
  /** Two-letter fallback shown in the tiny identity chip. */
  initials: string;
  href: string;
  /** The space's card banner. Falls back to the accent gradient when missing. */
  bannerUrl?: string;
  /** Deterministic accent colour for the gradient fallback (from `pickColorFromId`). */
  color?: string;
  /** One-line tagline shown on the innermost (closest) parent card. Plain text — never markdown. */
  tagline?: string;
};

type ParentSpaceStackProps = {
  /**
   * Ancestor spaces ordered outermost-first (L0, then L1). At most two are
   * rendered — spaces are capped at three levels, so a subspace never has more.
   */
  parents: ParentSpaceStackItem[];
  /**
   * Front card — the subspace's own info block. Must have an opaque background
   * so it covers the parent cards stacked behind it.
   */
  children: ReactNode;
  className?: string;
};

/* Each stacking level peeks out 14px above and 10px left of the card in front.
   Card size matches the front card (wrapper minus the total stack inset), so it
   is indexed by depth like the wrapper padding — a depth-1 stack insets 10/14px,
   a depth-2 stack 20/28px. The wrapper min-height (104px card + inset) keeps
   the parent cards visible — banner strip + name row — even when the front
   card is short or empty (e.g. a subspace with no description). */
const WRAPPER_PAD = ['pt-[14px] pl-[10px]', 'pt-[28px] pl-[20px]'];
const WRAPPER_MIN_H = ['min-h-[118px]', 'min-h-[132px]'];
const CARD_SIZE = ['w-[calc(100%-10px)] h-[calc(100%-14px)]', 'w-[calc(100%-20px)] h-[calc(100%-28px)]'];
const CARD_TOP = ['top-0', 'top-[14px]'];
const CARD_LEFT = ['left-0', 'left-[10px]'];

/**
 * Stacked mini-cards of the ancestor spaces behind the subspace info block —
 * the prototype's "parent stack". Each card shows the parent's card banner and
 * name, lifts slightly on hover (springy translate) and navigates back to that
 * space on click.
 */
export function ParentSpaceStack({ parents, children, className }: ParentSpaceStackProps) {
  const { t } = useTranslation('crd-space');
  const visibleParents = parents.slice(-2);
  const depth = visibleParents.length;

  if (depth === 0) {
    return <>{children}</>;
  }

  return (
    <div className={cn('relative', WRAPPER_PAD[depth - 1], WRAPPER_MIN_H[depth - 1], className)}>
      {visibleParents.map((parent, index) => {
        const innermost = index === depth - 1;
        return (
          <a
            key={parent.href}
            href={parent.href}
            title={t('parentStack.goTo', { name: parent.name })}
            aria-label={t('parentStack.goTo', { name: parent.name })}
            className={cn(
              'group absolute flex flex-col rounded-xl overflow-hidden',
              'border border-border bg-card shadow-sm no-underline',
              'transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-[3px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              CARD_SIZE[depth - 1],
              CARD_TOP[index],
              CARD_LEFT[index]
            )}
          >
            {/* Fills the card above the name row; the min-height guarantees a
                visible banner strip even at the wrapper's minimum height. */}
            <div className="flex-1 min-h-16 overflow-hidden">
              {parent.bannerUrl ? (
                <img
                  src={parent.bannerUrl}
                  alt=""
                  className="block w-full h-full object-cover transition-[filter] duration-300 group-hover:brightness-105"
                />
              ) : (
                <div className="w-full h-full" style={parent.color ? backgroundGradient(parent.color) : undefined} />
              )}
            </div>
            <div className="flex flex-col gap-1 px-3 py-2 shrink-0">
              <div className="flex items-center gap-2">
                <Avatar className="size-5 rounded">
                  <AvatarFallback className="rounded bg-primary text-primary-foreground text-badge">
                    {parent.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-caption font-medium text-foreground truncate">{parent.name}</span>
                <ArrowUpLeft
                  className="w-3 h-3 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-70"
                  aria-hidden="true"
                />
              </div>
              {innermost && parent.tagline && (
                <p className="text-caption text-muted-foreground line-clamp-2">{parent.tagline}</p>
              )}
            </div>
          </a>
        );
      })}

      {/* Front card — relative so it paints above the absolute parent cards. */}
      <div className="relative">{children}</div>
    </div>
  );
}
