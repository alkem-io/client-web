import { Menu } from 'lucide-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDragScroll } from '@/crd/hooks/useDragScroll';
import { cn } from '@/crd/lib/utils';

type TabItem = {
  label: string;
  index: number;
  href?: string;
};

const MOBILE_TAB_LIST_CLASSES =
  'flex items-center gap-3 flex-1 min-w-0 overflow-x-auto scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] px-3';

/* Edge fades hinting at clipped tabs — applied only on the side(s) that
   actually have more content, so the last tab never fades when everything fits. */
const FADE_LEFT =
  '[mask-image:linear-gradient(to_right,transparent,black_2rem)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_2rem)]';
const FADE_RIGHT =
  '[mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] [-webkit-mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)]';
const FADE_BOTH =
  '[mask-image:linear-gradient(to_right,transparent,black_2rem,black_calc(100%-2rem),transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_2rem,black_calc(100%-2rem),transparent)]';

type SpaceNavigationTabsProps = {
  tabs: TabItem[];
  activeIndex: number;
  onTabChange: (index: number) => void;
  /** Mobile-only: opens the hamburger drawer. The drawer itself lives in the consumer layout. */
  onMenuClick?: () => void;
  /**
   * Desktop-only: right-aligned action slot rendered on the same row as the
   * tabs (e.g. an "Add Post" / "Create Subspace" button). Not shown on the
   * mobile bottom bar — consumers fall back to an in-content action there.
   */
  action?: ReactNode;
  isSmallScreen?: boolean;
  className?: string;
};

export function SpaceNavigationTabs({
  tabs,
  activeIndex,
  onTabChange,
  onMenuClick,
  action,
  isSmallScreen,
  className,
}: SpaceNavigationTabsProps) {
  if (isSmallScreen) {
    return <MobileTabBar tabs={tabs} activeIndex={activeIndex} onTabChange={onTabChange} onMenuClick={onMenuClick} />;
  }

  return (
    <DesktopTabs
      tabs={tabs}
      activeIndex={activeIndex}
      onTabChange={onTabChange}
      action={action}
      className={className}
    />
  );
}

function DesktopTabs({
  tabs,
  activeIndex,
  onTabChange,
  action,
  className,
}: {
  tabs: TabItem[];
  activeIndex: number;
  onTabChange: (index: number) => void;
  action?: ReactNode;
  className?: string;
}) {
  const { t } = useTranslation('crd-space');
  const dragScroll = useDragScroll<HTMLDivElement>();
  const [overflow, setOverflow] = useState({ left: false, right: false });

  const updateOverflow = () => {
    const el = dragScroll.ref.current;
    if (!el) return;
    const left = el.scrollLeft > 1;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setOverflow(prev => (prev.left === left && prev.right === right ? prev : { left, right }));
  };

  useEffect(() => {
    if (dragScroll.ref.current) {
      const activeTab = dragScroll.ref.current.querySelector('[data-active="true"]');
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeIndex]);

  // Track overflow so the edge fades only show when tabs are actually clipped
  // (long flow-state names, narrow viewports).
  useEffect(() => {
    updateOverflow();
    const el = dragScroll.ref.current;
    if (!el) return;
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(el);
    return () => observer.disconnect();
  }, [tabs.length]);

  return (
    <nav className={cn('w-full', className)} aria-label={t('a11y.tabNavigation')}>
      <div className="relative flex items-end justify-between gap-4">
        {/* Bottom border line that runs the full width — the active tab covers it with -mb-px */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-border" aria-hidden="true" />
        <div
          ref={dragScroll.ref}
          onPointerDown={dragScroll.onPointerDown}
          onScroll={updateOverflow}
          className={cn(
            'flex items-end overflow-x-auto overscroll-x-contain min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            (overflow.left || overflow.right) && 'cursor-grab',
            overflow.left && overflow.right && FADE_BOTH,
            overflow.left && !overflow.right && FADE_LEFT,
            !overflow.left && overflow.right && FADE_RIGHT
          )}
          role="tablist"
        >
          {tabs.map(tab => {
            const active = tab.index === activeIndex;
            return (
              <a
                key={tab.index}
                href={tab.href ?? '#'}
                role="tab"
                aria-selected={active}
                data-active={active}
                // Native link-dragging would hijack the pointer-drag scroll gesture.
                draggable={false}
                className={cn(
                  'relative px-5 py-3 text-body transition-all duration-200 whitespace-nowrap select-none rounded-t-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                  active
                    ? 'bg-background text-foreground font-semibold border border-border border-b-0 z-10 -mb-px'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
                )}
                onClick={e => {
                  e.preventDefault();
                  onTabChange(tab.index);
                }}
              >
                {tab.label}
              </a>
            );
          })}
        </div>
        {action && <div className="shrink-0 pb-3 relative z-10">{action}</div>}
      </div>
    </nav>
  );
}

function MobileTabBar({
  tabs,
  activeIndex,
  onTabChange,
  onMenuClick,
}: {
  tabs: TabItem[];
  activeIndex: number;
  onTabChange: (index: number) => void;
  onMenuClick?: () => void;
}) {
  const { t } = useTranslation('crd-space');
  const scrollRef = useRef<HTMLUListElement>(null);
  const activeTabRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeIndex]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border lg:hidden"
      aria-label={t('a11y.mobileTabBar')}
    >
      <div className="flex items-stretch h-14">
        {onMenuClick && (
          <>
            <button
              type="button"
              onClick={onMenuClick}
              className="shrink-0 px-4 flex items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              aria-label={t('mobile.menu')}
              aria-haspopup="dialog"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="w-px h-6 self-center bg-border" aria-hidden="true" />
          </>
        )}
        {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
        {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
        <ul ref={scrollRef} role="list" className={MOBILE_TAB_LIST_CLASSES}>
          {tabs.map(tab => {
            const active = tab.index === activeIndex;
            return (
              <li key={tab.index} ref={active ? activeTabRef : undefined} className="inline-flex items-center shrink-0">
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onTabChange(tab.index)}
                  className={cn(
                    'whitespace-nowrap py-2 px-1 text-control transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
