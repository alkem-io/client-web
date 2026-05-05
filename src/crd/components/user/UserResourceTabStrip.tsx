import { useEffect, useRef } from 'react';
import { cn } from '@/crd/lib/utils';

export type ResourceTabKey = 'resourcesHosted' | 'leading' | 'memberOf';

export type UserResourceTab = {
  key: ResourceTabKey;
  label: string;
};

export type UserResourceTabStripProps = {
  tabs: UserResourceTab[];
  activeTab: ResourceTabKey;
  onSelectTab: (next: ResourceTabKey) => void;
  className?: string;
};

export function UserResourceTabStrip({ tabs, activeTab, onSelectTab, className }: UserResourceTabStripProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const active = buttonRefs.current[activeTab];
    if (active && scrollRef.current) {
      active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeTab]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = tabs.findIndex(tab => tab.key === activeTab);
    if (idx === -1) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const next = event.key === 'ArrowRight' ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
      onSelectTab(tabs[next].key);
      buttonRefs.current[tabs[next].key]?.focus();
    }
  };

  return (
    <div
      className={cn(
        'sticky top-16 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-4 pb-2 mb-8 -mx-4 px-4 md:mx-0 md:px-0 border-b border-border/40',
        className
      )}
    >
      <div
        ref={scrollRef}
        role="tablist"
        aria-label="Resource sections"
        onKeyDown={handleKeyDown}
        className="flex items-center gap-6 overflow-x-auto no-scrollbar"
      >
        {tabs.map(tab => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              ref={el => {
                buttonRefs.current[tab.key] = el;
              }}
              onClick={() => onSelectTab(tab.key)}
              className={cn(
                'text-body-emphasis border-b-2 pb-2 whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
