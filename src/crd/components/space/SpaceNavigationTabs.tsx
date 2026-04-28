import { Menu } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';

type TabItem = {
  label: string;
  index: number;
  href?: string;
};

const MOBILE_TAB_LIST_CLASSES =
  'flex items-center gap-3 flex-1 min-w-0 overflow-x-auto scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] px-3';

type SpaceNavigationTabsProps = {
  tabs: TabItem[];
  activeIndex: number;
  onTabChange: (index: number) => void;
  /** Mobile-only: opens the hamburger drawer. The drawer itself lives in the consumer layout. */
  onMenuClick?: () => void;
  isSmallScreen?: boolean;
  className?: string;
};

export function SpaceNavigationTabs({
  tabs,
  activeIndex,
  onTabChange,
  onMenuClick,
  isSmallScreen,
  className,
}: SpaceNavigationTabsProps) {
  if (isSmallScreen) {
    return <MobileTabBar tabs={tabs} activeIndex={activeIndex} onTabChange={onTabChange} onMenuClick={onMenuClick} />;
  }

  return <DesktopTabs tabs={tabs} activeIndex={activeIndex} onTabChange={onTabChange} className={className} />;
}

function DesktopTabs({
  tabs,
  activeIndex,
  onTabChange,
  className,
}: {
  tabs: TabItem[];
  activeIndex: number;
  onTabChange: (index: number) => void;
  className?: string;
}) {
  const { t } = useTranslation('crd-space');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const activeTab = scrollRef.current.querySelector('[data-active="true"]');
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeIndex]);

  return (
    <nav className={cn('w-full', className)} aria-label={t('a11y.tabNavigation')}>
      <div
        ref={scrollRef}
        className="flex items-center gap-6 overflow-x-auto scrollbar-hide overscroll-x-contain"
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
              className={cn(
                'pb-2 transition-all duration-200 whitespace-nowrap border-b-2 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                active
                  ? 'border-primary text-primary text-card-title'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted text-body-emphasis'
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
        <div className="w-px h-6 self-center bg-border" aria-hidden="true" />
        <button
          type="button"
          onClick={onMenuClick}
          className="shrink-0 px-4 flex items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          aria-label={t('mobile.menu')}
          aria-haspopup="dialog"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
