import { MoreHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Button } from '@/crd/primitives/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/crd/primitives/sheet';

type TabItem = {
  label: string;
  index: number;
};

type MobileAction = {
  label: string;
  icon: ReactNode;
  onClick: () => void;
};

type SpaceNavigationTabsProps = {
  tabs: TabItem[];
  activeIndex: number;
  onTabChange: (index: number) => void;
  mobileActions?: MobileAction[];
  isSmallScreen?: boolean;
  className?: string;
};

export function SpaceNavigationTabs({
  tabs,
  activeIndex,
  onTabChange,
  mobileActions,
  isSmallScreen,
  className,
}: SpaceNavigationTabsProps) {
  if (isSmallScreen) {
    return (
      <MobileTabBar tabs={tabs} activeIndex={activeIndex} onTabChange={onTabChange} mobileActions={mobileActions} />
    );
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
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {tabs.map(tab => {
          const active = tab.index === activeIndex;
          return (
            <button
              key={tab.index}
              type="button"
              role="tab"
              aria-selected={active}
              data-active={active}
              className={cn(
                'pb-2 transition-all duration-200 whitespace-nowrap border-b-2 select-none text-sm cursor-pointer',
                active
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted font-medium'
              )}
              onClick={() => onTabChange(tab.index)}
            >
              {tab.label}
            </button>
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
  mobileActions,
}: {
  tabs: TabItem[];
  activeIndex: number;
  onTabChange: (index: number) => void;
  mobileActions?: MobileAction[];
}) {
  const { t } = useTranslation('crd-space');
  const visibleTabs = tabs.slice(0, 4);
  const hasMore = mobileActions && mobileActions.length > 0;

  return (
    <>
      {/* Fixed bottom bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border"
        aria-label={t('a11y.mobileTabBar')}
      >
        <div className="flex items-center justify-around h-14" role="tablist">
          {visibleTabs.map(tab => {
            const active = tab.index === activeIndex;
            return (
              <button
                key={tab.index}
                type="button"
                role="tab"
                aria-selected={active}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full text-xs transition-colors',
                  active ? 'text-primary font-semibold' : 'text-muted-foreground'
                )}
                onClick={() => onTabChange(tab.index)}
              >
                <span className="truncate max-w-[80px]">{tab.label}</span>
              </button>
            );
          })}
          {hasMore && (
            <Sheet>
              <SheetTrigger asChild={true}>
                <button
                  type="button"
                  className="flex flex-col items-center justify-center flex-1 h-full text-xs text-muted-foreground"
                  aria-label={t('mobile.more')}
                >
                  <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                  <span>{t('mobile.more')}</span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" aria-label={t('a11y.moreActionsDrawer')}>
                <SheetHeader>
                  <SheetTitle>{t('mobile.more')}</SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-2">
                  {/* Overflow tabs */}
                  {tabs.slice(4).map(tab => (
                    <Button
                      key={tab.index}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => onTabChange(tab.index)}
                    >
                      {tab.label}
                    </Button>
                  ))}
                  {/* Action buttons */}
                  {mobileActions?.map(action => (
                    <Button
                      key={action.label}
                      variant="ghost"
                      className="w-full justify-start gap-3"
                      onClick={action.onClick}
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </nav>
      {/* Spacer to prevent content from being hidden behind the fixed bar */}
      <div className="h-14 lg:hidden" />
    </>
  );
}
